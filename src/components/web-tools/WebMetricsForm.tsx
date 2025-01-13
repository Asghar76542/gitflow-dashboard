import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface WebMetricsFormProps {
  onAnalyze: (url: string) => void;
  isLoading?: boolean;
}

export const WebMetricsForm: React.FC<WebMetricsFormProps> = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Clean and validate the URL
      let cleanUrl = url.trim();
      
      // Add protocol if missing
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
      }
      
      // Remove trailing colons and slashes
      cleanUrl = cleanUrl.replace(/[:/]+$/, '');
      
      // Validate URL format
      const urlObject = new URL(cleanUrl);
      
      console.log('Analyzing URL:', urlObject.toString());
      onAnalyze(urlObject.toString());
    } catch (error) {
      console.error('Invalid URL format:', error);
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Please enter a valid website URL",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 items-center">
      <Input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter website URL"
        className="flex-1"
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Analyzing..." : "Analyze"}
      </Button>
    </form>
  );
};