import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, CreditCard, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DailySummaryData {
  receivedChargebacks: { count: number; amount: string };
  issuedChargebacks: { count: number; amount: string };
  receivedRepresentments: { count: number; amount: string };
  issuedRepresentments: { count: number; amount: string };
}

interface DailySummaryCardsProps {
  data: DailySummaryData;
  isLoading?: boolean;
}

export function DailySummaryCards({ data, isLoading }: DailySummaryCardsProps) {
  const cards = [
    {
      title: "Chargebacks Reçus",
      count: data.receivedChargebacks.count,
      amount: data.receivedChargebacks.amount,
      icon: CreditCard,
      color: "text-red-600",
      bgColor: "bg-red-50",
      trend: "down" as const,
    },
    {
      title: "Chargebacks Émis",
      count: data.issuedChargebacks.count,
      amount: data.issuedChargebacks.amount,
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: "up" as const,
    },
    {
      title: "Représentations Reçues",
      count: data.receivedRepresentments.count,
      amount: data.receivedRepresentments.amount,
      icon: RefreshCw,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "up" as const,
    },
    {
      title: "Représentations Émises",
      count: data.issuedRepresentments.count,
      amount: data.issuedRepresentments.amount,
      icon: RefreshCw,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "up" as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon = card.trend === "up" ? ArrowUpIcon : ArrowDownIcon;
        
        return (
          <Card key={index} className="banking-transition hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-banking-text/70">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-3">
                <div className="text-2xl font-bold text-banking-text">
                  {card.count}
                </div>
                <Badge variant="secondary" className="text-xs">
                  <TrendIcon className="h-3 w-3 mr-1" />
                  {card.trend === "up" ? "+" : "-"}2.3%
                </Badge>
              </div>
              <p className="text-xs text-banking-text/60 mt-1">
                Montant: {parseFloat(card.amount).toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                })}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}