import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentIntent?: string;
    amount?: string;
  } | null>(null);

  useEffect(() => {
    // Parse URL parameters to get payment details
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntent = urlParams.get('payment_intent');
    const amount = urlParams.get('payment_intent_client_secret');
    
    if (paymentIntent) {
      setPaymentDetails({
        paymentIntent,
        amount: amount || undefined
      });
      
      toast({
        title: "Payment Successful! 🎉",
        description: "Your credits have been added to your account.",
        duration: 5000,
      });
    }
  }, [toast]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600 dark:text-green-400">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Thank you for your purchase! Your credits have been added to your account and you can start using them immediately.
            </p>
            
            {paymentDetails?.paymentIntent && (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm">
                <p className="text-gray-500 dark:text-gray-400">
                  Payment ID: {paymentDetails.paymentIntent.slice(-8).toUpperCase()}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Link href="/" className="block">
              <Button className="w-full" data-testid="button-home">
                <Home className="h-4 w-4 mr-2" />
                Start Analysis
              </Button>
            </Link>
            
            <Link href="/credits" className="block">
              <Button variant="outline" className="w-full" data-testid="button-credits">
                <CreditCard className="h-4 w-4 mr-2" />
                View Credits
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}