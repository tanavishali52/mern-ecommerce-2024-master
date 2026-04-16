import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2, MessageCircle, Phone, Save, AlertCircle } from "lucide-react";
import { useToast } from "../ui/use-toast";
import {
  fetchWhatsAppSettings,
  updateWhatsAppSettings,
  clearError
} from "@/store/admin/settings-slice";
import { validatePhoneNumber, validateMessage, formatPhoneNumber } from "@/services/whatsapp-service";

function WhatsAppSettings() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { whatsapp, isLoading, error } = useSelector((state) => state.adminSettings);

  const [formData, setFormData] = useState({
    number: '',
    message: '',
    enabled: false
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    dispatch(fetchWhatsAppSettings());
  }, [dispatch]);

  // Update form data when settings are loaded
  useEffect(() => {
    if (whatsapp) {
      setFormData({
        number: whatsapp.number || '',
        message: whatsapp.message || "Hello! I'm interested in your products.",
        enabled: whatsapp.enabled || false
      });
    }
  }, [whatsapp]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    // Validate phone number if enabled
    if (formData.enabled && formData.number) {
      // Try to auto-format the number first
      const formatted = formatPhoneNumber(formData.number);
      if (!formatted) {
        errors.number = "Invalid phone number. Enter a valid number like 03187074919, +923187074919, or +92 318 7074919";
      }
    } else if (formData.enabled && !formData.number) {
      errors.number = "Phone number is required when WhatsApp is enabled";
    }

    // Validate message
    if (formData.message && !validateMessage(formData.message)) {
      errors.message = "Message must be between 1 and 500 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Auto-format the phone number to E.164 before saving
    const formattedNumber = formatPhoneNumber(formData.number);
    const dataToSave = {
      ...formData,
      number: formattedNumber || formData.number
    };

    // Update local form data with formatted number
    if (formattedNumber && formattedNumber !== formData.number) {
      setFormData(prev => ({ ...prev, number: formattedNumber }));
    }

    try {
      await dispatch(updateWhatsAppSettings(dataToSave)).unwrap();
      
      toast({
        title: "Settings Updated",
        description: "WhatsApp settings have been saved successfully.",
      });
      
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update WhatsApp settings.",
        variant: "destructive",
      });
    }
  };

  // Handle reset form
  const handleReset = () => {
    setFormData({
      number: whatsapp.number || '',
      message: whatsapp.message || "Hello! I'm interested in your products.",
      enabled: whatsapp.enabled || false
    });
    setValidationErrors({});
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">WhatsApp Settings</h1>
        <p className="text-muted-foreground">
          Configure WhatsApp support button for customer communication
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            WhatsApp Configuration
          </CardTitle>
          <CardDescription>
            Set up your WhatsApp contact details and customize the support experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error.message || "An error occurred while loading settings"}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Enable WhatsApp Support</Label>
                <p className="text-sm text-muted-foreground">
                  Show WhatsApp button on your website for customer support
                </p>
              </div>
              <Switch
                checked={formData.enabled}
                onCheckedChange={(checked) => handleFieldChange('enabled', checked)}
                disabled={isLoading}
              />
            </div>

            {/* Phone Number Input */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp-number" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                WhatsApp Phone Number
              </Label>
              <Input
                id="whatsapp-number"
                type="tel"
                placeholder="03187074919"
                value={formData.number}
                onChange={(e) => handleFieldChange('number', e.target.value)}
                disabled={isLoading}
                className={validationErrors.number ? "border-red-500" : ""}
              />
              {validationErrors.number && (
                <p className="text-sm text-red-500">{validationErrors.number}</p>
              )}
              {/* Show auto-formatted preview */}
              {formData.number && !validationErrors.number && (
                <p className="text-sm text-green-600 font-medium">
                  ✅ Will be saved as: {formatPhoneNumber(formData.number) || formData.number}
                </p>
              )}
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Just enter your number — it will be auto-formatted. Any of these formats work:
                </p>
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded space-y-0.5">
                  <p>• <code>03187074919</code> — local Pakistani format</p>
                  <p>• <code>+923187074919</code> — international format</p>
                  <p>• <code>+92 318 7074919</code> — with spaces</p>
                  <p>• <code>923187074919</code> — without + prefix</p>
                </div>
              </div>
            </div>

            {/* Default Message */}
            <div className="space-y-2">
              <Label htmlFor="whatsapp-message">Default Message</Label>
              <Textarea
                id="whatsapp-message"
                placeholder="Hello! I'm interested in your products."
                value={formData.message}
                onChange={(e) => handleFieldChange('message', e.target.value)}
                disabled={isLoading}
                rows={3}
                maxLength={500}
                className={validationErrors.message ? "border-red-500" : ""}
              />
              {validationErrors.message && (
                <p className="text-sm text-red-500">{validationErrors.message}</p>
              )}
              <p className="text-sm text-muted-foreground">
                This message will be pre-filled when customers click the WhatsApp button
                ({formData.message.length}/500 characters)
              </p>
            </div>

            {/* Preview Section */}
            {formData.enabled && formData.number && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Preview</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  When customers click the WhatsApp button, they will be redirected to:
                </p>
                <div className="bg-background p-3 rounded border text-sm font-mono break-all">
                  https://api.whatsapp.com/send?phone={formData.number.replace(/^\+/, '')}&text={encodeURIComponent(formData.message)}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4">
              <Button
                type="submit"
                disabled={isLoading || !hasChanges}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Settings
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isLoading || !hasChanges}
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              1
            </div>
            <div>
              <p className="font-medium">Enable WhatsApp Support</p>
              <p className="text-sm text-muted-foreground">
                Toggle the switch to show the WhatsApp button on your website
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              2
            </div>
            <div>
              <p className="font-medium">Add Your Phone Number</p>
              <p className="text-sm text-muted-foreground">
                Enter your WhatsApp business number in international format
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              3
            </div>
            <div>
              <p className="font-medium">Customize the Message</p>
              <p className="text-sm text-muted-foreground">
                Set a default message that customers will see when they contact you
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default WhatsAppSettings;