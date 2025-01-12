import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Octokit } from 'https://esm.sh/octokit'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const log = {
  success: (message: string, data?: any) => {
    console.log('\x1b[32m%s\x1b[0m', '✓ SUCCESS:', message);
    if (data) console.log(JSON.stringify(data, null, 2));
    return { type: 'success', message, data, timestamp: new Date().toISOString() };
  },
  error: (message: string, error?: any) => {
    console.error('\x1b[31m%s\x1b[0m', '✗ ERROR:', message);
    if (error) console.error(error);
    return { type: 'error', message, error, timestamp: new Date().toISOString() };
  },
  info: (message: string, data?: any) => {
    console.log('\x1b[36m%s\x1b[0m', 'ℹ INFO:', message);
    if (data) console.log(JSON.stringify(data, null, 2));
    return { type: 'info', message, data, timestamp: new Date().toISOString() };
  }
};

const parseGitHubUrl = (url: string) => {
  try {
    const regex = /github\.com\/([^\/]+)\/([^\/\.]+)/;
    const match = url.match(regex);
    
    if (!match) {
      throw new Error(`Invalid GitHub URL: ${url}`);
    }

    return {
      owner: match[1],
      repo: match[2].replace('.git', '')
    };
  } catch (error) {
    log.error('Error parsing GitHub URL:', error);
    throw error;
  }
};

async function getRepoDetails(url: string, octokit: Octokit) {
  const logs = [];
  try {
    logs.push(log.info('Starting repository details fetch', { url }));
    
    const { owner, repo } = parseGitHubUrl(url);
    logs.push(log.info('Parsed GitHub URL', { owner, repo }));

    const [repoInfo, branches, lastCommits] = await Promise.all([
      octokit.rest.repos.get({ owner, repo }),
      octokit.rest.repos.listBranches({ owner, repo }),
      octokit.rest.repos.listCommits({ owner, repo, per_page: 5 })
    ]);

    logs.push(log.success('Repository details fetched successfully', {
      defaultBranch: repoInfo.data.default_branch,
      branchCount: branches.data.length,
      commitCount: lastCommits.data.length
    }));

    return {
      logs,
      details: {
        defaultBranch: repoInfo.data.default_branch,
        branches: branches.data.map(b => ({
          name: b.name,
          protected: b.protected,
          sha: b.commit.sha
        })),
        lastCommits: lastCommits.data.map(c => ({
          sha: c.sha,
          message: c.commit.message,
          date: c.commit.author?.date,
          author: c.commit.author?.name
        }))
      }
    };
  } catch (error) {
    logs.push(log.error('Error fetching repository details', error));
    throw { error, logs };
  }
}

async function ensureRef(octokit: Octokit, owner: string, repo: string, ref: string, sha: string, force: boolean) {
  const logs = [];
  try {
    logs.push(log.info('Ensuring reference exists', { owner, repo, ref, sha, force }));
    
    let refExists = false;
    try {
      // Try to get the reference first
      await octokit.rest.git.getRef({
        owner,
        repo,
        ref: ref.replace('refs/', '')
      });
      refExists = true;
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
      // 404 means ref doesn't exist, which is fine - we'll create it
    }

    if (refExists) {
      // If reference exists, update it
      logs.push(log.info('Reference exists, updating it', { ref, force }));
      const updateResponse = await octokit.rest.git.updateRef({
        owner,
        repo,
        ref: ref.replace('refs/', ''),
        sha,
        force
      });
      
      logs.push(log.success('Reference updated successfully', { ref: updateResponse.data.ref }));
      return updateResponse;
    } else {
      // Reference doesn't exist, create it
      logs.push(log.info('Reference does not exist, creating it', { ref }));
      const createResponse = await octokit.rest.git.createRef({
        owner,
        repo,
        ref,
        sha
      });
      
      logs.push(log.success('Reference created successfully', { ref: createResponse.data.ref }));
      return createResponse;
    }
  } catch (error) {
    logs.push(log.error('Error ensuring reference', error));
    throw { error, logs };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const logs = [];
  
  try {
    const { type, sourceRepoId, targetRepoId, pushType } = await req.json();
    logs.push(log.info('Received operation request', { type, sourceRepoId, targetRepoId, pushType }));

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create operation log entry
    const { data: operationLog, error: logError } = await supabaseClient
      .from('git_operations_log')
      .insert({
        source_repo_id: sourceRepoId,
        target_repo_id: targetRepoId,
        operation_type: type,
        push_type: pushType,
        status: 'started'
      })
      .select()
      .single();

    if (logError) {
      logs.push(log.error('Error creating operation log', logError));
      throw logError;
    }

    const githubToken = Deno.env.get('GITHUB_ACCESS_TOKEN');
    if (!githubToken) {
      logs.push(log.error('GitHub token not found'));
      throw new Error('GitHub token not configured');
    }

    const octokit = new Octokit({
      auth: githubToken
    });

    if (type === 'push') {
      logs.push(log.info('Starting Git push operation', { sourceRepoId, targetRepoId, pushType }));
      
      // Fetch source and target repo details
      const { data: sourceRepo } = await supabaseClient
        .from('repositories')
        .select('*')
        .eq('id', sourceRepoId)
        .single();
      
      const { data: targetRepo } = await supabaseClient
        .from('repositories')
        .select('*')
        .eq('id', targetRepoId)
        .single();

      if (!sourceRepo || !targetRepo) {
        logs.push(log.error('Repository not found', { sourceRepoId, targetRepoId }));
        throw new Error('Repository not found');
      }

      logs.push(log.info('Repositories found', {
        source: { url: sourceRepo.url, branch: sourceRepo.default_branch },
        target: { url: targetRepo.url, branch: targetRepo.default_branch }
      }));

      // Get latest commit from source
      const sourceDetails = await getRepoDetails(sourceRepo.url, octokit);
      logs.push(...sourceDetails.logs);

      const sourceCommit = sourceDetails.details.lastCommits[0];
      if (!sourceCommit) {
        logs.push(log.error('No commits found in source repository'));
        throw new Error('No commits found in source repository');
      }

      logs.push(log.info('Source commit details', {
        sha: sourceCommit.sha,
        message: sourceCommit.message,
        date: sourceCommit.date
      }));

      // Update target repository
      const { owner: targetOwner, repo: targetRepoName } = parseGitHubUrl(targetRepo.url);
      const branchRef = `refs/heads/${targetRepo.default_branch || 'main'}`;
      
      try {
        const useForce = pushType === 'force' || pushType === 'force-with-lease';
        const result = await ensureRef(
          octokit,
          targetOwner,
          targetRepoName,
          branchRef,
          sourceCommit.sha,
          useForce
        );

        logs.push(log.success('Push operation completed', {
          targetRepo: targetRepo.url,
          ref: result.data.ref,
          sha: result.data.object.sha
        }));

        // Update repository status in database
        await supabaseClient
          .from('repositories')
          .update({
            last_commit: sourceCommit.sha,
            last_commit_date: sourceCommit.date,
            last_sync: new Date().toISOString(),
            status: 'synced'
          })
          .eq('id', targetRepoId);

        // Update operation log
        await supabaseClient
          .from('git_operations_log')
          .update({
            status: 'completed',
            commit_hash: sourceCommit.sha,
            completed_at: new Date().toISOString()
          })
          .eq('id', operationLog.id);

        logs.push(log.success('Repository status updated in database'));

      } catch (error) {
        logs.push(log.error('Push operation failed', error));
        
        // Update operation log with error
        await supabaseClient
          .from('git_operations_log')
          .update({
            status: 'failed',
            error_message: error.message || 'Unknown error occurred',
            completed_at: new Date().toISOString()
          })
          .eq('id', operationLog.id);
          
        throw error;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        logs,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    logs.push(log.error('Operation failed', error));
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred',
        logs,
        details: error
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    );
  }
});
