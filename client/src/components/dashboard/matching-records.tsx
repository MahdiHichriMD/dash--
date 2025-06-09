import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { MatchingRecords as MatchingRecordsType } from "@/lib/types";

interface MatchingRecordsProps {
  matchingRecords: MatchingRecordsType;
}

export function MatchingRecords({ matchingRecords }: MatchingRecordsProps) {
  const overallRate = matchingRecords.receivedChargebacksTotal > 0 && matchingRecords.issuedChargebacksTotal > 0
    ? ((matchingRecords.receivedChargebacksLinked + matchingRecords.issuedChargebacksLinked) / 
       (matchingRecords.receivedChargebacksTotal + matchingRecords.issuedChargebacksTotal) * 100).toFixed(1)
    : "0.0";

  return (
    <Card className="bg-banking-primary border border-banking-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-banking-text mb-4">Matching Records Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-banking-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-banking-text">Received Chargebacks → Representations</h4>
              <p className="text-sm text-banking-text/60">Linked representment cases</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-banking-text">
                {matchingRecords.receivedChargebacksLinked}
              </div>
              <div className="text-sm text-banking-text/60">
                of {matchingRecords.receivedChargebacksTotal} total
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-banking-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-banking-text">Issued Chargebacks → Representations</h4>
              <p className="text-sm text-banking-text/60">Linked representment cases</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-banking-text">
                {matchingRecords.issuedChargebacksLinked}
              </div>
              <div className="text-sm text-banking-text/60">
                of {matchingRecords.issuedChargebacksTotal} total
              </div>
            </div>
          </div>

          <div className="bg-banking-indicator/10 border border-banking-indicator/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-4 h-4 text-banking-indicator" />
              <span className="text-sm font-medium text-banking-text">Matching Rate</span>
            </div>
            <div className="text-2xl font-bold text-banking-text">{overallRate}%</div>
            <p className="text-xs text-banking-text/60 mt-1">Overall success rate for case matching</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
