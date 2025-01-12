import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Card } from '@/components/ui/card';

interface DetailedWebMetricsHighchartsProps {
  data: Array<{ metric: string; value: string }>;
}

export const DetailedWebMetricsHighcharts = ({ data }: DetailedWebMetricsHighchartsProps) => {
  const presenceData = data.filter(d => 
    d.value === 'Present' || d.value === 'Missing' || d.value === 'Yes' || d.value === 'No'
  ).map(d => ({
    name: d.metric,
    y: d.value === 'Present' || d.value === 'Yes' ? 1 : 0,
    color: d.value === 'Present' || d.value === 'Yes' ? '#4ade80' : '#ef4444',
    status: d.value
  }));

  const options: Highcharts.Options = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: '400px'
    },
    title: {
      text: 'Detailed Feature Analysis',
      style: { color: 'hsl(var(--foreground))' }
    },
    tooltip: {
      pointFormat: '<b>{point.name}</b><br>Status: {point.status}<br>Percentage: {point.percentage:.1f}%'
    },
    accessibility: {
      point: {
        valueSuffix: '%'
      }
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>',
          style: {
            color: 'hsl(var(--foreground))',
            textOutline: 'none'
          }
        },
        showInLegend: true
      }
    },
    legend: {
      itemStyle: {
        color: 'hsl(var(--foreground))'
      }
    },
    series: [{
      type: 'pie',
      name: 'Features',
      data: presenceData
    }]
  };

  return (
    <Card className="p-6">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </Card>
  );
};