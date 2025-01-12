export interface WebsiteMetrics {
  metric: string;
  value: string;
}

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const analyzeWebsite = async (url: string): Promise<WebsiteMetrics[]> => {
  const startTime = performance.now();
  
  try {
    // Fetch the website with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebAnalyzer/1.0;)'
      }
    });
    clearTimeout(timeoutId);
    
    const html = await response.text();
    const headers = response.headers;
    
    // Calculate load time
    const loadTime = ((performance.now() - startTime) / 1000).toFixed(2);
    
    // Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const metrics: WebsiteMetrics[] = [];

    // Performance Metrics
    metrics.push(
      { metric: "Page Load Time", value: `${loadTime}s` },
      { metric: "Page Size", value: `${(html.length / 1024).toFixed(2)}KB` },
      { metric: "Images Count", value: `${doc.getElementsByTagName('img').length}` },
      { metric: "Scripts Count", value: `${doc.getElementsByTagName('script').length}` },
      { metric: "Stylesheets Count", value: `${doc.getElementsByTagName('link').length}` }
    );

    // Basic SEO Metrics
    metrics.push(
      { metric: "Meta Description", value: doc.querySelector('meta[name="description"]') ? "Present" : "Missing" },
      { metric: "Meta Keywords", value: doc.querySelector('meta[name="keywords"]') ? "Present" : "Missing" },
      { metric: "Title Tag", value: doc.title ? "Present" : "Missing" },
      { metric: "H1 Tag", value: doc.querySelector('h1') ? "Present" : "Missing" },
      { metric: "Canonical Tag", value: doc.querySelector('link[rel="canonical"]') ? "Present" : "Missing" },
      { metric: "Robots Meta", value: doc.querySelector('meta[name="robots"]') ? "Present" : "Missing" },
      { metric: "Mobile Viewport", value: doc.querySelector('meta[name="viewport"]') ? "Present" : "Missing" }
    );

    // Technical SEO
    metrics.push(
      { metric: "HTTPS", value: url.startsWith("https") ? "Yes" : "No" },
      { metric: "Sitemap", value: await checkSitemapExists(url) },
      { metric: "Robots.txt", value: await checkRobotsExists(url) },
      { metric: "Schema Markup", value: doc.querySelector('script[type="application/ld+json"]') ? "Present" : "Missing" }
    );

    // Social Media
    metrics.push(
      { metric: "Open Graph Tags", value: doc.querySelector('meta[property^="og:"]') ? "Present" : "Missing" },
      { metric: "Twitter Cards", value: doc.querySelector('meta[name^="twitter:"]') ? "Present" : "Missing" }
    );

    // Accessibility
    const images = doc.getElementsByTagName('img');
    const imagesWithAlt = Array.from(images).filter(img => img.hasAttribute('alt'));
    metrics.push(
      { metric: "Image Alt Tags", value: imagesWithAlt.length === images.length ? "All Present" : 
                                       imagesWithAlt.length > 0 ? "Partially Present" : "Missing" },
      { metric: "HTML Lang Attribute", value: doc.documentElement.hasAttribute('lang') ? "Present" : "Missing" },
      { metric: "ARIA Labels", value: doc.querySelector('[aria-label]') ? "Present" : "Missing" },
      { metric: "Skip Links", value: doc.querySelector('a[href^="#main"]') ? "Present" : "Missing" }
    );

    // Advanced Technical
    metrics.push(
      { metric: "Content Security Policy", value: headers.get('content-security-policy') ? "Present" : "Missing" },
      { metric: "X-Frame-Options", value: headers.get('x-frame-options') ? "Present" : "Missing" },
      { metric: "X-Content-Type-Options", value: headers.get('x-content-type-options') ? "Present" : "Missing" },
      { metric: "Structured Data", value: doc.querySelector('script[type="application/ld+json"]') ? "Present" : "Missing" },
      { metric: "AMP Version", value: doc.querySelector('link[rel="amphtml"]') ? "Present" : "Missing" },
      { metric: "Web App Manifest", value: doc.querySelector('link[rel="manifest"]') ? "Present" : "Missing" }
    );
    
    return metrics;
  } catch (error) {
    console.error('Error analyzing website:', error);
    throw new Error('Failed to analyze website');
  }
};

const checkSitemapExists = async (url: string): Promise<string> => {
  try {
    const sitemapUrl = new URL('/sitemap.xml', url);
    const response = await fetch(sitemapUrl.toString(), { method: 'HEAD' });
    return response.ok ? "Present" : "Missing";
  } catch {
    return "Missing";
  }
};

const checkRobotsExists = async (url: string): Promise<string> => {
  try {
    const robotsUrl = new URL('/robots.txt', url);
    const response = await fetch(robotsUrl.toString(), { method: 'HEAD' });
    return response.ok ? "Present" : "Missing";
  } catch {
    return "Missing";
  }
};