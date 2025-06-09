import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, X, Download, FileSpreadsheet } from "lucide-react";
import { format } from "date-fns";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface FilterConfig {
  field: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'amount';
  options?: string[];
}

interface AdvancedFiltersProps {
  filters: FilterConfig[];
  data: any[];
  onFilteredData: (filteredData: any[]) => void;
  tableName: string;
}

export function AdvancedFilters({ filters, data, onFilteredData, tableName }: AdvancedFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const applyFilters = (newFilters: Record<string, any>) => {
    setActiveFilters(newFilters);
    
    let filteredData = [...data];
    
    Object.entries(newFilters).forEach(([field, value]) => {
      if (value && value !== '' && value !== 'all') {
        const filterConfig = filters.find(f => f.field === field);
        
        if (filterConfig?.type === 'text') {
          filteredData = filteredData.filter(item => 
            item[field]?.toString().toLowerCase().includes(value.toLowerCase())
          );
        } else if (filterConfig?.type === 'select') {
          filteredData = filteredData.filter(item => item[field] === value);
        } else if (filterConfig?.type === 'date') {
          const itemDate = new Date(item[field]);
          const filterDate = new Date(value);
          filteredData = filteredData.filter(item => 
            itemDate.toDateString() === filterDate.toDateString()
          );
        } else if (filterConfig?.type === 'amount') {
          const amount = parseFloat(item[field]);
          const filterAmount = parseFloat(value);
          if (!isNaN(filterAmount)) {
            filteredData = filteredData.filter(item => amount >= filterAmount);
          }
        }
      }
    });
    
    onFilteredData(filteredData);
  };

  const updateFilter = (field: string, value: any) => {
    const newFilters = { ...activeFilters, [field]: value };
    applyFilters(newFilters);
  };

  const clearFilter = (field: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[field];
    applyFilters(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onFilteredData(data);
  };

  const exportToExcel = () => {
    const filteredData = Object.keys(activeFilters).length > 0 ? 
      data.filter(item => {
        return Object.entries(activeFilters).every(([field, value]) => {
          if (!value || value === '' || value === 'all') return true;
          const filterConfig = filters.find(f => f.field === field);
          
          if (filterConfig?.type === 'text') {
            return item[field]?.toString().toLowerCase().includes(value.toLowerCase());
          } else if (filterConfig?.type === 'select') {
            return item[field] === value;
          } else if (filterConfig?.type === 'date') {
            const itemDate = new Date(item[field]);
            const filterDate = new Date(value);
            return itemDate.toDateString() === filterDate.toDateString();
          } else if (filterConfig?.type === 'amount') {
            const amount = parseFloat(item[field]);
            const filterAmount = parseFloat(value);
            return !isNaN(filterAmount) ? amount >= filterAmount : true;
          }
          return true;
        });
      }) : data;

    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, tableName);
    XLSX.writeFile(wb, `${tableName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const exportToPDF = () => {
    const filteredData = Object.keys(activeFilters).length > 0 ? 
      data.filter(item => {
        return Object.entries(activeFilters).every(([field, value]) => {
          if (!value || value === '' || value === 'all') return true;
          const filterConfig = filters.find(f => f.field === field);
          
          if (filterConfig?.type === 'text') {
            return item[field]?.toString().toLowerCase().includes(value.toLowerCase());
          } else if (filterConfig?.type === 'select') {
            return item[field] === value;
          } else if (filterConfig?.type === 'date') {
            const itemDate = new Date(item[field]);
            const filterDate = new Date(value);
            return itemDate.toDateString() === filterDate.toDateString();
          } else if (filterConfig?.type === 'amount') {
            const amount = parseFloat(item[field]);
            const filterAmount = parseFloat(value);
            return !isNaN(filterAmount) ? amount >= filterAmount : true;
          }
          return true;
        });
      }) : data;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(`${tableName} Report`, 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated on ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 20, 30);
    
    // Prepare table data
    const headers = filters.map(f => f.label);
    const rows = filteredData.map(item => 
      filters.map(f => {
        const value = item[f.field];
        if (f.type === 'date' && value) {
          return format(new Date(value), 'yyyy-MM-dd');
        } else if (f.type === 'amount' && value) {
          return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
          }).format(parseFloat(value));
        }
        return value || '-';
      })
    );

    // Add table
    (doc as any).autoTable({
      head: [headers],
      body: rows,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [238, 177, 69] }, // Banking indicator color
    });

    doc.save(`${tableName}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  const renderFilterInput = (filter: FilterConfig) => {
    const value = activeFilters[filter.field] || '';

    switch (filter.type) {
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => updateFilter(filter.field, val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`All ${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "MMM dd, yyyy") : `Select ${filter.label}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => updateFilter(filter.field, date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'amount':
        return (
          <Input
            type="number"
            placeholder={`Min ${filter.label}`}
            value={value}
            onChange={(e) => updateFilter(filter.field, e.target.value)}
            className="w-full"
          />
        );

      default:
        return (
          <Input
            type="text"
            placeholder={`Search ${filter.label}`}
            value={value}
            onChange={(e) => updateFilter(filter.field, e.target.value)}
            className="w-full"
          />
        );
    }
  };

  return (
    <Card className="bg-banking-primary border border-banking-gray-200 shadow-sm mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Advanced Filters</span>
              {activeFilterCount > 0 && (
                <Badge className="bg-banking-indicator text-banking-primary">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-banking-error"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToExcel}
              className="flex items-center space-x-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToPDF}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>PDF</span>
            </Button>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(activeFilters).map(([field, value]) => {
              if (!value || value === '' || value === 'all') return null;
              const filter = filters.find(f => f.field === field);
              let displayValue = value;
              
              if (filter?.type === 'date') {
                displayValue = format(new Date(value), 'MMM dd, yyyy');
              } else if (filter?.type === 'amount') {
                displayValue = `≥ €${value}`;
              }

              return (
                <Badge key={field} variant="outline" className="flex items-center space-x-1">
                  <span className="text-xs">{filter?.label}: {displayValue}</span>
                  <button
                    onClick={() => clearFilter(field)}
                    className="ml-1 hover:text-banking-error"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}

        {/* Filter Inputs */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filters.map(filter => (
              <div key={filter.field} className="space-y-2">
                <label className="text-sm font-medium text-banking-text">
                  {filter.label}
                </label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}