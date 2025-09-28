import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Crown, 
  Zap, 
  Users, 
  ArrowRight, 
  CheckCircle,
  Lock,
  X
} from "lucide-react";
import { useUserCredits } from "../utils/user-credits";
import { cn } from "../lib/utils";

interface PaywallBannerProps {
  className?: string;
  onDismiss?: () => void;
  showDismiss?: boolean;
  analysisType?: string;
  variant?: "overlay" | "inline" | "minimal";
}

export default function PaywallBanner({ 
  className, 
  onDismiss, 
  showDismiss = false,
  analysisType = "analysis",
  variant = "overlay"
}: PaywallBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { isAuthenticated, credits } = useUserCredits();

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  const features = [
    "Complete analysis results",
    "Advanced scoring insights", 
    "Unlimited downloads",
    "Analysis history & saving"
  ];

  // Minimal variant for small spaces
  if (variant === "minimal") {
    return (
      <div className={cn(
        "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4",
        className
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Crown className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Unlock Full Results
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                See complete {analysisType} results
              </p>
            </div>
          </div>
          <Link href="/credits">
            <Button size="sm" data-testid="button-upgrade-minimal">
              Upgrade
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Inline variant for integration within content
  if (variant === "inline") {
    return (
      <Card className={cn("border-2 border-dashed border-yellow-300 dark:border-yellow-600 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950", className)}>
        <CardContent className="p-6">
          <div className="text-center">
            <Lock className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Continue Reading With Full Access
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              You've seen 30% of the results. {isAuthenticated ? "Purchase credits" : "Register and get credits"} to unlock the complete {analysisType}.
            </p>
            <div className="flex justify-center space-x-3">
              {!isAuthenticated && (
                <Link href="/credits">
                  <Button variant="outline" size="sm" data-testid="button-register-inline">
                    <Users className="h-4 w-4 mr-2" />
                    Register Free
                  </Button>
                </Link>
              )}
              <Link href="/credits">
                <Button size="sm" data-testid="button-upgrade-inline">
                  <Crown className="h-4 w-4 mr-2" />
                  {isAuthenticated ? "Buy Credits" : "Get Started"}
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default overlay variant - full featured banner
  return (
    <div className={cn(
      "relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 border-2 border-blue-200 dark:border-blue-700 rounded-xl shadow-lg",
      className
    )}>
      {showDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          data-testid="button-dismiss-paywall"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Unlock Complete Analysis
              </h3>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Preview Mode
              </Badge>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You're seeing 30% of the results. {isAuthenticated 
                ? `You have ${credits.toLocaleString()} credits. Get more to unlock the full ${analysisType} with detailed insights.`
                : `Register for free and purchase credits to see the complete ${analysisType} with detailed scoring and insights.`
              }
            </p>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {!isAuthenticated && (
                <Link href="/credits">
                  <Button variant="outline" className="flex-1 sm:flex-none" data-testid="button-register-overlay">
                    <Users className="h-4 w-4 mr-2" />
                    Register Free
                  </Button>
                </Link>
              )}
              
              <Link href="/credits">
                <Button className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" data-testid="button-upgrade-overlay">
                  <Zap className="h-4 w-4 mr-2" />
                  {isAuthenticated ? "Buy Credits" : "Get Full Access"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            
            {isAuthenticated && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                💡 Your analysis will be waiting for you after purchase - no need to re-generate!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}