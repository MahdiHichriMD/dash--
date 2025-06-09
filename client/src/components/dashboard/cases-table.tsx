import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, ExternalLink, Search, ArrowDown, ArrowUp, Link } from "lucide-react";
import { TodayCase } from "@/lib/types";
import { format } from "date-fns";
import { useState } from "react";

interface CasesTableProps {
  cases: TodayCase[];
  onSearch?: (query: string) => void;
  onFilter?: (type: string) => void;
}

export function CasesTable({ cases, onSearch, onFilter }: CasesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleFilter = (value: string) => {
    setFilterType(value);
    onFilter?.(value);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'received_chargeback':
        return <ArrowDown className="w-3 h-3 mr-1" />;
      case 'issued_representment':
        return <ArrowUp className="w-3 h-3 mr-1" />;
      case 'issued_chargeback':
        return <ArrowUp className="w-3 h-3 mr-1" />;
      case 'received_representment':
        return <ArrowDown className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      'received_chargeback': { label: 'Received CB', className: 'bg-banking-error/20 text-banking-error' },
      'issued_representment': { label: 'Issued Rep', className: 'bg-banking-indicator/20 text-banking-indicator' },
      'issued_chargeback': { label: 'Issued CB', className: 'bg-banking-error/20 text-banking-error' },
      'received_representment': { label: 'Received Rep', className: 'bg-banking-indicator/20 text-banking-indicator' }
    };

    const badge = badges[type as keyof typeof badges] || { label: 'Unknown', className: 'bg-gray-100 text-gray-800' };

    return (
      <Badge className={`inline-flex items-center text-xs font-medium ${badge.className}`}>
        {getTypeIcon(type)}
        {badge.label}
      </Badge>
    );
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(num);
  };

  return (
    <Card className="bg-banking-primary border border-banking-gray-200 shadow-sm">
      <div className="p-6 border-b border-banking-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-banking-text">Today's Cases</h3>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-banking-text/60">Filter by:</label>
              <Select value={filterType} onValueChange={handleFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="received_chargeback">Received Chargebacks</SelectItem>
                  <SelectItem value="issued_representment">Issued Representments</SelectItem>
                  <SelectItem value="issued_chargeback">Issued Chargebacks</SelectItem>
                  <SelectItem value="received_representment">Received Representments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Search cases..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-64"
              />
              <Button className="bg-banking-indicator text-banking-primary hover:bg-banking-indicator/90">
                <Search className="w-4 h-4 mr-2" />
                Advanced
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
                Type
              </th>
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
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">
                Linked
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-banking-primary divide-y divide-banking-gray-200">
            {cases.length > 0 ? (
              cases.map((case_, index) => (
                <tr key={index} className="hover:bg-banking-gray-50 banking-transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(case_.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-banking-text">
                      {case_.refFichier}
                    </div>
                    <div className="text-xs text-banking-text/60">
                      {format(new Date(case_.dateTraitementRpa), "MMM dd, HH:mm")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-banking-text">{case_.libCommercant}</div>
                    <div className="text-xs text-banking-text/60">{case_.agence}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-banking-text">
                      {formatAmount(case_.amountCp)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className="bg-banking-indicator/20 text-banking-indicator">
                      Processing
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Link className="w-4 h-4 text-banking-indicator mr-2" />
                      <span className="text-sm text-banking-text">-</span>
                    </div>
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
                  No cases available for today
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {cases.length > 0 && (
        <div className="px-6 py-4 border-t border-banking-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-banking-text/60">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">{cases.length}</span> of{" "}
              <span className="font-medium">{cases.length}</span> results
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
  );
}
