"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AreaChartProps {
  title: string;
  subtitle?: string;
  data?: any;
  period?: string;
  filter?: string[];
  selectedFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export function AreaChart({
  title,
  subtitle,
  data,
  period = "Last 3 months",
  filter = ["Last 3 months", "Last 30 days", "Last 7 days"],
  selectedFilter = "Last 3 months",
  onFilterChange,
}: AreaChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulate chart data
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Draw the area chart
    const drawAreaChart = () => {
      if (!ctx) return;

      // Generate random data points
      const dataPoints = 30;
      const data1 = Array.from({ length: dataPoints }, () => Math.random() * 80 + 20);
      const data2 = Array.from({ length: dataPoints }, () => Math.random() * 60 + 10);

      const width = canvas.width;
      const height = canvas.height;
      const padding = 20;
      const chartWidth = width - padding * 2;
      const chartHeight = height - padding * 2;

      // Draw grid lines
      ctx.beginPath();
      ctx.strokeStyle = "rgba(200, 200, 200, 0.2)";
      ctx.lineWidth = 1;

      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
      }

      // Vertical grid lines
      for (let i = 0; i <= 10; i++) {
        const x = padding + (chartWidth / 10) * i;
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
      }
      ctx.stroke();

      // Draw first area
      ctx.beginPath();
      ctx.moveTo(padding, height - padding);
      
      // Draw the line for data1
      for (let i = 0; i < dataPoints; i++) {
        const x = padding + (chartWidth / (dataPoints - 1)) * i;
        const y = height - padding - (data1[i] / 100) * chartHeight;
        ctx.lineTo(x, y);
      }
      
      // Complete the area by drawing to the bottom right and then bottom left
      ctx.lineTo(width - padding, height - padding);
      ctx.lineTo(padding, height - padding);
      
      // Fill the area
      const gradient1 = ctx.createLinearGradient(0, 0, 0, height);
      gradient1.addColorStop(0, "rgba(99, 102, 241, 0.2)");
      gradient1.addColorStop(1, "rgba(99, 102, 241, 0.0)");
      ctx.fillStyle = gradient1;
      ctx.fill();
      
      // Draw the line on top of the area
      ctx.beginPath();
      for (let i = 0; i < dataPoints; i++) {
        const x = padding + (chartWidth / (dataPoints - 1)) * i;
        const y = height - padding - (data1[i] / 100) * chartHeight;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = "rgba(99, 102, 241, 0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw second area
      ctx.beginPath();
      ctx.moveTo(padding, height - padding);
      
      // Draw the line for data2
      for (let i = 0; i < dataPoints; i++) {
        const x = padding + (chartWidth / (dataPoints - 1)) * i;
        const y = height - padding - (data2[i] / 100) * chartHeight;
        ctx.lineTo(x, y);
      }
      
      // Complete the area
      ctx.lineTo(width - padding, height - padding);
      ctx.lineTo(padding, height - padding);
      
      // Fill the area
      const gradient2 = ctx.createLinearGradient(0, 0, 0, height);
      gradient2.addColorStop(0, "rgba(168, 85, 247, 0.2)");
      gradient2.addColorStop(1, "rgba(168, 85, 247, 0.0)");
      ctx.fillStyle = gradient2;
      ctx.fill();
      
      // Draw the line on top of the area
      ctx.beginPath();
      for (let i = 0; i < dataPoints; i++) {
        const x = padding + (chartWidth / (dataPoints - 1)) * i;
        const y = height - padding - (data2[i] / 100) * chartHeight;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = "rgba(168, 85, 247, 0.8)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw x-axis labels
      ctx.fillStyle = "rgba(100, 100, 100, 0.8)";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      
      const months = ["Apr 2", "Apr 6", "Apr 10", "Apr 14", "Apr 18", "Apr 23", "Apr 28", 
                      "May 3", "May 7", "May 12", "May 17", "May 22", "May 27", 
                      "Jun 1", "Jun 5", "Jun 9", "Jun 14", "Jun 19", "Jun 24", "Jun 30"];
      
      // Only show a subset of labels to avoid overcrowding
      const labelCount = 10;
      const step = Math.ceil(months.length / labelCount);
      
      for (let i = 0; i < months.length; i += step) {
        const x = padding + (chartWidth / (months.length - 1)) * i;
        ctx.fillText(months[i], x, height - 5);
      }
    };

    drawAreaChart();

    // Redraw on window resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawAreaChart();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedFilter]);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex gap-2">
            {filter.map((item) => (
              <Button
                key={item}
                variant={selectedFilter === item ? "secondary" : "outline"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => onFilterChange && onFilterChange(item)}
              >
                {item}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        <div className="h-[300px] w-full relative">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      </CardContent>
    </Card>
  );
}