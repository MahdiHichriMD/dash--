import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { DailyVolumes } from "@/components/dashboard/daily-volumes";
import { MatchingRecords } from "@/components/dashboard/matching-records";
import { VolumeChart } from "@/components/dashboard/volume-chart";
import { TopActors } from "@/components/dashboard/top-actors";
import { CasesTable } from "@/components/dashboard/cases-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

export default function Dashboard() {
  const { token } = useAuth();

  const {
    data: dailyVolumes,
    isLoading: dailyVolumesLoading,
    refetch: refetchDailyVolumes,
  } = useQuery({
    queryKey: ["/api/dashboard/daily-volumes"],
    enabled: !!token,
  });

  const {
    data: matchingRecords,
    isLoading: matchingRecordsLoading,
    refetch: refetchMatchingRecords,
  } = useQuery({
    queryKey: ["/api/dashboard/matching-records"],
    enabled: !!token,
  });

  const {
    data: todayCases,
    isLoading: todayCasesLoading,
    refetch: refetchTodayCases,
  } = useQuery({
    queryKey: ["/api/dashboard/today-cases"],
    enabled: !!token,
  });

  const {
    data: topIssuers,
    isLoading: topIssuersLoading,
    refetch: refetchTopIssuers,
  } = useQuery({
    queryKey: ["/api/dashboard/top-issuers"],
    enabled: !!token,
  });

  const {
    data: topAcquirers,
    isLoading: topAcquirersLoading,
    refetch: refetchTopAcquirers,
  } = useQuery({
    queryKey: ["/api/dashboard/top-acquirers"],
    enabled: !!token,
  });

  const {
    data: volumeHistory,
    isLoading: volumeHistoryLoading,
    refetch: refetchVolumeHistory,
  } = useQuery({
    queryKey: ["/api/dashboard/volume-history"],
    enabled: !!token,
  });

  const isLoading = dailyVolumesLoading || matchingRecordsLoading || todayCasesLoading || 
                   topIssuersLoading || topAcquirersLoading || volumeHistoryLoading;

  const handleRefresh = () => {
    refetchDailyVolumes();
    refetchMatchingRecords();
    refetchTodayCases();
    refetchTopIssuers();
    refetchTopAcquirers();
    refetchVolumeHistory();
  };

  const handleExport = () => {
    // Implementation for export functionality
    console.log("Export dashboard data");
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

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Today Dashboard"
        onRefresh={handleRefresh}
        onExport={handleExport}
        isLoading={isLoading}
      />

      <div className="p-6 space-y-6">
        {/* Daily Volumes KPIs */}
        {dailyVolumesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-6 w-24" />
              </Card>
            ))}
          </div>
        ) : dailyVolumes ? (
          <DailyVolumes volumes={dailyVolumes} />
        ) : (
          <div className="text-center py-8 text-banking-text/60">
            Failed to load daily volumes data
          </div>
        )}

        {/* Matching Records & Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {matchingRecordsLoading ? (
            <Card className="p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </Card>
          ) : matchingRecords ? (
            <MatchingRecords matchingRecords={matchingRecords} />
          ) : (
            <Card className="p-6">
              <div className="text-center py-8 text-banking-text/60">
                Failed to load matching records data
              </div>
            </Card>
          )}

          {volumeHistoryLoading ? (
            <Card className="p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-64 w-full" />
            </Card>
          ) : volumeHistory ? (
            <VolumeChart data={volumeHistory} />
          ) : (
            <Card className="p-6">
              <div className="text-center py-8 text-banking-text/60">
                Failed to load volume history data
              </div>
            </Card>
          )}
        </section>

        {/* Top Actors */}
        {topIssuersLoading || topAcquirersLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <Skeleton key={j} className="h-16 w-full" />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : topIssuers && topAcquirers ? (
          <TopActors topIssuers={topIssuers} topAcquirers={topAcquirers} />
        ) : (
          <div className="text-center py-8 text-banking-text/60">
            Failed to load top actors data
          </div>
        )}

        {/* Today's Cases Table */}
        {todayCasesLoading ? (
          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </Card>
        ) : todayCases ? (
          <CasesTable cases={todayCases} />
        ) : (
          <Card className="p-6">
            <div className="text-center py-8 text-banking-text/60">
              Failed to load today's cases data
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
