import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const OPERATION_COLORS = {
  receivedChargebacks: '#ef4444',
  issuedChargebacks: '#f97316',
  receivedRepresentments: '#3b82f6',
  issuedRepresentments: '#10b981',
};

const OPERATION_LABELS = {
  receivedChargebacks: 'Chargebacks Reçus',
  issuedChargebacks: 'Chargebacks Émis',
  receivedRepresentments: 'Représentations Reçues',
  issuedRepresentments: 'Représentations Émises',
};

export function BankDistributionCharts({ data, isLoading }: BankDistributionChartsProps) {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedOperation, setSelectedOperation] = useState<keyof typeof OPERATION_LABELS>("receivedChargebacks");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare pie chart data for selected operation
  const issuerPieData = data.issuerBankData.map((item, index) => ({
    name: item.bank,
    value: item[selectedOperation],
    color: COLORS[index % COLORS.length],
  })).filter(item => item.value > 0);

  const acquirerPieData = data.acquirerBankData.map((item, index) => ({
    name: item.bank,
    value: item[selectedOperation],
    color: COLORS[index % COLORS.length],
  })).filter(item => item.value > 0);

  // Prepare bar chart data
  const issuerBarData = data.issuerBankData.map(item => ({
    bank: item.bank,
    ...item,
  }));

  const acquirerBarData = data.acquirerBankData.map(item => ({
    bank: item.bank,
    ...item,
  }));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-banking-text">Année:</label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-banking-text">Type d'opération:</label>
          <Select value={selectedOperation} onValueChange={(value: keyof typeof OPERATION_LABELS) => setSelectedOperation(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(OPERATION_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-banking-text">
              Répartition par Issuer Bank - {OPERATION_LABELS[selectedOperation]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={issuerPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {issuerPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Nombre']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-banking-text">
              Répartition par Acquirer Bank - {OPERATION_LABELS[selectedOperation]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={acquirerPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {acquirerPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Nombre']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-banking-text">
              Vue d'ensemble Issuer Banks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={issuerBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bank" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="receivedChargebacks" fill={OPERATION_COLORS.receivedChargebacks} name="Chargebacks Reçus" />
                <Bar dataKey="issuedChargebacks" fill={OPERATION_COLORS.issuedChargebacks} name="Chargebacks Émis" />
                <Bar dataKey="receivedRepresentments" fill={OPERATION_COLORS.receivedRepresentments} name="Représentations Reçues" />
                <Bar dataKey="issuedRepresentments" fill={OPERATION_COLORS.issuedRepresentments} name="Représentations Émises" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-banking-text">
              Vue d'ensemble Acquirer Banks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={acquirerBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bank" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="receivedChargebacks" fill={OPERATION_COLORS.receivedChargebacks} name="Chargebacks Reçus" />
                <Bar dataKey="issuedChargebacks" fill={OPERATION_COLORS.issuedChargebacks} name="Chargebacks Émis" />
                <Bar dataKey="receivedRepresentments" fill={OPERATION_COLORS.receivedRepresentments} name="Représentations Reçues" />
                <Bar dataKey="issuedRepresentments" fill={OPERATION_COLORS.issuedRepresentments} name="Représentations Émises" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}