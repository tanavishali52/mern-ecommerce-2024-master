import {
  BadgeCheck,
  ChartNoAxesCombined,
  LayoutDashboard,
  ShoppingBasket,
  Settings,
  X,
} from "lucide-react";
import { Fragment } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const adminSidebarMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard />,
  },
  {
    id: "products",
    label: "Products",
    path: "/admin/products",
    icon: <ShoppingBasket />,
  },
  {
    id: "orders",
    label: "Orders",
    path: "/admin/orders",
    icon: <BadgeCheck />,
  },
  {
    id: "settings",
    label: "Settings",
    path: "/admin/settings",
    icon: <Settings />,
  },
];

function MenuItems({ setOpen, isMobile = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile && setOpen) {
      setOpen(false);
    }
  };

  return (
    <nav className="mt-8 flex-col flex gap-2">
      {adminSidebarMenuItems.map((menuItem) => {
        const isActive = location.pathname === menuItem.path;
        
        return (
          <button
            key={menuItem.id}
            onClick={() => handleNavigation(menuItem.path)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-all duration-200",
              "min-h-[48px] touch-manipulation", // Touch-friendly height
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground"
            )}
          >
            <span className="flex-shrink-0">{menuItem.icon}</span>
            <span className="font-medium text-sm sm:text-base">{menuItem.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function AdminSideBar({ open, setOpen, isMobile, isTablet }) {
  const navigate = useNavigate();

  return (
    <Fragment>
      {/* Mobile/Tablet Sidebar - Sheet overlay */}
      {(isMobile || isTablet) && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-72 p-0 border-r">
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <SheetHeader className="border-b p-6">
                <div className="flex items-center justify-between">
                  <SheetTitle className="flex items-center gap-3">
                    <ChartNoAxesCombined size={28} className="text-primary" />
                    <span className="text-xl font-bold">Admin Panel</span>
                  </SheetTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpen(false)}
                    className="h-8 w-8"
                  >
                    <X size={16} />
                  </Button>
                </div>
              </SheetHeader>
              
              {/* Mobile Navigation */}
              <div className="flex-1 px-6 pb-6">
                <MenuItems setOpen={setOpen} isMobile={true} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop Sidebar - Fixed */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-background">
        <div className="p-6">
          {/* Desktop Header */}
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <ChartNoAxesCombined size={32} className="text-primary" />
            <h1 className="text-2xl font-bold">Admin Panel</h1>
          </button>
          
          {/* Desktop Navigation */}
          <MenuItems />
        </div>
      </aside>
    </Fragment>
  );
}

export default AdminSideBar;
