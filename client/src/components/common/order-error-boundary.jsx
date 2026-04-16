import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw, Home, MessageCircle } from "lucide-react";

class OrderErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console and potentially to an error reporting service
    console.error('Order Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You could also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/shop/home';
  };

  handleContactSupport = () => {
    const message = `Hi! I encountered an error on the order confirmation page.

Error Details:
- Page: Order Confirmation/Account Page
- Time: ${new Date().toLocaleString()}
- Error: ${this.state.error?.message || 'Unknown error'}

Please help me resolve this issue.`;

    const phoneNumber = '+923181234567';
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-800">
                Oops! Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  We encountered an unexpected error while processing your request. 
                  Don't worry - your order information is safe.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <p className="text-sm text-gray-600 text-center">
                  You can try refreshing the page, or contact our support team for assistance.
                </p>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button 
                    onClick={this.handleRetry}
                    className="w-full flex items-center gap-2"
                    disabled={this.state.retryCount >= 3}
                  >
                    <RefreshCw className="h-4 w-4" />
                    {this.state.retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
                  </Button>

                  <Button 
                    variant="outline"
                    onClick={this.handleGoHome}
                    className="w-full flex items-center gap-2"
                  >
                    <Home className="h-4 w-4" />
                    Go to Home Page
                  </Button>

                  <Button 
                    variant="outline"
                    onClick={this.handleContactSupport}
                    className="w-full flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Contact Support
                  </Button>
                </div>
              </div>

              {/* Error Details (for development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 bg-gray-100 rounded text-xs">
                  <summary className="cursor-pointer font-medium">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap">
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              {/* Helpful Information */}
              <div className="bg-blue-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-blue-800 mb-1">What you can do:</p>
                <ul className="text-blue-700 space-y-1 text-xs">
                  <li>• Check your internet connection</li>
                  <li>• Try refreshing the page</li>
                  <li>• Clear your browser cache</li>
                  <li>• Contact support if the issue persists</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default OrderErrorBoundary;