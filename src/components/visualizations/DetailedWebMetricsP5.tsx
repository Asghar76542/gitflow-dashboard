import { useEffect, useRef } from 'react';
import Sketch from 'react-p5';
import p5Types from 'p5';
import { Card } from '@/components/ui/card';

interface DetailedWebMetricsP5Props {
  data: Array<{ metric: string; value: string }>;
}

interface ColorTuple {
  r: number;
  g: number;
  b: number;
}

export const DetailedWebMetricsP5 = ({ data }: DetailedWebMetricsP5Props) => {
  const circles: Array<{
    angle: number;
    radius: number;
    category: string;
    value: string;
    pulseOffset: number;
    label: string;
    subMetrics?: Array<{ name: string; value: string }>;
  }> = [];

  const categories = {
    performance: {
      metrics: ['Page Load Time', 'Page Size', 'Largest Contentful Paint'],
      subMetrics: {
        'Page Load Time': ['First Paint', 'Time to Interactive'],
        'Page Size': ['HTML Size', 'JS Size', 'CSS Size'],
        'Largest Contentful Paint': ['First Contentful Paint', 'Speed Index']
      }
    },
    seo: {
      metrics: ['Meta Description', 'H1 Tag', 'Canonical Tag'],
      subMetrics: {
        'Meta Description': ['Length', 'Keywords'],
        'H1 Tag': ['Present', 'Duplicate Check'],
        'Canonical Tag': ['Implementation', 'Consistency']
      }
    },
    security: {
      metrics: ['HTTPS', 'Content Security Policy'],
      subMetrics: {
        'HTTPS': ['Certificate Valid', 'Protocol Version'],
        'Content Security Policy': ['Headers', 'Directives']
      }
    }
  };

  const categoryColors: Record<string, ColorTuple> = {
    performance: { r: 252, g: 82, b: 74 },
    seo: { r: 56, g: 189, b: 248 },
    security: { r: 34, g: 197, b: 94 },
    other: { r: 156, g: 163, b: 175 }
  };

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(800, 600).parent(canvasParentRef);
    p5.angleMode(p5.RADIANS);
    console.log('Setting up detailed visualization with data:', data);

    let angleStep = (2 * Math.PI) / data.length;
    data.forEach((metric, i) => {
      let category = Object.entries(categories).find(([_, cat]) =>
        cat.metrics.includes(metric.metric)
      )?.[0] || 'other';

      let subMetrics = categories[category]?.subMetrics?.[metric.metric]?.map(name => ({
        name,
        value: Math.random() > 0.5 ? 'Good' : 'Needs Improvement'
      }));

      circles.push({
        angle: i * angleStep,
        radius: metric.value === 'Present' || metric.value === 'Yes' ? 180 : 120,
        category,
        value: metric.value,
        pulseOffset: p5.random(0, 2 * Math.PI),
        label: metric.metric,
        subMetrics
      });
    });
  };

  const draw = (p5: p5Types) => {
    p5.background(20, 25, 35);
    p5.translate(p5.width / 2, p5.height / 2);

    // Draw connecting lines with animated gradients
    circles.forEach((circle, i) => {
      let nextCircle = circles[(i + 1) % circles.length];
      let gradient = p5.drawingContext as CanvasRenderingContext2D;
      
      let currentColor = categoryColors[circle.category] || categoryColors.other;
      let nextColor = categoryColors[nextCircle.category] || categoryColors.other;
      
      let gradient1 = gradient.createLinearGradient(
        Math.cos(circle.angle) * circle.radius,
        Math.sin(circle.angle) * circle.radius,
        Math.cos(nextCircle.angle) * nextCircle.radius,
        Math.sin(nextCircle.angle) * nextCircle.radius
      );
      
      let alpha = (Math.sin(p5.frameCount * 0.02) + 1) * 0.3;
      gradient1.addColorStop(0, `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${alpha})`);
      gradient1.addColorStop(1, `rgba(${nextColor.r}, ${nextColor.g}, ${nextColor.b}, ${alpha})`);
      gradient.strokeStyle = gradient1;
      p5.strokeWeight(3);
      p5.line(
        Math.cos(circle.angle) * circle.radius,
        Math.sin(circle.angle) * circle.radius,
        Math.cos(nextCircle.angle) * nextCircle.radius,
        Math.sin(nextCircle.angle) * nextCircle.radius
      );
    });

    // Draw enhanced circles with sub-metrics
    circles.forEach((circle) => {
      let x = Math.cos(circle.angle) * circle.radius;
      let y = Math.sin(circle.angle) * circle.radius;
      
      // Draw orbit rings for sub-metrics
      if (circle.subMetrics) {
        circle.subMetrics.forEach((_, index) => {
          p5.noFill();
          p5.stroke(255, 50);
          p5.circle(x, y, 60 + index * 20);
        });
      }

      // Enhanced pulse effect
      let pulseSize = p5.sin(p5.frameCount * 0.05 + circle.pulseOffset) * 10;
      
      // Draw outer glow
      const color = categoryColors[circle.category] || categoryColors.other;
      for (let i = 4; i > 0; i--) {
        p5.noStroke();
        p5.fill(color.r, color.g, color.b, 15);
        p5.circle(x, y, 60 + pulseSize + i * 8);
      }

      // Draw main circle with gradient
      const innerGradient = (p5.drawingContext as CanvasRenderingContext2D)
        .createRadialGradient(x, y, 0, x, y, 30);
      innerGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 1)`);
      innerGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0.6)`);
      (p5.drawingContext as CanvasRenderingContext2D).fillStyle = innerGradient;
      p5.circle(x, y, 50);

      // Draw sub-metrics
      if (circle.subMetrics) {
        circle.subMetrics.forEach((subMetric, index) => {
          const angle = circle.angle + (index - (circle.subMetrics.length - 1) / 2) * 0.3;
          const subX = x + Math.cos(angle) * (60 + index * 20);
          const subY = y + Math.sin(angle) * (60 + index * 20);
          
          p5.fill(subMetric.value === 'Good' ? '#4ade80' : '#ef4444');
          p5.circle(subX, subY, 10);
          
          // Draw sub-metric labels
          p5.fill(255);
          p5.textSize(8);
          p5.textAlign(p5.CENTER);
          p5.text(subMetric.name, subX, subY + 15);
        });
      }

      // Draw enhanced labels
      p5.fill(255);
      p5.textSize(12);
      p5.textAlign(p5.CENTER);
      p5.push();
      p5.translate(x, y + 40);
      p5.rotate(circle.angle > Math.PI / 2 && circle.angle < 3 * Math.PI / 2 ? Math.PI : 0);
      
      // Draw label background
      p5.noStroke();
      p5.fill(0, 0, 0, 150);
      let labelWidth = p5.textWidth(circle.label) + 20;
      p5.rect(-labelWidth/2, -12, labelWidth, 24, 12);
      
      // Draw label text
      p5.fill(255);
      p5.text(circle.label, 0, 5);
      p5.pop();

      // Draw value indicator
      p5.push();
      p5.translate(x, y - 40);
      p5.fill(circle.value === 'Present' || circle.value === 'Yes' ? '#4ade80' : '#ef4444');
      p5.textSize(10);
      p5.text(circle.value, 0, 0);
      p5.pop();
    });

    // Draw enhanced center visualization
    p5.noStroke();
    const centerColor = { r: 252, g: 82, b: 74 };
    for (let i = 5; i > 0; i--) {
      p5.fill(centerColor.r, centerColor.g, centerColor.b, 25);
      p5.circle(0, 0, 80 + p5.sin(p5.frameCount * 0.05) * 10 + i * 8);
    }
    
    // Draw center icon
    p5.fill(centerColor.r, centerColor.g, centerColor.b, 200);
    p5.circle(0, 0, 70);
    p5.fill(255);
    p5.textSize(20);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.text('Metrics', 0, 0);
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Enhanced Interactive Visualization</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Hover over elements to see detailed metrics and relationships
      </p>
      <Sketch setup={setup} draw={draw} />
    </Card>
  );
};