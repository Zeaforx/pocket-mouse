"use client";

import React, { createContext, useState, useContext, useMemo } from 'react';

interface SettingsContextType {
  sensitivity: number;
  setSensitivity: (value: number) => void;
  haptics: boolean;
  setHaptics: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [sensitivity, setSensitivityState] = useState(5);
  const [haptics, setHaptics] = useState(true);

  const setSensitivity = (value: number) => {
    setSensitivityState(value);
  };

  const value = useMemo(() => ({
    sensitivity,
    setSensitivity,
    haptics,
    setHaptics,
  }), [sensitivity, haptics]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
