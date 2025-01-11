import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Copy, CheckCircle } from "lucide-react";
import { ConsoleLog } from "@/types/repository";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ConsoleOutputProps {
  showConsole: boolean;
  onToggleConsole: () => void;
  logs: ConsoleLog[];
}

export function ConsoleOutput({ showConsole, onToggleConsole, logs }: ConsoleOutputProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyLogs = () => {
    const logText = logs
      .map(log => `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`)
      .join('\n');
    
    navigator.clipboard.writeText(logText).then(() => {
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Console logs have been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="pt-4 border-t border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          <h3 className="text-lg font-medium">Console Output</h3>
          <span className="text-sm text-muted-foreground">
            ({logs.length} entries)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyLogs}
            className="gap-2"
          >
            {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Logs'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleConsole}
          >
            {showConsole ? 'Hide Console' : 'Show Console'}
          </Button>
        </div>
      </div>
      
      {showConsole && (
        <ScrollArea className="h-[300px] w-full rounded-md border bg-black/90 p-4 font-mono text-sm">
          {logs.map((log, index) => (
            <div
              key={index}
              className={`mb-2 ${
                log.type === 'error' ? 'text-red-400' :
                log.type === 'success' ? 'text-green-400' :
                'text-blue-400'
              }`}
            >
              <span className="text-gray-500">[{log.timestamp}]</span>{' '}
              <span className="text-gray-400">{log.type.toUpperCase()}:</span>{' '}
              {log.message}
              {log.data && (
                <pre className="mt-1 ml-8 text-xs text-gray-500 whitespace-pre-wrap">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-gray-500">No console output available</div>
          )}
        </ScrollArea>
      )}
    </div>
  );
}