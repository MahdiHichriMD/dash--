import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Calendar, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";
import * as XLSX from 'xlsx';

interface AnnualStatistics {
  year: number;
  bank: string;
  totalCases: number;
  totalAmount: number;
  receivedChargebacks: { count: number; amount: number };
  issuedRepresentments: { count: number; amount: number };
  issuedChargebacks: { count: number; amount: number };
  receivedRepresentments: { count: number; amount: number };
  trend: number; // percentage change from previous year
}

export function AnnualStatistics() {
  const { token } = useAuth();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedBank, setSelectedBank] = useState("all");

  const {
    data: annualStats,
    isLoading,
    refetch,
  } = useQuery<AnnualStatistics[]>({
    queryKey: ["/api/dashboard/annual-statistics", selectedYear, selectedBank],
    enabled: !!token,
  });

  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const availableBanks = ["all", "BNP Paribas", "Société Générale", "Crédit Agricole", "BPCE", "Crédit Mutuel"];

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(num);
  };

  const handleExport = () => {
    if (annualStats && annualStats.length > 0) {
      const exportData = annualStats.map(stat => ({
        Year: stat.year,
        Bank: stat.bank,
        'Total Cases': stat.totalCases,
        'Total Amount (EUR)': stat.totalAmount,
        'Received Chargebacks Count': stat.receivedChargebacks.count,
        'Received Chargebacks Amount (EUR)': stat.receivedChargebacks.amount,
        'Issued Representments Count': stat.issuedRepresentments.count,
        'Issued Representments Amount (EUR)': stat.issuedRepresentments.amount,
        'Issued Chargebacks Count': stat.issuedChargebacks.count,
        'Issued Chargebacks Amount (EUR)': stat.issuedChargebacks.amount,
        'Received Representments Count': stat.receivedRepresentments.count,
        'Received Representments Amount (EUR)': stat.receivedRepresentments.amount,
        'Trend (%)': stat.trend
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Annual Statistics');
      XLSX.writeFile(wb, `annual_statistics_${selectedYear}_${selectedBank}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    }
  };

  const stats = annualStats?.[0] || {
    year: parseInt(selectedYear),
    bank: selectedBank,
    totalCases: 0,
    totalAmount: 0,
    receivedChargebacks: { count: 0, amount: 0 },
    issuedRepresentments: { count: 0, amount: 0 },
    issuedChargebacks: { count: 0, amount: 0 },
    receivedRepresentments: { count: 0, amount: 0 },
    trend: 0
  };

  return (
    <Card className="bg-banking-primary border border-banking-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-banking-text flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-banking-indicator" />
            <span>Annual Statistics by Bank</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedBank} onValueChange={setSelectedBank}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Banks</SelectItem>
                {availableBanks.slice(1).map(bank => (
                  <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleExport} variant="outline" size="sm">
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Total Cases</p>
                      <p className="text-2xl font-bold text-blue-900">{formatNumber(stats.totalCases)}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {stats.trend > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${stats.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(stats.trend).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">Total Amount</p>
                      <p className="text-2xl font-bold text-green-900">{formatAmount(stats.totalAmount)}</p>
                    </div>
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-700">Chargebacks</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {formatNumber(stats.receivedChargebacks.count + stats.issuedChargebacks.count)}
                      </p>
                    </div>
                    <div className="text-xs text-orange-600">
                      <div>R: {formatNumber(stats.receivedChargebacks.count)}</div>
                      <div>I: {formatNumber(stats.issuedChargebacks.count)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-700">Representments</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {formatNumber(stats.receivedRepresentments.count + stats.issuedRepresentments.count)}
                      </p>
                    </div>
                    <div className="text-xs text-purple-600">
                      <div>R: {formatNumber(stats.receivedRepresentments.count)}</div>
                      <div>I: {formatNumber(stats.issuedRepresentments.count)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-banking-gray-50">
                <CardHeader>
                  <CardTitle className="text-base font-medium text-banking-text">Received Operations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-banking-text">Received Chargebacks</p>
                      <p className="text-xs text-banking-text/60">{formatNumber(stats.receivedChargebacks.count)} cases</p>
                    </div>
                    <p className="text-lg font-bold text-banking-error">{formatAmount(stats.receivedChargebacks.amount)}</p>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-banking-text">Received Representments</p>
                      <p className="text-xs text-banking-text/60">{formatNumber(stats.receivedRepresentments.count)} cases</p>
                    </div>
                    <p className="text-lg font-bold text-banking-indicator">{formatAmount(stats.receivedRepresentments.amount)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-banking-gray-50">
                <CardHeader>
                  <CardTitle className="text-base font-medium text-banking-text">Issued Operations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-banking-text">Issued Chargebacks</p>
                      <p className="text-xs text-banking-text/60">{formatNumber(stats.issuedChargebacks.count)} cases</p>
                    </div>
                    <p className="text-lg font-bold text-banking-error">{formatAmount(stats.issuedChargebacks.amount)}</p>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-banking-text">Issued Representments</p>
                      <p className="text-xs text-banking-text/60">{formatNumber(stats.issuedRepresentments.count)} cases</p>
                    </div>
                    <p className="text-lg font-bold text-banking-indicator">{formatAmount(stats.issuedRepresentments.amount)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}