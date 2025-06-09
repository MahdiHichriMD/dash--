import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";
import { DailyVolumes as DailyVolumesType } from "@/lib/types";

interface DailyVolumesProps {
  volumes: DailyVolumesType;
}

export function DailyVolumes({ volumes }: DailyVolumesProps) {
  const volumeCards = [
    {
      title: "Received Chargebacks",
      icon: <ArrowDown className="text-banking-error" />,
      count: volumes.receivedChargebacks.count,
      amount: volumes.receivedChargebacks.amount,
      change: "+12.5%", // This would come from API in real implementation
      changeType: "positive" as const
    },
    {
      title: "Issued Representments",
      icon: <ArrowUp className="text-banking-indicator" />,
      count: volumes.issuedRepresentments.count,
      amount: volumes.issuedRepresentments.amount,
      change: "-3.2%",
      changeType: "negative" as const
    },
    {
      title: "Issued Chargebacks",
      icon: <ArrowUp className="text-banking-error" />,
      count: volumes.issuedChargebacks.count,
      amount: volumes.issuedChargebacks.amount,
      change: "+7.8%",
      changeType: "positive" as const
    },
    {
      title: "Received Representments",
      icon: <ArrowDown className="text-banking-indicator" />,
      count: volumes.receivedRepresentments.count,
      amount: volumes.receivedRepresentments.amount,
      change: "-1.4%",
      changeType: "negative" as const
    }
  ];

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(num);
  };

  return (
    <section>
      <h3 className="text-lg font-semibold text-banking-text mb-4">Daily Volumes</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {volumeCards.map((card, index) => (
          <Card key={index} className="bg-banking-primary border border-banking-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-banking-text/70">{card.title}</h4>
                {card.icon}
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold text-banking-text">{card.count}</span>
                  <span className="text-sm text-banking-text/60">records</span>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-lg font-semibold text-banking-text">
                    {formatAmount(card.amount)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    card.changeType === 'positive' 
                      ? 'bg-banking-indicator/20 text-banking-indicator' 
                      : 'bg-banking-error/20 text-banking-error'
                  }`}>
                    {card.change}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
