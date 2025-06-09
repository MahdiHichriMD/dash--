import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileSpreadsheet, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { useState } from "react";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface MonthlyYearlyData {
  year: number;
  month?: number;
  receivedChargebacks: {
    count: number;
    amountCp: number;
    amountOrigine: number;
  };
  issuedChargebacks: {
    count: number;
    amountCp: number;
    amountOrigine: number;
  };
  receivedRepresentments: {
    count: number;
    amountCp: number;
    amountOrigine: number;
  };
  issuedRepresentments: {
    count: number;
    amountCp: number;
    amountOrigine: number;
  };
  trend: {
    receivedChargebacks: number;
    issuedChargebacks: number;
    receivedRepresentments: number;
    issuedRepresentments: number;
  };
}

interface MonthlyYearlyStatisticsProps {
  data: MonthlyYearlyData[];
  isLoading?: boolean;
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export function MonthlyYearlyStatistics({ data, isLoading }: MonthlyYearlyStatisticsProps) {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [viewMode, setViewMode] = useState<"yearly" | "monthly">("yearly");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  const exportToExcel = () => {
    const exportData = data.map(item => ({
      'Période': item.month ? `${MONTHS[item.month - 1]} ${item.year}` : item.year.toString(),
      'CB Reçus - Nombre': item.receivedChargebacks.count,
      'CB Reçus - Montant CP (€)': item.receivedChargebacks.amountCp,
      'CB Reçus - Montant Origine (€)': item.receivedChargebacks.amountOrigine,
      'CB Émis - Nombre': item.issuedChargebacks.count,
      'CB Émis - Montant CP (€)': item.issuedChargebacks.amountCp,
      'CB Émis - Montant Origine (€)': item.issuedChargebacks.amountOrigine,
      'Rep Reçues - Nombre': item.receivedRepresentments.count,
      'Rep Reçues - Montant CP (€)': item.receivedRepresentments.amountCp,
      'Rep Reçues - Montant Origine (€)': item.receivedRepresentments.amountOrigine,
      'Rep Émises - Nombre': item.issuedRepresentments.count,
      'Rep Émises - Montant CP (€)': item.issuedRepresentments.amountCp,
      'Rep Émises - Montant Origine (€)': item.issuedRepresentments.amountOrigine,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Statistiques');
    XLSX.writeFile(wb, `statistiques_${viewMode}_${selectedYear}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Statistiques Bancaires', 14, 22);
    doc.setFontSize(12);
    doc.text(`Période: ${viewMode === 'yearly' ? 'Annuelle' : 'Mensuelle'} - ${selectedYear}`, 14, 32);

    const tableData = data.map(item => [
      item.month ? `${MONTHS[item.month - 1]} ${item.year}` : item.year.toString(),
      item.receivedChargebacks.count.toString(),
      `€${item.receivedChargebacks.amountCp.toLocaleString('fr-FR')}`,
      item.issuedChargebacks.count.toString(),
      `€${item.issuedChargebacks.amountCp.toLocaleString('fr-FR')}`,
      item.receivedRepresentments.count.toString(),
      `€${item.receivedRepresentments.amountCp.toLocaleString('fr-FR')}`,
      item.issuedRepresentments.count.toString(),
      `€${item.issuedRepresentments.amountCp.toLocaleString('fr-FR')}`,
    ]);

    (doc as any).autoTable({
      head: [['Période', 'CB Reçus', 'Montant CB Reçus', 'CB Émis', 'Montant CB Émis', 
              'Rep Reçues', 'Montant Rep Reçues', 'Rep Émises', 'Montant Rep Émises']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [67, 56, 202] },
    });

    doc.save(`statistiques_${viewMode}_${selectedYear}.pdf`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTrend = (trend: number) => {
    const isPositive = trend > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center ${color}`}>
        <Icon className="h-3 w-3 mr-1" />
        <span className="text-xs">{Math.abs(trend).toFixed(1)}%</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-64"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-banking-text">
            Statistiques {viewMode === 'yearly' ? 'Annuelles' : 'Mensuelles'}
          </CardTitle>
          <div className="flex items-center space-x-4">
            <Select value={viewMode} onValueChange={(value: "yearly" | "monthly") => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yearly">Annuelle</SelectItem>
                <SelectItem value="monthly">Mensuelle</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToExcel}
                className="flex items-center space-x-1"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Excel</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                className="flex items-center space-x-1"
              >
                <FileText className="h-4 w-4" />
                <span>PDF</span>
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Période</TableHead>
                <TableHead className="text-center">Chargebacks Reçus</TableHead>
                <TableHead className="text-center">Chargebacks Émis</TableHead>
                <TableHead className="text-center">Représentations Reçues</TableHead>
                <TableHead className="text-center">Représentations Émises</TableHead>
              </TableRow>
              <TableRow>
                <TableHead></TableHead>
                <TableHead className="text-xs text-center border-l">Nb | Mont. CP | Mont. Orig. | Évol.</TableHead>
                <TableHead className="text-xs text-center border-l">Nb | Mont. CP | Mont. Orig. | Évol.</TableHead>
                <TableHead className="text-xs text-center border-l">Nb | Mont. CP | Mont. Orig. | Évol.</TableHead>
                <TableHead className="text-xs text-center border-l">Nb | Mont. CP | Mont. Orig. | Évol.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {item.month ? `${MONTHS[item.month - 1]} ${item.year}` : item.year}
                  </TableCell>
                  
                  <TableCell className="text-center border-l">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold">{item.receivedChargebacks.count}</div>
                      <div className="text-xs text-gray-600">{formatCurrency(item.receivedChargebacks.amountCp)}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(item.receivedChargebacks.amountOrigine)}</div>
                      {formatTrend(item.trend.receivedChargebacks)}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center border-l">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold">{item.issuedChargebacks.count}</div>
                      <div className="text-xs text-gray-600">{formatCurrency(item.issuedChargebacks.amountCp)}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(item.issuedChargebacks.amountOrigine)}</div>
                      {formatTrend(item.trend.issuedChargebacks)}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center border-l">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold">{item.receivedRepresentments.count}</div>
                      <div className="text-xs text-gray-600">{formatCurrency(item.receivedRepresentments.amountCp)}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(item.receivedRepresentments.amountOrigine)}</div>
                      {formatTrend(item.trend.receivedRepresentments)}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center border-l">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold">{item.issuedRepresentments.count}</div>
                      <div className="text-xs text-gray-600">{formatCurrency(item.issuedRepresentments.amountCp)}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(item.issuedRepresentments.amountOrigine)}</div>
                      {formatTrend(item.trend.issuedRepresentments)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}