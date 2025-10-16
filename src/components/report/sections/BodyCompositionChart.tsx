import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';

interface BodyCompositionChartProps {
  leanMass: number;
  fatMass: number;
}

const BodyCompositionChart = ({ leanMass, fatMass }: BodyCompositionChartProps) => {
  const data = [
    { name: 'Massa Magra', value: leanMass, color: 'hsl(var(--primary))' },
    { name: 'Massa de Gordura', value: fatMass, color: 'hsl(var(--destructive))' }
  ];

  const totalWeight = leanMass + fatMass;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].value.toFixed(1)}kg ({((payload[0].value / totalWeight) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-border">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
        <CardTitle className="text-xl text-foreground flex items-center font-semibold">
          <Activity className="w-6 h-6 mr-2 text-primary" />
          Composição Corporal
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-full md:w-1/2">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full md:w-1/2 space-y-4">
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Massa Magra</span>
                <span className="text-2xl font-bold text-primary">{leanMass.toFixed(1)}kg</span>
              </div>
              <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(leanMass / totalWeight) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="bg-destructive/5 rounded-lg p-4 border border-destructive/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Massa de Gordura</span>
                <span className="text-2xl font-bold text-destructive">{fatMass.toFixed(1)}kg</span>
              </div>
              <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-destructive transition-all duration-500"
                  style={{ width: `${(fatMass / totalWeight) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="bg-muted rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Peso Total</span>
                <span className="text-2xl font-bold text-foreground">{totalWeight.toFixed(1)}kg</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BodyCompositionChart;
