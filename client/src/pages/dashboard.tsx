import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, UsersIcon, CreditCardIcon, AlertTriangleIcon, Download, FileText, FileSpreadsheet } from "lucide-react";
import { VolumeHistoryPoint, DailyVolumes, MatchingRecords, TopIssuer, TopAcquirer, TodayCase } from "@/lib/types";
import { AnnualStatistics } from "@/components/dashboard/annual-statistics";
import { BankDistributionCharts } from "@/components/dashboard/bank-distribution-charts";
import { AdvancedFilters } from "@/components/advanced-filters";
import { useAuthenticatedQuery } from "@/hooks/use-authenticated-query";
import { format } from "date-fns";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filteredData, setFilteredData] = useState<any>({
    receivedChargebacks: [],
    issuedChargebacks: [],
    receivedRepresentments: [],
    issuedRepresentments: []
  });
  
  const today = new Date().toISOString().split('T')[0];

  // Fetch daily volumes
  const { data: dailyVolumes, isLoading: loadingVolumes } = useAuthenticatedQuery<DailyVolumes>(
    ['/api/dashboard/daily-volumes', today],
    `/api/dashboard/daily-volumes?date=${today}`
  );

  // Fetch annual statistics
  const { data: annualStats, isLoading: loadingAnnual } = useAuthenticatedQuery(
    ['/api/dashboard/annual-statistics', selectedYear.toString()],
    `/api/dashboard/annual-statistics?year=${selectedYear}`
  );

  // Fetch bank distribution data
  const { data: bankDistribution, isLoading: loadingBankDist } = useAuthenticatedQuery(
    ['/api/dashboard/bank-distribution', selectedYear.toString()],
    `/api/dashboard/bank-distribution?year=${selectedYear}`
  );

  // Fetch monthly/yearly statistics for export table
  const { data: monthlyStats, isLoading: loadingMonthly } = useAuthenticatedQuery(
    ['/api/dashboard/monthly-statistics', selectedYear.toString()],
    `/api/dashboard/monthly-statistics?year=${selectedYear}&type=monthly`
  );

  // Fetch today's data by category
  const { data: todayData, isLoading: loadingTodayData } = useAuthenticatedQuery(
    ['/api/dashboard/today-data', today],
    `/api/dashboard/today-data?date=${today}`
  );

  const isLoading = loadingVolumes || loadingAnnual || loadingBankDist || loadingMonthly || loadingTodayData;

  const exportToPDF = (data: any[], title: string) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(title, 20, 20);
    
    const tableData = data.map(item => Object.values(item));
    const headers = data.length > 0 ? Object.keys(data[0]) : [];
    
    (doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [60, 141, 188] }
    });
    
    doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  const exportToExcel = (data: any[], title: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title);
    XLSX.writeFile(wb, `${title.toLowerCase().replace(/\s+/g, '-')}.xlsx`);
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(numAmount);
  };

  const filterConfigs = {
    receivedChargebacks: [
      { field: 'refFichier', label: 'Référence Fichier', type: 'text' as const },
      { field: 'libCommercant', label: 'Commerçant', type: 'text' as const },
      { field: 'agence', label: 'Agence', type: 'text' as const },
      { field: 'amountCp', label: 'Montant', type: 'amount' as const },
      { field: 'dateTraitementRpa', label: 'Date Traitement', type: 'date' as const },
      { field: 'issuer', label: 'Émetteur', type: 'text' as const }
    ],
    issuedChargebacks: [
      { field: 'refFichier', label: 'Référence Fichier', type: 'text' as const },
      { field: 'libCommercant', label: 'Commerçant', type: 'text' as const },
      { field: 'agence', label: 'Agence', type: 'text' as const },
      { field: 'amountCp', label: 'Montant', type: 'amount' as const },
      { field: 'dateTraitementRpa', label: 'Date Traitement', type: 'date' as const },
      { field: 'acquirer', label: 'Acquéreur', type: 'text' as const }
    ],
    receivedRepresentments: [
      { field: 'refFichier', label: 'Référence Fichier', type: 'text' as const },
      { field: 'libCommercant', label: 'Commerçant', type: 'text' as const },
      { field: 'agence', label: 'Agence', type: 'text' as const },
      { field: 'amountCp', label: 'Montant', type: 'amount' as const },
      { field: 'dateTraitementRpa', label: 'Date Traitement', type: 'date' as const },
      { field: 'issuer', label: 'Émetteur', type: 'text' as const }
    ],
    issuedRepresentments: [
      { field: 'refFichier', label: 'Référence Fichier', type: 'text' as const },
      { field: 'libCommercant', label: 'Commerçant', type: 'text' as const },
      { field: 'agence', label: 'Agence', type: 'text' as const },
      { field: 'amountCp', label: 'Montant', type: 'amount' as const },
      { field: 'dateTraitementRpa', label: 'Date Traitement', type: 'date' as const },
      { field: 'acquirer', label: 'Acquéreur', type: 'text' as const }
    ]
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Tableau de Bord</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de Bord</h1>
        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Daily Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chargebacks Reçus</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyVolumes?.receivedChargebacks.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(dailyVolumes?.receivedChargebacks.amount || "0")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chargebacks Émis</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyVolumes?.issuedChargebacks.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(dailyVolumes?.issuedChargebacks.amount || "0")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Représentations Reçues</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyVolumes?.receivedRepresentments.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(dailyVolumes?.receivedRepresentments.amount || "0")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Représentations Émises</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyVolumes?.issuedRepresentments.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(dailyVolumes?.issuedRepresentments.amount || "0")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bank Distribution Charts */}
      <BankDistributionCharts data={bankDistribution} isLoading={loadingBankDist} />

      {/* Annual Statistics */}
      <AnnualStatistics />

      {/* Monthly Statistics Export Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Statistiques Mensuelles {selectedYear}</CardTitle>
              <CardDescription>Données détaillées par mois avec évolution</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToPDF(monthlyStats || [], `Statistiques ${selectedYear}`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToExcel(monthlyStats || [], `Statistiques ${selectedYear}`)}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Mois</th>
                  <th className="text-left p-2">Chargebacks Reçus</th>
                  <th className="text-left p-2">Chargebacks Émis</th>
                  <th className="text-left p-2">Représentations Reçues</th>
                  <th className="text-left p-2">Représentations Émises</th>
                  <th className="text-left p-2">Évolution</th>
                </tr>
              </thead>
              <tbody>
                {monthlyStats?.map((stat: any, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{stat.month}/{stat.year}</td>
                    <td className="p-2">
                      <div>{stat.receivedChargebacks.count}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(stat.receivedChargebacks.amountCp)}
                      </div>
                    </td>
                    <td className="p-2">
                      <div>{stat.issuedChargebacks.count}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(stat.issuedChargebacks.amountCp)}
                      </div>
                    </td>
                    <td className="p-2">
                      <div>{stat.receivedRepresentments.count}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(stat.receivedRepresentments.amountCp)}
                      </div>
                    </td>
                    <td className="p-2">
                      <div>{stat.issuedRepresentments.count}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(stat.issuedRepresentments.amountCp)}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        {stat.trend?.receivedChargebacks > 0 ? (
                          <ArrowUpIcon className="h-3 w-3 text-green-500" />
                        ) : (
                          <ArrowDownIcon className="h-3 w-3 text-red-500" />
                        )}
                        <span className="text-xs">
                          {Math.abs(stat.trend?.receivedChargebacks || 0).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Today's Data by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Données d'Aujourd'hui par Catégorie</CardTitle>
          <CardDescription>Transactions traitées aujourd'hui avec filtres avancés</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="received-chargebacks" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="received-chargebacks">Chargebacks Reçus</TabsTrigger>
              <TabsTrigger value="issued-chargebacks">Chargebacks Émis</TabsTrigger>
              <TabsTrigger value="received-representments">Représentations Reçues</TabsTrigger>
              <TabsTrigger value="issued-representments">Représentations Émises</TabsTrigger>
            </TabsList>

            {Object.entries(filterConfigs).map(([key, filters]) => (
              <TabsContent key={key} value={key.replace(/([A-Z])/g, '-$1').toLowerCase()}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      {key === 'receivedChargebacks' && 'Chargebacks Reçus'}
                      {key === 'issuedChargebacks' && 'Chargebacks Émis'}
                      {key === 'receivedRepresentments' && 'Représentations Reçues'}
                      {key === 'issuedRepresentments' && 'Représentations Émises'}
                    </h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => exportToPDF(filteredData[key] || todayData?.[key] || [], `${key} ${today}`)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => exportToExcel(filteredData[key] || todayData?.[key] || [], `${key} ${today}`)}
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Excel
                      </Button>
                    </div>
                  </div>
                  
                  <AdvancedFilters
                    filters={filters}
                    data={todayData?.[key] || []}
                    onFilteredData={(filtered) => setFilteredData((prev: any) => ({ ...prev, [key]: filtered }))}
                    tableName={key}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}