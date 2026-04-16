import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import WhatsAppButton from "../common/whatsapp-button";
import WhatsAppErrorBoundary from "../common/whatsapp-error-boundary";

function AuthLayout() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/shop/home");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen relative">
      <div></div>
      <div>
        <Outlet />
      </div>
      <WhatsAppErrorBoundary>
        <WhatsAppButton />
      </WhatsAppErrorBoundary>
    </div>
  );
}

export default AuthLayout;
