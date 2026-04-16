import { Outlet } from "react-router-dom";
import AdminSideBar from "./sidebar";
import AdminHeader from "./header";
import { useState } from "react";
import { useResponsive } from "@/hooks/useResponsive";
import WhatsAppButton from "../common/whatsapp-button";
import WhatsAppErrorBoundary from "../common/whatsapp-error-boundary";
import EnhancedFooter from "../common/footer/EnhancedFooter";

function AdminLayout() {
  const [openSidebar, setOpenSidebar] = useState(false);
  const { isMobile, isTablet } = useResponsive();

  // Close sidebar when switching to desktop
  const handleSidebarToggle = (isOpen) => {
    setOpenSidebar(isOpen);
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Admin sidebar - responsive behavior */}
      <AdminSideBar 
        open={openSidebar} 
        setOpen={handleSidebarToggle}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      
      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Admin header - responsive */}
        <AdminHeader 
          setOpen={handleSidebarToggle} 
          isMobile={isMobile}
          isTablet={isTablet}
        />
        
        {/* Main content with responsive padding */}
        <main className="flex-1 flex flex-col bg-muted/40 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="w-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Admin Footer - Minimal variant */}
        <EnhancedFooter 
          variant="minimal" 
          showNewsletter={false}
          showContactInfo={false}
          className="mt-auto"
        />
      </div>

      {/* Mobile overlay when sidebar is open */}
      {(isMobile || isTablet) && openSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpenSidebar(false)}
          aria-hidden="true"
        />
      )}

      {/* WhatsApp Button for admin support */}
      <WhatsAppErrorBoundary>
        <WhatsAppButton />
      </WhatsAppErrorBoundary>
    </div>
  );
}

export default AdminLayout;
