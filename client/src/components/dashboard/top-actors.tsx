import { Card, CardContent } from "@/components/ui/card";
import { TopIssuer, TopAcquirer } from "@/lib/types";

interface TopActorsProps {
  topIssuers: TopIssuer[];
  topAcquirers: TopAcquirer[];
}

export function TopActors({ topIssuers, topAcquirers }: TopActorsProps) {
  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(num);
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Issuing Banks */}
      <Card className="bg-banking-primary border border-banking-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-banking-text mb-4">Top Issuing Banks Today</h3>
          <div className="space-y-3">
            {topIssuers.length > 0 ? (
              topIssuers.map((issuer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 hover:bg-banking-gray-50 rounded-lg banking-transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-banking-indicator/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-banking-indicator">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-banking-text">
                        {issuer.libBank || issuer.issuer || "Unknown Bank"}
                      </h4>
                      <p className="text-xs text-banking-text/60">{issuer.issuer}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-banking-text">
                      {formatAmount(issuer.volume)}
                    </div>
                    <div className="text-xs text-banking-text/60">
                      {issuer.count} cases
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-banking-text/60">
                No issuer data available for today
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Acquirers */}
      <Card className="bg-banking-primary border border-banking-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-banking-text mb-4">Top Acquirers Today</h3>
          <div className="space-y-3">
            {topAcquirers.length > 0 ? (
              topAcquirers.map((acquirer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 hover:bg-banking-gray-50 rounded-lg banking-transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-banking-error/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-banking-error">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-banking-text">
                        {acquirer.acquirer || "Unknown Acquirer"}
                      </h4>
                      <p className="text-xs text-banking-text/60">{acquirer.acquirerRef}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-banking-text">
                      {formatAmount(acquirer.volume)}
                    </div>
                    <div className="text-xs text-banking-text/60">
                      {acquirer.count} cases
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-banking-text/60">
                No acquirer data available for today
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
