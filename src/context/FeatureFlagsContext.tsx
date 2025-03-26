import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define the features that can be toggled
export type FeatureKey =
  | 'bills'
  | 'budgets'
  | 'reports'
  | 'cards'
  | 'goals'
  | 'splitBills';

interface FeatureFlags {
  [key: string]: boolean;
}

interface FeatureFlagsContextType {
  features: FeatureFlags;
  isFeatureEnabled: (featureKey: FeatureKey) => boolean;
}

// Create the context
const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

// Helper function to get environment variable with boolean conversion
const getEnvFlag = (key: string, defaultValue: boolean): boolean => {
  const envKey = `VITE_FEATURE_${key.toUpperCase()}`;
  const envValue = import.meta.env[envKey];
  if (envValue === undefined) return defaultValue;
  return envValue === 'true';
};

// Default feature flags from environment variables
const getDefaultFeatureFlags = (): FeatureFlags => ({
  bills: getEnvFlag('bills', true),
  budgets: getEnvFlag('budgets', true),
  reports: getEnvFlag('reports', true),
  cards: getEnvFlag('cards', true),
  goals: getEnvFlag('goals', true),
  splitBills: getEnvFlag('splitBills', true),
});

// Local storage key for development override
const FEATURE_FLAGS_STORAGE_KEY = 'rafa-financas-feature-flags';

// Check if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development';

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  // Initialize state from environment variables or localStorage in development
  const [features, setFeatures] = useState<FeatureFlags>(() => {
    // In development, we can override with localStorage
    if (isDevelopment) {
      const savedFlags = localStorage.getItem(FEATURE_FLAGS_STORAGE_KEY);
      return savedFlags ? JSON.parse(savedFlags) : getDefaultFeatureFlags();
    }

    // In production, always use environment variables
    return getDefaultFeatureFlags();
  });

  // Save to localStorage in development mode
  useEffect(() => {
    if (isDevelopment) {
      localStorage.setItem(FEATURE_FLAGS_STORAGE_KEY, JSON.stringify(features));
    }
  }, [features]);

  // Check if a feature is enabled
  const isFeatureEnabled = (featureKey: FeatureKey): boolean => {
    return features[featureKey] ?? false;
  };

  // Toggle a feature on or off - only exposed in development
  const toggleFeature = (featureKey: FeatureKey): void => {
    if (!isDevelopment) return;

    setFeatures(prev => ({
      ...prev,
      [featureKey]: !prev[featureKey]
    }));
  };

  // Enable a specific feature - only exposed in development
  const enableFeature = (featureKey: FeatureKey): void => {
    if (!isDevelopment) return;

    setFeatures(prev => ({
      ...prev,
      [featureKey]: true
    }));
  };

  // Disable a specific feature - only exposed in development
  const disableFeature = (featureKey: FeatureKey): void => {
    if (!isDevelopment) return;

    setFeatures(prev => ({
      ...prev,
      [featureKey]: false
    }));
  };

  // Create the context value based on environment
  const contextValue: any = {
    features,
    isFeatureEnabled,
  };

  // Only expose admin methods in development
  if (isDevelopment) {
    contextValue.toggleFeature = toggleFeature;
    contextValue.enableFeature = enableFeature;
    contextValue.disableFeature = disableFeature;
  }

  return (
    <FeatureFlagsContext.Provider value={contextValue}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

// Custom hook for using the feature flags
export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
} 