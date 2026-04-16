import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isGuest = location.state?.isGuest;

  return (
    <Card className="p-10 text-center max-w-2xl mx-auto my-20">
      <CardHeader className="p-0">
        <CardTitle className="text-4xl text-green-600 mb-4">Order Placed Successfully!</CardTitle>
      </CardHeader>
      <p className="text-gray-600 mb-8">
        Thank you for your purchase. {isGuest ? "We'll contact you on WhatsApp to confirm your order details shortly." : "You can track your order status in your account."}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {!isGuest ? (
          <Button onClick={() => navigate("/shop/account")}>
            View Orders
          </Button>
        ) : null}
        <Button variant="outline" onClick={() => navigate("/shop/home")}>
          Back to Home
        </Button>
      </div>
    </Card>
  );
}

export default PaymentSuccessPage;
