import { useState, useEffect } from "react";
import { WebMetricsForm } from "@/components/web-tools/WebMetricsForm";
import { MetricsDisplay } from "@/components/web-tools/MetricsDisplay";
import { DetailedWebMetricsD3 } from "@/components/visualizations/DetailedWebMetricsD3";
import { DetailedWebMetricsHighcharts } from "@/components/visualizations/DetailedWebMetricsHighcharts";
import { DetailedWebMetricsP5 } from "@/components/visualizations/DetailedWebMetricsP5";
import { MonitoringPanel } from "@/components/web-tools/MonitoringPanel";
import { UrlHistory } from "@/components/web-tools/UrlHistory";
import { useToast } from "@/components/ui/use-toast";
import { analyzeWebsite } from "@/utils/websiteAnalyzer";

const MAX_HISTORY = 5;
const URL_HISTORY_KEY = 'url-history';

export default function WebTools() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metrics, setMetrics] = useState<Array<{ metric: string; value: string }>>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [urlHistory, setUrlHistory] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedHistory = localStorage.getItem(URL_HISTORY_KEY);
    if (savedHistory) {
      setUrlHistory(JSON.parse(savedHistory));
    }
  }, []);

  const addToHistory = (url: string) => {
    const newHistory = [url, ...urlHistory.filter(u => u !== url)].slice(0, MAX_HISTORY);
    setUrlHistory(newHistory);
    localStorage.setItem(URL_HISTORY_KEY, JSON.stringify(newHistory));
  };

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true);
    try {
      const results = await analyzeWebsite(url);
      setMetrics(results);
      addToHistory(url);
      toast({
        title: "Analysis Complete",
        description: "Website metrics have been analyzed successfully.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze website",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <WebMetricsForm onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
        </div>
        <div>
          <UrlHistory urls={urlHistory} onSelectUrl={handleAnalyze} />
        </div>
      </div>

      {metrics.length > 0 && (
        <div className="space-y-8">
          <MetricsDisplay metrics={metrics} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DetailedWebMetricsD3 data={metrics} />
            <DetailedWebMetricsHighcharts data={metrics} />
          </div>
          
          <DetailedWebMetricsP5 data={metrics} />
          
          <MonitoringPanel isMonitoring={isMonitoring} onToggleMonitoring={toggleMonitoring} />
        </div>
      )}
    </div>
  );
}