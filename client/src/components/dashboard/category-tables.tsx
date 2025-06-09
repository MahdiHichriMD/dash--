import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, FileSpreadsheet, FileText, Eye, ExternalLink } from "lucide-react";
import { useState } from "react";
import { AdvancedFilters } from "@/components/advanced-filters";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from "date-fns";

interface CategoryRecord {
  id: number;
  refFichier: string;
  dateTraitementRpa: string;
  libCommercant: string;
  agence: string;
  amountCp: string;
  amountOrigine: string;
  processing: string;
  issuer: string;
  acquirer: string;
  settlement: string;
  transactionDate: string;
  cardholder: string;
  codeRejet?: string;
  [key: string]: any;
}

interface CategoryTablesProps {
  receivedChargebacks: CategoryRecord[];
  issuedChargebacks: CategoryRecord[];
  receivedRepresentments: CategoryRecord[];
  issuedRepresentments: CategoryRecord[];
  isLoading?: boolean;
}

const CATEGORY_CONFIG = {
  receivedChargebacks: {
    title: "Chargebacks Reçus Aujourd'hui",
    color: "red",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  issuedChargebacks: {
    title: "Chargebacks Émis Aujourd'hui",
    color: "orange", 
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  receivedRepresentments: {
    title: "Représentations Reçues Aujourd'hui",
    color: "blue",
    bgColor: "bg-blue-50", 
    borderColor: "border-blue-200",
  },
  issuedRepresentments: {
    title: "Représentations Émises Aujourd'hui",
    color: "green",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
};

const FILTER_CONFIGS = [
  { field: 'libCommercant', label: 'Commerçant', type: 'text' as const },
  { field: 'agence', label: 'Agence', type: 'text' as const },
  { field: 'issuer', label: 'Issuer', type: 'text' as const },
  { field: 'acquirer', label: 'Acquirer', type: 'text' as const },
  { field: 'processing', label: 'Processing', type: 'text' as const },
  { field: 'amountCp', label: 'Montant CP', type: 'amount' as const },
  { field: 'dateTraitementRpa', label: 'Date de traitement', type: 'date' as const },
];

export function CategoryTables({ 
  receivedChargebacks, 
  issuedChargebacks, 
  receivedRepresentments, 
  issuedRepresentments,
  isLoading 
}: CategoryTablesProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof CATEGORY_CONFIG>('receivedChargebacks');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filteredData, setFilteredData] = useState<CategoryRecord[]>([]);

  const categoryData = {
    receivedChargebacks,
    issuedChargebacks,
    receivedRepresentments,
    issuedRepresentments,
  };

  const currentData = categoryData[activeCategory] || [];
  const config = CATEGORY_CONFIG[activeCategory];

  const exportToExcel = (data: CategoryRecord[]) => {
    const exportData = data.map(item => ({
      'Référence': item.refFichier,
      'Date Traitement': format(new Date(item.dateTraitementRpa), 'dd/MM/yyyy'),
      'Commerçant': item.libCommercant,
      'Agence': item.agence,
      'Montant CP': parseFloat(item.amountCp),
      'Montant Origine': parseFloat(item.amountOrigine),
      'Processing': item.processing,
      'Issuer': item.issuer,
      'Acquirer': item.acquirer,
      'Settlement': item.settlement,
      'Date Transaction': format(new Date(item.transactionDate), 'dd/MM/yyyy'),
      'Porteur': item.cardholder,
      'Code Rejet': item.codeRejet || '',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, config.title);
    XLSX.writeFile(wb, `${activeCategory}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportToPDF = (data: CategoryRecord[]) => {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(16);
    doc.text(config.title, 14, 22);
    doc.setFontSize(10);
    doc.text(`Exporté le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}`, 14, 32);

    const tableData = data.map(item => [
      item.refFichier,
      format(new Date(item.dateTraitementRpa), 'dd/MM/yyyy'),
      item.libCommercant.substring(0, 20),
      item.agence,
      `€${parseFloat(item.amountCp).toLocaleString('fr-FR')}`,
      item.issuer?.substring(0, 15) || '',
      item.acquirer?.substring(0, 15) || '',
    ]);

    (doc as any).autoTable({
      head: [['Référence', 'Date', 'Commerçant', 'Agence', 'Montant CP', 'Issuer', 'Acquirer']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [67, 56, 202] },
      margin: { top: 40 },
    });

    doc.save(`${activeCategory}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const handleViewDetails = (record: CategoryRecord) => {
    console.log('View details for:', record.refFichier);
    // Implementation for viewing details
  };

  const handleOpenExternal = (record: CategoryRecord) => {
    console.log('Open external for:', record.refFichier);
    // Implementation for opening external link
  };

  const filteredRecords = currentData.filter(record => {
    if (!searchTerm) return true;
    return Object.values(record).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const dataToDisplay = showAdvancedFilters && filteredData.length > 0 ? filteredData : filteredRecords;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.keys(CATEGORY_CONFIG).map((key) => (
          <Card key={key} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-48"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const count = categoryData[key as keyof typeof categoryData]?.length || 0;
          const isActive = activeCategory === key;
          
          return (
            <Button
              key={key}
              variant={isActive ? "default" : "outline"}
              className={`p-4 h-auto flex flex-col items-center space-y-2 ${
                isActive ? config.bgColor : 'hover:' + config.bgColor
              }`}
              onClick={() => setActiveCategory(key as keyof typeof CATEGORY_CONFIG)}
            >
              <span className="text-sm font-medium">{config.title}</span>
              <Badge variant={isActive ? "secondary" : "outline"} className="text-xs">
                {count} enregistrements
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Active Category Table */}
      <Card className={`${config.borderColor} border-2`}>
        <CardHeader className={config.bgColor}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-banking-text">
              {config.title}
            </CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center space-x-1"
              >
                <Filter className="h-4 w-4" />
                <span>Filtres avancés</span>
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToExcel(dataToDisplay)}
                  className="flex items-center space-x-1"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Excel</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToPDF(dataToDisplay)}
                  className="flex items-center space-x-1"
                >
                  <FileText className="h-4 w-4" />
                  <span>PDF</span>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="p-6 border-b bg-gray-50">
              <AdvancedFilters
                filters={FILTER_CONFIGS}
                data={currentData}
                onFilteredData={setFilteredData}
                tableName={activeCategory}
              />
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Référence</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Commerçant</TableHead>
                  <TableHead>Agence</TableHead>
                  <TableHead>Montant CP</TableHead>
                  <TableHead>Montant Origine</TableHead>
                  <TableHead>Issuer</TableHead>
                  <TableHead>Acquirer</TableHead>
                  <TableHead>Processing</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataToDisplay.map((record) => (
                  <TableRow key={record.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {record.refFichier}
                    </TableCell>
                    <TableCell>
                      {format(new Date(record.dateTraitementRpa), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {record.libCommercant}
                    </TableCell>
                    <TableCell>{record.agence}</TableCell>
                    <TableCell className="text-right">
                      {parseFloat(record.amountCp).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {parseFloat(record.amountOrigine).toLocaleString('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                      })}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {record.issuer}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {record.acquirer}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.processing}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(record)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenExternal(record)}
                          className="h-8 w-8 p-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {dataToDisplay.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun enregistrement trouvé pour cette catégorie
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}