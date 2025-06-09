import { Clock, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState, useEffect } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
}

export function Header({ 
  title, 
  subtitle, 
  onRefresh, 
  onExport, 
  isLoading = false 
}: HeaderProps) {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      setLastUpdate(new Date());
    }
  };

  return (
    <header className="bg-banking-primary border-b border-banking-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-banking-text">{title}</h2>
          <p className="text-sm text-banking-text/60 mt-1">
            {subtitle || `${format(new Date(), "MMMM dd, yyyy")} - Real-time Analytics`}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-banking-gray-100 px-3 py-2 rounded-lg">
            <Clock className="w-4 h-4 text-banking-text/60" />
            <span className="text-sm text-banking-text">
              Last updated: {format(lastUpdate, "HH:mm")}
            </span>
          </div>
          {onRefresh && (
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 bg-banking-indicator text-banking-primary px-4 py-2 rounded-lg hover:bg-banking-indicator/90 banking-transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="font-medium">Refresh</span>
            </Button>
          )}
          {onExport && (
            <Button
              onClick={onExport}
              variant="outline"
              className="flex items-center space-x-2 border border-banking-gray-300 text-banking-text px-4 py-2 rounded-lg hover:bg-banking-gray-100 banking-transition"
            >
              <Download className="w-4 h-4" />
              <span className="font-medium">Export</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
