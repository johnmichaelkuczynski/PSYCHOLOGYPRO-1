// Analysis persistence utilities for the freemium model
// Stores full analysis results in localStorage so users can access them after payment

export interface PersistedAnalysis {
  id: string;
  results: any;
  timestamp: number;
  textContent: string;
  analysisType: string;
  llmProvider: string;
}

const STORAGE_KEY_PREFIX = 'psychology_pro_analysis_';
const ANALYSIS_INDEX_KEY = 'psychology_pro_analysis_index';
const MAX_STORED_ANALYSES = 10; // Limit storage to prevent localStorage bloat
const EXPIRY_HOURS = 24; // Remove analyses after 24 hours

// Generate unique key for an analysis
function getAnalysisKey(analysisId: string): string {
  return `${STORAGE_KEY_PREFIX}${analysisId}`;
}

// Store full analysis results in localStorage
export function persistAnalysisResults(
  analysisId: string,
  results: any,
  textContent: string,
  analysisType: string,
  llmProvider: string
): void {
  try {
    const analysis: PersistedAnalysis = {
      id: analysisId,
      results,
      timestamp: Date.now(),
      textContent,
      analysisType,
      llmProvider,
    };

    // Store the analysis
    localStorage.setItem(getAnalysisKey(analysisId), JSON.stringify(analysis));

    // Update the index
    updateAnalysisIndex(analysisId);

    // Clean up old analyses
    cleanupOldAnalyses();
  } catch (error) {
    console.warn('Failed to persist analysis results:', error);
  }
}

// Retrieve analysis results from localStorage
export function getPersistedAnalysis(analysisId: string): PersistedAnalysis | null {
  try {
    const stored = localStorage.getItem(getAnalysisKey(analysisId));
    if (!stored) return null;

    const analysis: PersistedAnalysis = JSON.parse(stored);
    
    // Check if analysis has expired
    const hoursAgo = (Date.now() - analysis.timestamp) / (1000 * 60 * 60);
    if (hoursAgo > EXPIRY_HOURS) {
      removePersistedAnalysis(analysisId);
      return null;
    }

    return analysis;
  } catch (error) {
    console.warn('Failed to retrieve persisted analysis:', error);
    return null;
  }
}

// Remove analysis from localStorage
export function removePersistedAnalysis(analysisId: string): void {
  try {
    localStorage.removeItem(getAnalysisKey(analysisId));
    
    // Update index
    const index = getAnalysisIndex();
    const updatedIndex = index.filter(id => id !== analysisId);
    localStorage.setItem(ANALYSIS_INDEX_KEY, JSON.stringify(updatedIndex));
  } catch (error) {
    console.warn('Failed to remove persisted analysis:', error);
  }
}

// Get list of stored analysis IDs
function getAnalysisIndex(): string[] {
  try {
    const stored = localStorage.getItem(ANALYSIS_INDEX_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
}

// Update the analysis index
function updateAnalysisIndex(analysisId: string): void {
  try {
    let index = getAnalysisIndex();
    
    // Remove if already exists (to update position)
    index = index.filter(id => id !== analysisId);
    
    // Add to front
    index.unshift(analysisId);
    
    // Limit to max stored analyses
    if (index.length > MAX_STORED_ANALYSES) {
      const removed = index.slice(MAX_STORED_ANALYSES);
      removed.forEach(id => {
        localStorage.removeItem(getAnalysisKey(id));
      });
      index = index.slice(0, MAX_STORED_ANALYSES);
    }
    
    localStorage.setItem(ANALYSIS_INDEX_KEY, JSON.stringify(index));
  } catch (error) {
    console.warn('Failed to update analysis index:', error);
  }
}

// Clean up expired analyses
function cleanupOldAnalyses(): void {
  try {
    const index = getAnalysisIndex();
    const now = Date.now();
    const validIds: string[] = [];

    for (const id of index) {
      const analysis = getPersistedAnalysis(id);
      if (analysis) {
        const hoursAgo = (now - analysis.timestamp) / (1000 * 60 * 60);
        if (hoursAgo <= EXPIRY_HOURS) {
          validIds.push(id);
        } else {
          localStorage.removeItem(getAnalysisKey(id));
        }
      }
    }

    if (validIds.length !== index.length) {
      localStorage.setItem(ANALYSIS_INDEX_KEY, JSON.stringify(validIds));
    }
  } catch (error) {
    console.warn('Failed to cleanup old analyses:', error);
  }
}

// Check if there are any persisted analyses for the current user
export function hasPersistedAnalyses(): boolean {
  const index = getAnalysisIndex();
  return index.length > 0;
}

// Get all persisted analyses (for debugging or user history)
export function getAllPersistedAnalyses(): PersistedAnalysis[] {
  const index = getAnalysisIndex();
  const analyses: PersistedAnalysis[] = [];

  for (const id of index) {
    const analysis = getPersistedAnalysis(id);
    if (analysis) {
      analyses.push(analysis);
    }
  }

  return analyses;
}