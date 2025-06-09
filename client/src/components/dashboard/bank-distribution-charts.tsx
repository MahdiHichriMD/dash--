import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useState } from "react";

interface BankDistributionData {
  issuerBankData: Array<{
    bank: string;
    receivedChargebacks: number;
    issuedChargebacks: number;
    receivedRepresentments: number;
    issuedRepresentments: number;
  }>;
  acquirerBankData: Array<{
    bank: string;
    receivedChargebacks: number;
    issuedChargebacks: number;
    receivedRepresentments: number;
    issuedRepresentments: number;
  }>;
}

interface BankDistributionChartsProps {
  data: BankDistributionData;
  isLoading?: boolean;
}

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

export function BankDistributionCharts({ data, isLoading }: BankDistributionChartsProps) {
  const [selectedType, setSelectedType] = useState<'chargebacks' | 'representments'>('chargebacks');
  const [selectedDirection, setSelectedDirection] = useState<'received' | 'issued'>('received');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getChartData = (bankType: 'issuerBankData' | 'acquirerBankData') => {
    const sourceData = data?.[bankType] || [];
    return sourceData.map(item => ({
      bank: item.bank,
      value: selectedType === 'chargebacks' 
        ? (selectedDirection === 'received' ? item.receivedChargebacks : item.issuedChargebacks)
        : (selectedDirection === 'received' ? item.receivedRepresentments : item.issuedRepresentments)
    })).filter(item => item.value > 0);
  };

  const issuerData = getChartData('issuerBankData');
  const acquirerData = getChartData('acquirerBankData');

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <Select value={selectedType} onValueChange={(value: 'chargebacks' | 'representments') => setSelectedType(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chargebacks">Chargebacks</SelectItem>
            <SelectItem value="representments">Représentations</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedDirection} onValueChange={(value: 'received' | 'issued') => setSelectedDirection(value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="received">Reçus</SelectItem>
            <SelectItem value="issued">Émis</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issuer Banks Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Issuer Bank</CardTitle>
            <CardDescription>
              {selectedType === 'chargebacks' ? 'Chargebacks' : 'Représentations'} {selectedDirection === 'received' ? 'reçus' : 'émis'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={issuerData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="bank" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Acquirer Banks Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Acquirer Bank</CardTitle>
            <CardDescription>
              {selectedType === 'chargebacks' ? 'Chargebacks' : 'Représentations'} {selectedDirection === 'received' ? 'reçus' : 'émis'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={acquirerData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ bank, value, percent }) => `${bank}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {acquirerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}