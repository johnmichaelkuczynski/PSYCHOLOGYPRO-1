import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUserCredits } from "@/utils/user-credits";
import { hasPersistedAnalyses } from "@/utils/analysis-persistence";

// Hook to notify users about unlocked analysis results after upgrade
export function useUpgradeNotification() {
  const { canAccessFullResults, isAuthenticated } = useUserCredits();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user just upgraded and has persisted analyses waiting
    const hasUpgraded = localStorage.getItem('psychology_pro_just_upgraded');
    
    if (hasUpgraded && canAccessFullResults && hasPersistedAnalyses()) {
      // Clear the flag
      localStorage.removeItem('psychology_pro_just_upgraded');
      
      // Show success notification
      toast({
        title: "🎉 Full Access Unlocked!",
        description: "Your previous analyses are now showing complete results. No need to re-generate!",
        duration: 8000,
      });
    }
  }, [canAccessFullResults, isAuthenticated, toast]);

  // Function to mark that user just upgraded (call this after successful payment)
  const markAsUpgraded = () => {
    localStorage.setItem('psychology_pro_just_upgraded', 'true');
  };

  return { markAsUpgraded };
}