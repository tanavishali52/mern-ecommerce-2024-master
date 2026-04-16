import { Outlet } from "react-router-dom";
import EnhancedHeader from "./enhanced-header";
import GuestCheckoutModal from "./guest-checkout-modal-simple";
import WhatsAppButton from "../common/whatsapp-button";
import WhatsAppErrorBoundary from "../common/whatsapp-error-boundary";
import EnhancedFooter from "../common/footer/EnhancedFooter";

function ShoppingLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <EnhancedHeader />
      <main className="flex-1 w-full pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <Outlet />
        </div>
      </main>
      <EnhancedFooter variant="default" />
      <GuestCheckoutModal />
      <WhatsAppErrorBoundary>
        <WhatsAppButton />
      </WhatsAppErrorBoundary>
    </div>
  );
}

export default ShoppingLayout;
