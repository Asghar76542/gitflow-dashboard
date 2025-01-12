import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ExternalLink } from "lucide-react";

interface UrlHistoryProps {
  urls: string[];
  onSelectUrl: (url: string) => void;
}

export const UrlHistory = ({ urls, onSelectUrl }: UrlHistoryProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent URLs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {urls.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent URLs</p>
          ) : (
            urls.map((url, index) => (
              <div key={index} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-accent">
                <span className="text-sm truncate flex-1">{url}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectUrl(url)}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Analyze
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};