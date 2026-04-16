import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/use-toast";
import { X, ShoppingBag, Phone, MapPin, User } from "lucide-react";
import {
    closeGuestCheckout,
    submitGuestOrder,
    setOrderData,
    clearError
} from "@/store/shop/guest-checkout-slice";
import { showOrderConfirmation, hideOrderConfirmation } from "@/store/shop/order-confirmation-slice";
import OrderConfirmationModal from "./order-confirmation-modal";

function GuestCheckoutModal() {
    const dispatch = useDispatch();
    const { toast } = useToast();

    const {
        isModalOpen,
        selectedProduct,
        isLoading,
        error,
        orderConfirmation
    } = useSelector((state) => state.shopGuestCheckout);

    const { 
        isModalOpen: isConfirmationOpen 
    } = useSelector((state) => state.orderConfirmation);

    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        shippingAddress: "",
        city: ""
    });

    const [formErrors, setFormErrors] = useState({});

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!isModalOpen) {
            setFormData({
                fullName: "",
                phoneNumber: "",
                shippingAddress: "",
                city: ""
            });
            setFormErrors({});
            dispatch(clearError());
        }
    }, [isModalOpen, dispatch]);

    // Show order confirmation modal when order is confirmed
    useEffect(() => {
        if (orderConfirmation) {
            // Close the guest checkout modal
            dispatch(closeGuestCheckout());
            
            // Show the order confirmation modal with enhanced data
            const confirmationData = {
                orderId: orderConfirmation.orderId || orderConfirmation._id,
                totalAmount: orderConfirmation.totalAmount || selectedProduct?.salePrice || selectedProduct?.price,
                customerName: formData.fullName,
                paymentMethod: orderConfirmation.paymentMethod || 'cod',
                isGuest: true,
                orderDate: new Date().toISOString(),
                products: orderConfirmation.products || [selectedProduct]
            };
            
            dispatch(showOrderConfirmation(confirmationData));
        }
    }, [orderConfirmation, dispatch, formData.fullName, selectedProduct]);

    const validateForm = () => {
        const errors = {};

        if (!formData.fullName.trim()) {
            errors.fullName = "Full name is required";
        }

        if (!formData.phoneNumber.trim()) {
            errors.phoneNumber = "WhatsApp number is required";
        } else if (!/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phoneNumber.trim())) {
            errors.phoneNumber = "Please enter a valid phone number";
        }

        if (!formData.shippingAddress.trim()) {
            errors.shippingAddress = "Shipping address is required";
        }

        if (!formData.city.trim()) {
            errors.city = "City is required";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error for this field when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({
                ...prev,
                [field]: ""
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!selectedProduct) {
            toast({
                title: "Error",
                description: "No product selected",
                variant: "destructive"
            });
            return;
        }

        const orderData = {
            product: {
                _id: selectedProduct._id,
                title: selectedProduct.title,
                price: selectedProduct.salePrice || selectedProduct.price,
                image: selectedProduct.images?.[0]?.url || selectedProduct.image,
                images: selectedProduct.images
            },
            customer: {
                fullName: formData.fullName.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                shippingAddress: formData.shippingAddress.trim(),
                city: formData.city.trim()
            },
            totalAmount: selectedProduct.salePrice || selectedProduct.price,
            paymentMethod: "cod"
        };

        // Store order data locally for persistence
        dispatch(setOrderData(orderData));

        // Submit the order
        try {
            await dispatch(submitGuestOrder(orderData)).unwrap();
            toast({
                title: "Order Placed Successfully!",
                description: "We'll contact you on WhatsApp to confirm your order.",
            });
        } catch (error) {
            toast({
                title: "Order Failed",
                description: error || "Failed to place order. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleClose = () => {
        dispatch(closeGuestCheckout());
    };

    const generateWhatsAppLink = () => {
        if (!orderConfirmation || !selectedProduct) return "#";

        const message = `Hi! I just placed an order on your website.

Order Details:
- Product: ${selectedProduct.title}
- Price: PKR ${selectedProduct.salePrice || selectedProduct.price}
- Customer: ${formData.fullName}
- Address: ${formData.shippingAddress}, ${formData.city}
- Phone: ${formData.phoneNumber}

Order ID: ${orderConfirmation.orderId || orderConfirmation._id}`;

        return `https://wa.me/923181234567?text=${encodeURIComponent(message)}`;
    };

    if (!isModalOpen) return null;

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogTitle className="sr-only">Guest Checkout</DialogTitle>
                <DialogDescription className="sr-only">
                    Complete your purchase without creating an account
                </DialogDescription>

                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-orange-600" />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Quick Checkout
                        </h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className="h-8 w-8 rounded-full"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Checkout Form */}
                <div className="px-6 pb-6 space-y-6">
                        {/* Product Display */}
                        {selectedProduct && (
                            <div className="bg-gray-50 rounded-lg p-4 flex gap-4">
                                <img
                                    src={selectedProduct.images?.[0]?.url || selectedProduct.image}
                                    alt={selectedProduct.title}
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 line-clamp-2">
                                        {selectedProduct.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {selectedProduct.salePrice > 0 ? (
                                            <>
                                                <span className="text-lg font-bold text-orange-600">
                                                    PKR {selectedProduct.salePrice}
                                                </span>
                                                <span className="text-sm text-gray-500 line-through">
                                                    PKR {selectedProduct.price}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-lg font-bold text-gray-900">
                                                PKR {selectedProduct.price}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Full Name
                                </Label>
                                <Input
                                    id="fullName"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                                    placeholder="Enter your full name"
                                    className={formErrors.fullName ? "border-red-500" : ""}
                                />
                                {formErrors.fullName && (
                                    <p className="text-sm text-red-600">{formErrors.fullName}</p>
                                )}
                            </div>

                            {/* WhatsApp Number */}
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    WhatsApp Number
                                </Label>
                                <Input
                                    id="phoneNumber"
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                                    placeholder="+92 318 1234567"
                                    className={formErrors.phoneNumber ? "border-red-500" : ""}
                                />
                                {formErrors.phoneNumber && (
                                    <p className="text-sm text-red-600">{formErrors.phoneNumber}</p>
                                )}
                            </div>

                            {/* Shipping Address */}
                            <div className="space-y-2">
                                <Label htmlFor="shippingAddress" className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Shipping Address
                                </Label>
                                <Textarea
                                    id="shippingAddress"
                                    value={formData.shippingAddress}
                                    onChange={(e) => handleInputChange("shippingAddress", e.target.value)}
                                    placeholder="Enter your complete address"
                                    rows={3}
                                    className={formErrors.shippingAddress ? "border-red-500" : ""}
                                />
                                {formErrors.shippingAddress && (
                                    <p className="text-sm text-red-600">{formErrors.shippingAddress}</p>
                                )}
                            </div>

                            {/* City */}
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => handleInputChange("city", e.target.value)}
                                    placeholder="Enter your city"
                                    className={formErrors.city ? "border-red-500" : ""}
                                />
                                {formErrors.city && (
                                    <p className="text-sm text-red-600">{formErrors.city}</p>
                                )}
                            </div>

                            {/* Payment Info */}
                            <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-sm text-blue-700">
                                    <strong>Payment:</strong> Cash on Delivery (COD)
                                </p>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12"
                            >
                                {isLoading ? "Processing..." : "Confirm Order"}
                            </Button>
                        </form>
                </div>
            </DialogContent>
            
            {/* Order Confirmation Modal */}
            <OrderConfirmationModal 
                isOpen={isConfirmationOpen}
                orderData={orderConfirmation}
                onClose={() => dispatch(hideOrderConfirmation())}
            />
        </Dialog>
    );
}

export default GuestCheckoutModal;