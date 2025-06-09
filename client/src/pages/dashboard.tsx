import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { DailySummaryCards } from "@/components/dashboard/daily-summary-cards";
import { BankDistributionCharts } from "@/components/dashboard/bank-distribution-charts";
import { MonthlyYearlyStatistics } from "@/components/dashboard/monthly-yearly-statistics";
import { CategoryTables } from "@/components/dashboard/category-tables";
import { VolumeChart } from "@/components/dashboard/volume-chart";
import { useAuth } from "@/lib/auth";
import * as XLSX from 'xlsx';
import { format } from "date-fns";

export default function Dashboard() {
  const { token } = useAuth();

  // Daily summary data
  const {
    data: dailyVolumes,
    isLoading: dailyVolumesLoading,
    refetch: refetchDailyVolumes,
  } = useQuery({
    queryKey: ["/api/dashboard/daily-volumes"],
    enabled: !!token,
  });

  // Bank distribution data
  const {
    data: bankDistribution,
    isLoading: bankDistributionLoading,
    refetch: refetchBankDistribution,
  } = useQuery({
    queryKey: ["/api/dashboard/bank-distribution"],
    enabled: !!token,
  });

  // Monthly/yearly statistics
  const {
    data: monthlyYearlyStats,
    isLoading: monthlyYearlyStatsLoading,
    refetch: refetchMonthlyYearlyStats,
  } = useQuery({
    queryKey: ["/api/dashboard/monthly-yearly-statistics"],
    enabled: !!token,
  });

  // Today's data by category
  const {
    data: todayDataByCategory,
    isLoading: todayDataLoading,
    refetch: refetchTodayData,
  } = useQuery({
    queryKey: ["/api/dashboard/today-data-by-category"],
    enabled: !!token,
  });

  // Volume history for charts
  const {
    data: volumeHistory,
    isLoading: volumeHistoryLoading,
    refetch: refetchVolumeHistory,
  } = useQuery({
    queryKey: ["/api/dashboard/volume-history"],
    enabled: !!token,
  });

  const isLoading = dailyVolumesLoading || bankDistributionLoading || 
                   monthlyYearlyStatsLoading || todayDataLoading || volumeHistoryLoading;

  const handleRefresh = () => {
    refetchDailyVolumes();
    refetchBankDistribution();
    refetchMonthlyYearlyStats();
    refetchTodayData();
    refetchVolumeHistory();
  };

  const handleExport = () => {
    const exportData = {
      dailyVolumes,
      bankDistribution,
      monthlyYearlyStats,
      todayDataByCategory,
      volumeHistory,
      exportDate: new Date().toISOString()
    };

    const ws = XLSX.utils.json_to_sheet([exportData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Comprehensive Dashboard Data');
    XLSX.writeFile(wb, `comprehensive_dashboard_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-banking-text/60">Please log in to access the dashboard</p>
        </div>
      </div>
    );
  }

  // Transform daily volumes data for the new summary cards
  const summaryData = dailyVolumes ? {
    receivedChargebacks: dailyVolumes.receivedChargebacks,
    issuedChargebacks: dailyVolumes.issuedChargebacks,
    receivedRepresentments: dailyVolumes.receivedRepresentments,
    issuedRepresentments: dailyVolumes.issuedRepresentments,
  } : {
    receivedChargebacks: { count: 0, amount: "0" },
    issuedChargebacks: { count: 0, amount: "0" },
    receivedRepresentments: { count: 0, amount: "0" },
    issuedRepresentments: { count: 0, amount: "0" },
  };

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Dashboard Bancaire Complet"
        subtitle="Vue d'ensemble des opérations de chargeback et représentation"
        onRefresh={handleRefresh}
        onExport={handleExport}
        isLoading={isLoading}
      />

      <div className="p-6 space-y-8">
        {/* Daily Summary Cards */}
        <section>
          <h2 className="text-xl font-semibold text-banking-text mb-4">
            Résumé du Jour
          </h2>
          <DailySummaryCards data={summaryData} isLoading={dailyVolumesLoading} />
        </section>

        {/* Bank Distribution Charts */}
        <section>
          <h2 className="text-xl font-semibold text-banking-text mb-4">
            Répartition par Banque
          </h2>
          <BankDistributionCharts 
            data={bankDistribution || { issuerBankData: [], acquirerBankData: [] }} 
            isLoading={bankDistributionLoading} 
          />
        </section>

        {/* Volume History Chart */}
        {volumeHistory && (
          <section>
            <h2 className="text-xl font-semibold text-banking-text mb-4">
              Évolution des Volumes
            </h2>
            <VolumeChart data={volumeHistory} />
          </section>
        )}

        {/* Monthly/Yearly Statistics Table */}
        <section>
          <h2 className="text-xl font-semibold text-banking-text mb-4">
            Statistiques Temporelles
          </h2>
          <MonthlyYearlyStatistics 
            data={monthlyYearlyStats || []} 
            isLoading={monthlyYearlyStatsLoading} 
          />
        </section>

        {/* Category Tables */}
        <section>
          <h2 className="text-xl font-semibold text-banking-text mb-4">
            Données Traitées Aujourd'hui par Catégorie
          </h2>
          <CategoryTables
            receivedChargebacks={todayDataByCategory?.receivedChargebacks || []}
            issuedChargebacks={todayDataByCategory?.issuedChargebacks || []}
            receivedRepresentments={todayDataByCategory?.receivedRepresentments || []}
            issuedRepresentments={todayDataByCategory?.issuedRepresentments || []}
            isLoading={todayDataLoading}
          />
        </section>
      </div>
    </div>
  );
}
