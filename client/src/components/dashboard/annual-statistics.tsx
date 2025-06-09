import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { useAuthenticatedQuery } from "@/hooks/use-authenticated-query";

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
  const currentYear = new Date().getFullYear();
  
  const { data: annualStats, isLoading } = useAuthenticatedQuery<AnnualStatistics[]>(
    ['/api/dashboard/annual-overview', currentYear.toString()],
    `/api/dashboard/annual-overview?year=${currentYear}`
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistiques Annuelles {currentYear}</CardTitle>
        <CardDescription>Vue d'ensemble des performances par banque</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {annualStats?.map((stat, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{stat.bank}</h3>
                  <p className="text-sm text-muted-foreground">
                    {stat.totalCases} cas • {formatCurrency(stat.totalAmount)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {stat.trend > 0 ? (
                    <TrendingUpIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDownIcon className="h-4 w-4 text-red-500" />
                  )}
                  <Badge variant={stat.trend > 0 ? "default" : "destructive"}>
                    {Math.abs(stat.trend).toFixed(1)}%
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {stat.receivedChargebacks.count}
                  </div>
                  <div className="text-xs text-muted-foreground">Chargebacks Reçus</div>
                  <div className="text-xs">{formatCurrency(stat.receivedChargebacks.amount)}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {stat.issuedChargebacks.count}
                  </div>
                  <div className="text-xs text-muted-foreground">Chargebacks Émis</div>
                  <div className="text-xs">{formatCurrency(stat.issuedChargebacks.amount)}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {stat.receivedRepresentments.count}
                  </div>
                  <div className="text-xs text-muted-foreground">Représentations Reçues</div>
                  <div className="text-xs">{formatCurrency(stat.receivedRepresentments.amount)}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {stat.issuedRepresentments.count}
                  </div>
                  <div className="text-xs text-muted-foreground">Représentations Émises</div>
                  <div className="text-xs">{formatCurrency(stat.issuedRepresentments.amount)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}