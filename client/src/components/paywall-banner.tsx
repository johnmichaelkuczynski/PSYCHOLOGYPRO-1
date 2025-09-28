import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, 
  Zap, 
  Users, 
  ArrowRight, 
  CheckCircle,
  Lock,
  X
} from "lucide-react";
import { useUserCredits } from "@/utils/user-credits";
import { cn } from "@/lib/utils";

interface PaywallBannerProps {
  className?: string;
  onDismiss?: () => void;
  showDismiss?: boolean;
  analysisType?: string;
  variant?: "minimal" | "inline";
  analysisId?: string; // Pass current analysis ID for post-payment return
}

export default function PaywallBanner({ 
  className, 
  onDismiss, 
  showDismiss = false,
  analysisType = "analysis",
  variant = "minimal",
  analysisId
}: PaywallBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { isAuthenticated, credits } = useUserCredits();

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  // Minimal variant - small, subtle banner
  if (variant === "minimal") {
    return (
      <div className={cn(
        "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3",
        className
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Crown className="h-4 w-4 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Unlock Full Results
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                See complete live analysis results
              </p>
            </div>
          </div>
          <Link href={`/credits${analysisId ? `?analysisId=${analysisId}` : ''}`}>
            <Button size="sm" data-testid="button-upgrade-minimal">
              Upgrade
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Inline variant for between content sections
  return (
    <Card className={cn("border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950", className)}>
      <CardContent className="p-4">
        <div className="text-center">
          <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Continue Reading
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            You've seen 30% of the results. {isAuthenticated ? "Purchase credits" : "Register and get credits"} to unlock the complete {analysisType}.
          </p>
          <div className="flex justify-center space-x-2">
            {!isAuthenticated && (
              <Link href={`/credits${analysisId ? `?analysisId=${analysisId}` : ''}`}>
                <Button variant="outline" size="sm" data-testid="button-register-inline">
                  <Users className="h-3 w-3 mr-1" />
                  Register Free
                </Button>
              </Link>
            )}
            <Link href={`/credits${analysisId ? `?analysisId=${analysisId}` : ''}`}>
              <Button size="sm" data-testid="button-upgrade-inline">
                <Crown className="h-3 w-3 mr-1" />
                {isAuthenticated ? "Buy Credits" : "Get Started"}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}