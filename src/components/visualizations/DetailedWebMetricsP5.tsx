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
  }> = [];

  const categories = {
    performance: ['Page Load Time', 'Page Size', 'Largest Contentful Paint'],
    seo: ['Meta Description', 'H1 Tag', 'Canonical Tag', 'Meta Keywords', 'Title Tag', 'Robots Meta'],
    security: ['HTTPS', 'Content Security Policy', 'X-Frame-Options', 'X-Content-Type-Options'],
    accessibility: ['Image Alt Tags', 'ARIA Labels', 'HTML Lang Attribute', 'Skip Links']
  };

  const categoryColors: Record<string, ColorTuple> = {
    performance: { r: 252, g: 82, b: 74 },
    seo: { r: 56, g: 189, b: 248 },
    security: { r: 34, g: 197, b: 94 },
    accessibility: { r: 168, g: 85, b: 247 },
    other: { r: 156, g: 163, b: 175 } // Default color for unknown categories
  };

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(800, 600).parent(canvasParentRef);
    p5.angleMode(p5.RADIANS);

    // Initialize circles with more detailed positioning
    let angleStep = (2 * Math.PI) / data.length;
    data.forEach((metric, i) => {
      let category = Object.entries(categories).find(([_, metrics]) =>
        metrics.includes(metric.metric)
      )?.[0] || 'other';

      circles.push({
        angle: i * angleStep,
        radius: metric.value === 'Present' || metric.value === 'Yes' ? 150 : 100,
        category,
        value: metric.value,
        pulseOffset: p5.random(0, 2 * Math.PI),
        label: metric.metric
      });
    });
  };

  const draw = (p5: p5Types) => {
    p5.background(20, 25, 35);
    p5.translate(p5.width / 2, p5.height / 2);

    // Draw connecting lines with gradients
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
      
      gradient1.addColorStop(0, `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, 0.3)`);
      gradient1.addColorStop(1, `rgba(${nextColor.r}, ${nextColor.g}, ${nextColor.b}, 0.3)`);
      gradient.strokeStyle = gradient1;
      p5.strokeWeight(2);
      p5.line(
        Math.cos(circle.angle) * circle.radius,
        Math.sin(circle.angle) * circle.radius,
        Math.cos(nextCircle.angle) * nextCircle.radius,
        Math.sin(nextCircle.angle) * nextCircle.radius
      );
    });

    // Draw enhanced circles and labels
    circles.forEach((circle) => {
      let x = Math.cos(circle.angle) * circle.radius;
      let y = Math.sin(circle.angle) * circle.radius;
      
      // Enhanced pulse effect
      let pulseSize = p5.sin(p5.frameCount * 0.05 + circle.pulseOffset) * 8;
      
      // Draw outer glow for present/yes values
      if (circle.value === 'Present' || circle.value === 'Yes') {
        const color = categoryColors[circle.category] || categoryColors.other;
        for (let i = 4; i > 0; i--) {
          p5.noStroke();
          p5.fill(color.r, color.g, color.b, 15);
          p5.circle(x, y, 50 + pulseSize + i * 5);
        }
      }

      // Draw main circle with gradient
      p5.noStroke();
      const color = categoryColors[circle.category] || categoryColors.other;
      p5.fill(color.r, color.g, color.b, 200);
      p5.circle(x, y, 40);

      // Enhanced label rendering
      p5.fill(255);
      p5.textSize(12);
      p5.textAlign(p5.CENTER);
      p5.push();
      p5.translate(x, y + 30);
      p5.rotate(circle.angle > Math.PI / 2 && circle.angle < 3 * Math.PI / 2 ? Math.PI : 0);
      // Draw label background
      p5.noStroke();
      p5.fill(0, 0, 0, 100);
      let labelWidth = p5.textWidth(circle.label) + 10;
      p5.rect(-labelWidth/2, -10, labelWidth, 20, 5);
      // Draw label text
      p5.fill(255);
      p5.text(circle.label, 0, 5);
      p5.pop();

      // Draw value indicator
      p5.push();
      p5.translate(x, y - 30);
      p5.fill(circle.value === 'Present' || circle.value === 'Yes' ? '#4ade80' : '#ef4444');
      p5.textSize(10);
      p5.text(circle.value, 0, 0);
      p5.pop();
    });

    // Draw enhanced center circle
    p5.noStroke();
    for (let i = 4; i > 0; i--) {
      p5.fill(252, 82, 74, 25);
      p5.circle(0, 0, 70 + p5.sin(p5.frameCount * 0.05) * 8 + i * 5);
    }
    p5.fill(252, 82, 74, 200);
    p5.circle(0, 0, 60);
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Detailed Interactive Visualization</h3>
      <Sketch setup={setup} draw={draw} />
    </Card>
  );
};