import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface MonitoringPanelProps {
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
}

export const MonitoringPanel = ({ isMonitoring, onToggleMonitoring }: MonitoringPanelProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Live Monitoring</CardTitle>
        <Badge variant={isMonitoring ? "default" : "secondary"}>
          {isMonitoring ? "Active" : "Inactive"}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Switch
            checked={isMonitoring}
            onCheckedChange={onToggleMonitoring}
            aria-label="Toggle monitoring"
          />
          <span className="text-sm text-muted-foreground">
            {isMonitoring ? "Monitoring enabled (30s intervals)" : "Click to enable monitoring"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};