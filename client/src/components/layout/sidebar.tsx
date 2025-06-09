import { Link, useLocation } from "wouter";
import { 
  Home, 
  ArrowDown, 
  ArrowUp, 
  Settings, 
  Shield,
  ChevronDown,
  BarChart3,
  User
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [chargebacks1Open, setChargebacks1Open] = useState(true);
  const [chargebacks2Open, setChargebacks2Open] = useState(true);

  const isActive = (path: string) => location === path;

  return (
    <aside className="w-70 bg-banking-primary border-r border-banking-gray-200 flex-shrink-0 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-banking-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-banking-indicator rounded-lg flex items-center justify-center">
            <BarChart3 className="text-banking-primary w-4 h-4" />
          </div>
          <h1 className="text-lg font-semibold text-banking-text">Banking Analytics</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 flex-1">
        {/* Dashboard */}
        <div className="mb-4">
          <Link href="/">
            <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg banking-transition ${
              isActive("/") 
                ? "bg-banking-indicator/10 text-banking-indicator font-medium" 
                : "hover:bg-banking-gray-100 text-banking-text/70 hover:text-banking-text"
            }`}>
              <Home className="w-4 h-4" />
              <span>Today Dashboard</span>
            </a>
          </Link>
        </div>

        {/* Chargebacks 1 Section */}
        <div className="space-y-1">
          <Collapsible open={chargebacks1Open} onOpenChange={setChargebacks1Open}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-banking-text/70 uppercase tracking-wider hover:text-banking-text banking-transition">
              <span>Chargebacks 1</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${chargebacks1Open ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-4 space-y-1">
              <Link href="/received-chargebacks">
                <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg banking-transition ${
                  isActive("/received-chargebacks")
                    ? "bg-banking-indicator/10 text-banking-indicator font-medium"
                    : "text-banking-text/70 hover:text-banking-text hover:bg-banking-gray-100"
                }`}>
                  <ArrowDown className="w-3 h-3 text-banking-error" />
                  <span>Received Chargebacks</span>
                </a>
              </Link>
              <Link href="/issued-representments">
                <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg banking-transition ${
                  isActive("/issued-representments")
                    ? "bg-banking-indicator/10 text-banking-indicator font-medium"
                    : "text-banking-text/70 hover:text-banking-text hover:bg-banking-gray-100"
                }`}>
                  <ArrowUp className="w-3 h-3 text-banking-indicator" />
                  <span>Issued Representments</span>
                </a>
              </Link>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Chargebacks 2 Section */}
        <div className="space-y-1">
          <Collapsible open={chargebacks2Open} onOpenChange={setChargebacks2Open}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-banking-text/70 uppercase tracking-wider hover:text-banking-text banking-transition">
              <span>Chargebacks 2</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${chargebacks2Open ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-4 space-y-1">
              <Link href="/issued-chargebacks">
                <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg banking-transition ${
                  isActive("/issued-chargebacks")
                    ? "bg-banking-indicator/10 text-banking-indicator font-medium"
                    : "text-banking-text/70 hover:text-banking-text hover:bg-banking-gray-100"
                }`}>
                  <ArrowUp className="w-3 h-3 text-banking-error" />
                  <span>Issued Chargebacks</span>
                </a>
              </Link>
              <Link href="/received-representments">
                <a className={`flex items-center space-x-3 px-3 py-2 rounded-lg banking-transition ${
                  isActive("/received-representments")
                    ? "bg-banking-indicator/10 text-banking-indicator font-medium"
                    : "text-banking-text/70 hover:text-banking-text hover:bg-banking-gray-100"
                }`}>
                  <ArrowDown className="w-3 h-3 text-banking-indicator" />
                  <span>Received Representments</span>
                </a>
              </Link>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Settings Section */}
        <div className="pt-4 border-t border-banking-gray-200 mt-6 space-y-1">
          <Link href="/settings">
            <a className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-banking-gray-100 text-banking-text/70 hover:text-banking-text banking-transition">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </a>
          </Link>
          <Link href="/audit">
            <a className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-banking-gray-100 text-banking-text/70 hover:text-banking-text banking-transition">
              <Shield className="w-4 h-4" />
              <span>Audit Log</span>
            </a>
          </Link>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-banking-gray-200 bg-banking-primary">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-banking-indicator rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-banking-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-banking-text truncate">
              {user?.username || "User"}
            </p>
            <p className="text-xs text-banking-text/60 truncate">
              {user?.role || "Analyst"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="p-1 hover:bg-banking-gray-100"
          >
            <i className="fas fa-sign-out-alt text-banking-text/60 text-xs"></i>
          </Button>
        </div>
      </div>
    </aside>
  );
}
