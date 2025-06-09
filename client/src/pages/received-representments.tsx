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
import * as XLSX from 'xlsx';

interface ReceivedRepresentment {
  id: number;
  refFichier: string;
  libCommercant: string;
  agence: string;
  amountCp: string;
  processing: string;
  issuer: string;
  settlement: string;
  dateTraitementRpa: string;
  transactionDate: string;
  cardholder: string;
  acquirer: string;
  codeRejet: string;
}

export default function ReceivedRepresentments() {
  const { token } = useAuth();
  const [filteredData, setFilteredData] = useState<ReceivedRepresentment[]>([]);

  const {
    data: representments,
    isLoading,
    refetch,
  } = useQuery<ReceivedRepresentment[]>({
    queryKey: ["/api/received-representments"],
    enabled: !!token,
  });

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = () => {
    const dataToExport = filteredData.length > 0 ? filteredData : (Array.isArray(representments) ? representments : []);
    
    if (dataToExport.length > 0) {
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Received Representments');
      XLSX.writeFile(wb, `received_representments_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    }
  };

  const handleViewDetails = (representment: ReceivedRepresentment) => {
    console.log('View details for:', representment.refFichier);
    alert(`Viewing details for representment: ${representment.refFichier}`);
  };

  const handleOpenExternal = (representment: ReceivedRepresentment) => {
    console.log('Open external for:', representment.refFichier);
    alert(`Opening external link for: ${representment.refFichier}`);
  };

  const filterConfigs = [
    { field: 'refFichier', label: 'Reference', type: 'text' as const },
    { field: 'libCommercant', label: 'Merchant', type: 'text' as const },
    { field: 'agence', label: 'Agency', type: 'text' as const },
    { field: 'amountCp', label: 'Amount', type: 'amount' as const },
    { field: 'processing', label: 'Processing', type: 'select' as const, options: ['VISA', 'MASTERCARD', 'AMEX'] },
    { field: 'issuer', label: 'Issuer', type: 'text' as const },
    { field: 'settlement', label: 'Settlement', type: 'select' as const, options: ['PENDING', 'PROCESSED', 'RESOLVED'] },
    { field: 'dateTraitementRpa', label: 'Processing Date', type: 'date' as const },
    { field: 'transactionDate', label: 'Transaction Date', type: 'date' as const },
    { field: 'cardholder', label: 'Cardholder', type: 'text' as const },
    { field: 'acquirer', label: 'Acquirer', type: 'text' as const },
    { field: 'codeRejet', label: 'Rejection Code', type: 'text' as const },
  ];

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const displayData = filteredData.length > 0 ? filteredData : (Array.isArray(representments) ? representments : []);

  return (
    <div className="p-6 space-y-6">
      <Header 
        title="Received Representments" 
        subtitle="Track and manage incoming representment cases"
        onRefresh={handleRefresh}
        onExport={handleExport}
        isLoading={isLoading}
      />

      {/* Advanced Filters */}
      <AdvancedFilters
        filters={filterConfigs}
        data={Array.isArray(representments) ? representments : []}
        onFilteredData={setFilteredData}
        tableName="Received Representments"
      />

      {/* Statistics Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-banking-primary border border-banking-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ArrowDown className="w-4 h-4 text-banking-indicator" />
              <div>
                <p className="text-sm font-medium text-banking-text/70">Total Cases</p>
                <p className="text-2xl font-bold text-banking-text">{displayData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-banking-primary border border-banking-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-sm font-medium text-banking-text/70">Total Amount</p>
                <p className="text-2xl font-bold text-banking-text">
                  {formatAmount(displayData.reduce((sum, item) => sum + parseFloat(item.amountCp || '0'), 0).toString())}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-banking-primary border border-banking-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-sm font-medium text-banking-text/70">VISA Cases</p>
                <p className="text-2xl font-bold text-banking-text">
                  {displayData.filter(item => item.processing === 'VISA').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-banking-primary border border-banking-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-sm font-medium text-banking-text/70">Avg Amount</p>
                <p className="text-2xl font-bold text-banking-text">
                  {displayData.length > 0 ? 
                    formatAmount((displayData.reduce((sum, item) => sum + parseFloat(item.amountCp || '0'), 0) / displayData.length).toString()) : 
                    '€0.00'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="bg-banking-primary border border-banking-gray-200">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-banking-gray-50 border-b border-banking-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">Merchant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">Agency</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">Processing</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">Issuer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">Settlement</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">Processing Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">Transaction Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">Cardholder</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">Acquirer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">Rejection Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-banking-text/70 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-banking-gray-200">
                  {displayData.map((representment, index) => (
                    <tr key={representment.id || index} className="hover:bg-banking-gray-50/50 banking-transition">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-banking-text">{representment.refFichier}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-banking-text max-w-[200px] truncate" title={representment.libCommercant}>
                          {representment.libCommercant}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-banking-text">{representment.agence}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-banking-text">
                          {formatAmount(representment.amountCp)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge 
                          variant={representment.processing === 'VISA' ? 'default' : 'secondary'}
                          className={
                            representment.processing === 'VISA' ? 'bg-blue-100 text-blue-800' :
                            representment.processing === 'MASTERCARD' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {representment.processing}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-banking-text">{representment.issuer}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge 
                          variant={representment.settlement === 'PROCESSED' ? 'default' : 'secondary'}
                          className={
                            representment.settlement === 'PROCESSED' ? 'bg-green-100 text-green-800' :
                            representment.settlement === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {representment.settlement}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-banking-text">
                          {formatDate(representment.dateTraitementRpa)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-banking-text">
                          {formatDate(representment.transactionDate)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-banking-text max-w-[150px] truncate" title={representment.cardholder}>
                          {representment.cardholder}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-banking-text">{representment.acquirer}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-banking-text">{representment.codeRejet}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-banking-gray-100"
                            onClick={() => handleViewDetails(representment)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 hover:bg-banking-gray-100"
                            onClick={() => handleOpenExternal(representment)}
                            title="Open External"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!isLoading && displayData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-banking-text/70">No received representments found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}