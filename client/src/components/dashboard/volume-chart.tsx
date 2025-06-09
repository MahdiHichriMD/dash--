import { Card, CardContent } from "@/components/ui/card";
import { VolumeHistoryPoint } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface VolumeChartProps {
  data: VolumeHistoryPoint[];
}

export function VolumeChart({ data }: VolumeChartProps) {
  return (
    <Card className="bg-banking-primary border border-banking-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-banking-text mb-4">7-Day Volume Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--banking-gray-200)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--banking-text)"
                fontSize={11}
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              />
              <YAxis 
                stroke="var(--banking-text)"
                fontSize={11}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--banking-primary)',
                  border: '1px solid var(--banking-gray-200)',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Legend 
                wrapperStyle={{
                  fontSize: '12px',
                  paddingTop: '20px'
                }}
              />
              <Line
                type="monotone"
                dataKey="receivedChargebacks"
                stroke="var(--banking-error)"
                strokeWidth={2}
                dot={{ fill: 'var(--banking-error)', strokeWidth: 2, r: 4 }}
                name="Received Chargebacks"
              />
              <Line
                type="monotone"
                dataKey="issuedRepresentments"
                stroke="var(--banking-indicator)"
                strokeWidth={2}
                dot={{ fill: 'var(--banking-indicator)', strokeWidth: 2, r: 4 }}
                name="Issued Representments"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
