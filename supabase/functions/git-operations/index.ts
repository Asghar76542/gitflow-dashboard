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
    if (error) {
      console.error('\x1b[31m%s\x1b[0m', '  Details:');
      if (error.status) console.error('\x1b[31m%s\x1b[0m', `  Status: ${error.status}`);
      if (error.message) console.error('\x1b[31m%s\x1b[0m', `  Message: ${error.message}`);
      if (error.response?.data) {
        console.error('\x1b[31m%s\x1b[0m', '  Response Data:');
        console.error(JSON.stringify(error.response.data, null, 2));
      }
    }
    return { type: 'error', message, error, timestamp: new Date().toISOString() };
  },
  info: (message: string, data?: any) => {
    console.log('\x1b[36m%s\x1b[0m', 'ℹ INFO:', message);
    if (data) console.log(JSON.stringify(data, null, 2));
    return { type: 'info', message, data, timestamp: new Date().toISOString() };
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

async function createOrUpdateRef(octokit: Octokit, owner: string, repo: string, ref: string, sha: string, force: boolean) {
  try {
    // First try to get the reference
    try {
      await octokit.rest.git.getRef({
        owner,
        repo,
        ref: ref.replace('refs/', '')
      });
      
      // If reference exists, update it
      return await octokit.rest.git.updateRef({
        owner,
        repo,
        ref: ref.replace('refs/', ''),
        sha,
        force
      });
    } catch (error) {
      if (error.status === 404) {
        // If reference doesn't exist, create it
        return await octokit.rest.git.createRef({
          owner,
          repo,
          ref,
          sha
        });
      }
      throw error;
    }
  } catch (error) {
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      }
    });
  }

  const logs = [];
  
  try {
    const { type, sourceRepoId, targetRepoId, pushType } = await req.json();
    logs.push(log.info('Received operation request', { type, sourceRepoId, targetRepoId, pushType }));

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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
        const updateRef = await createOrUpdateRef(
          octokit,
          targetOwner,
          targetRepoName,
          branchRef,
          sourceCommit.sha,
          pushType === 'force' || pushType === 'force-with-lease'
        );

        logs.push(log.success('Push operation completed', {
          targetRepo: targetRepo.url,
          ref: updateRef.data.ref,
          sha: updateRef.data.object.sha
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

        logs.push(log.success('Repository status updated in database'));

      } catch (error) {
        logs.push(log.error('Push operation failed', error));
        throw error;
      }
    }

    if (type === 'getLastCommit') {
      logs.push(log.info('Getting repository details', { sourceRepoId }));
      
      const { data: repoData, error: repoError } = await supabaseClient
        .from('repositories')
        .select('url')
        .eq('id', sourceRepoId)
        .single();

      if (repoError) {
        logs.push(log.error('Error fetching repository', repoError));
        throw repoError;
      }

      if (!repoData?.url) {
        logs.push(log.error('Repository URL not found'));
        throw new Error('Repository URL not found');
      }

      const repoDetails = await getRepoDetails(repoData.url, octokit);
      logs.push(...repoDetails.logs);

      const lastCommit = repoDetails.details.lastCommits[0];
      
      const { error: updateError } = await supabaseClient
        .from('repositories')
        .update({
          last_commit: lastCommit.sha,
          last_commit_date: lastCommit.date,
          last_sync: new Date().toISOString(),
          status: 'synced',
          default_branch: repoDetails.details.defaultBranch,
          branches: repoDetails.details.branches,
          recent_commits: repoDetails.details.lastCommits
        })
        .eq('id', sourceRepoId);

      if (updateError) {
        logs.push(log.error('Error updating repository', updateError));
        throw updateError;
      }

      logs.push(log.success('Repository updated successfully'));
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
        details: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
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