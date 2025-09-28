import { useQuery } from "@tanstack/react-query";

export interface UserCreditsInfo {
  credits: number;
  isAuthenticated: boolean;
  hasUnlimitedCredits: boolean;
  canAccessFullResults: boolean;
  isAnonymous?: boolean;
}

// Hook to get current user authentication and credit status
export function useUserCredits(): UserCreditsInfo {
  const { data: user } = useQuery<{ id: number; username: string } | null>({
    queryKey: ["/api/me"],
    retry: false,
  });

  // Get claim token from localStorage for anonymous purchases
  const claimToken = typeof window !== 'undefined' ? localStorage.getItem('claimToken') : null;

  const { data: creditsData } = useQuery<{ credits: number; isAnonymous?: boolean }>({
    queryKey: ["/api/user/credits"],
    retry: false,
    // Always try to fetch credits, passing claim token if available
    queryFn: async () => {
      const headers: Record<string, string> = {};
      if (claimToken) {
        headers['x-claim-token'] = claimToken;
      }
      
      const response = await fetch('/api/user/credits', { headers });
      if (!response.ok) {
        throw new Error('Failed to fetch credits');
      }
      return response.json();
    },
  });

  const isAuthenticated = !!user;
  const credits = creditsData?.credits || 0;
  
  // Check if user has unlimited credits (admin user)
  const hasUnlimitedCredits = user?.username?.toLowerCase() === 'jmkuczynski';
  
  // User can access full results if they have unlimited credits OR sufficient credits for an analysis
  const canAccessFullResults = hasUnlimitedCredits || credits > 1000; // Minimum threshold for full access

  return {
    credits,
    isAuthenticated,
    hasUnlimitedCredits,
    canAccessFullResults,
  };
}

// Calculate required credits for different analysis types
export const ANALYSIS_CREDIT_REQUIREMENTS = {
  cognitive: 2000,
  "comprehensive-cognitive": 5000,
  microcognitive: 500,
  psychological: 1500,
  "comprehensive-psychological": 4000,
  micropsychological: 400,
  psychopathological: 1500,
  "comprehensive-psychopathological": 4000,
  micropsychopathological: 400,
} as const;

export type AnalysisType = keyof typeof ANALYSIS_CREDIT_REQUIREMENTS;

// Check if user has enough credits for a specific analysis type
export function hasEnoughCreditsForAnalysis(
  userCredits: number,
  analysisType: AnalysisType,
  hasUnlimitedCredits: boolean
): boolean {
  if (hasUnlimitedCredits) return true;
  
  const required = ANALYSIS_CREDIT_REQUIREMENTS[analysisType];
  return userCredits >= required;
}

// Utility to determine what percentage of results to show
export function getResultDisplayPercentage(canAccessFullResults: boolean): number {
  return canAccessFullResults ? 100 : 30;
}

// Truncate text to a specific percentage of the original
export function truncateToPercentage(text: string, percentage: number): string {
  if (percentage >= 100) return text;
  
  const targetLength = Math.floor(text.length * (percentage / 100));
  
  // Try to find a natural breaking point near the target
  let cutPoint = targetLength;
  
  // Look for sentence endings near the target point
  const sentenceEndings = ['. ', '.\n', '! ', '!\n', '? ', '?\n'];
  for (let i = targetLength; i >= Math.max(0, targetLength - 100); i--) {
    for (const ending of sentenceEndings) {
      if (text.substring(i, i + ending.length) === ending) {
        cutPoint = i + ending.length;
        break;
      }
    }
    if (cutPoint !== targetLength) break;
  }
  
  // If no good breaking point found, just cut at word boundary
  if (cutPoint === targetLength) {
    while (cutPoint > 0 && text[cutPoint] !== ' ') {
      cutPoint--;
    }
  }
  
  return text.substring(0, cutPoint).trim();
}