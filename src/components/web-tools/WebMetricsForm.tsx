import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WebMetricsFormProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export const WebMetricsForm = ({ onAnalyze, isLoading }: WebMetricsFormProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Clean and validate the URL
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
      }
      
      // Remove any trailing colons or slashes
      cleanUrl = cleanUrl.replace(/[:\/]+$/, '');
      
      // Create URL object to validate format
      new URL(cleanUrl);
      
      console.log('Analyzing URL:', cleanUrl);
      onAnalyze(cleanUrl);
    } catch (error) {
      console.error('Invalid URL format:', error);
      // You might want to show a toast or error message here
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Website Analysis Tool</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="url"
            placeholder="Enter website URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            required
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Analyzing..." : "Analyze"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};