import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, ExternalLink, ArrowDown } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { format } from "date-fns";
import { useState } from "react";
import { AdvancedFilters } from "@/components/advanced-filters";

export default function ReceivedChargebacks() {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const {
    data: chargebacks,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["/api/received-chargebacks"],
    enabled: !!token,
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    console.log("Export received chargebacks");
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(num);
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-banking-text/60">Please log in to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Received Chargebacks"
        subtitle="Manage and analyze received chargeback cases"
        onRefresh={handleRefresh}
        onExport={handleExport}
        isLoading={isLoading}
      />

      <div className="p-6">
        <Card className="bg-banking-primary border border-banking-gray-200 shadow-sm">
          <div className="p-6 border-b border-banking-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ArrowDown className="w-5 h-5 text-banking-error" />
                <h3 className="text-lg font-semibold text-banking-text">Received Chargebacks</h3>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-banking-text/60">Status:</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Search chargebacks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <Button className="bg-banking-indicator text-banking-primary hover:bg-banking-indicator/90">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-banking-gray-50 border-b border-banking-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">
                    Merchant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">
                    Issuer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">
                    Transaction Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-banking-primary divide-y divide-banking-gray-200">
                {isLoading ? (
                  [...Array(10)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-16" /></td>
                    </tr>
                  ))
                ) : chargebacks && chargebacks.length > 0 ? (
                  chargebacks.map((chargeback: any, index: number) => (
                    <tr key={index} className="hover:bg-banking-gray-50 banking-transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-banking-text">
                          {chargeback.refFichier}
                        </div>
                        <div className="text-xs text-banking-text/60">
                          {format(new Date(chargeback.dateTraitementRpa), "MMM dd, yyyy HH:mm")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-banking-text">{chargeback.libCommercant}</div>
                        <div className="text-xs text-banking-text/60">{chargeback.agence}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-banking-text">
                          {formatAmount(chargeback.amountCp)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-banking-text">
                          {chargeback.libBank || chargeback.issuer || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-banking-text">
                          {format(new Date(chargeback.transactionDate), "MMM dd, yyyy")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className="bg-banking-indicator/20 text-banking-indicator">
                          Processing
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" className="mr-3">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-banking-text/60">
                      No received chargebacks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {chargebacks && chargebacks.length > 0 && (
            <div className="px-6 py-4 border-t border-banking-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-banking-text/60">
                  Showing <span className="font-medium">1</span> to{" "}
                  <span className="font-medium">{chargebacks.length}</span> of{" "}
                  <span className="font-medium">{chargebacks.length}</span> results
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button className="bg-banking-indicator text-banking-primary" size="sm">
                    1
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
