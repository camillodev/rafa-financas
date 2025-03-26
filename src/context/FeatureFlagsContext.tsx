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
  toggleFeature: (featureKey: FeatureKey) => void;
  enableFeature: (featureKey: FeatureKey) => void;
  disableFeature: (featureKey: FeatureKey) => void;
}

// Create the context
const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

// Default feature flags (all enabled by default)
const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  bills: true,
  budgets: true,
  reports: true,
  cards: true,
  goals: true,
  splitBills: true,
};

// Local storage key
const FEATURE_FLAGS_STORAGE_KEY = 'rafa-financas-feature-flags';

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage or defaults
  const [features, setFeatures] = useState<FeatureFlags>(() => {
    const savedFlags = localStorage.getItem(FEATURE_FLAGS_STORAGE_KEY);
    return savedFlags ? JSON.parse(savedFlags) : DEFAULT_FEATURE_FLAGS;
  });

  // Save to localStorage whenever features change
  useEffect(() => {
    localStorage.setItem(FEATURE_FLAGS_STORAGE_KEY, JSON.stringify(features));
  }, [features]);

  // Check if a feature is enabled
  const isFeatureEnabled = (featureKey: FeatureKey): boolean => {
    return features[featureKey] ?? false;
  };

  // Toggle a feature on or off
  const toggleFeature = (featureKey: FeatureKey): void => {
    setFeatures(prev => ({
      ...prev,
      [featureKey]: !prev[featureKey]
    }));
  };

  // Enable a specific feature
  const enableFeature = (featureKey: FeatureKey): void => {
    setFeatures(prev => ({
      ...prev,
      [featureKey]: true
    }));
  };

  // Disable a specific feature
  const disableFeature = (featureKey: FeatureKey): void => {
    setFeatures(prev => ({
      ...prev,
      [featureKey]: false
    }));
  };

  const value = {
    features,
    isFeatureEnabled,
    toggleFeature,
    enableFeature,
    disableFeature
  };

  return (
    <FeatureFlagsContext.Provider value={value}>
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