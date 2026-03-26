'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MissionContextType {
  processingDepts: string[];
  startMission: (deptKey: string) => void;
  completeMission: (deptKey: string) => void;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export function MissionProvider({ children }: { children: ReactNode }) {
  const [processingDepts, setProcessingDepts] = useState<string[]>([]);

  const startMission = (deptKey: string) => {
    setProcessingDepts(prev => [...new Set([...prev, deptKey.toLowerCase()])]);
  };

  const completeMission = (deptKey: string) => {
    setProcessingDepts(prev => prev.filter(d => d !== deptKey.toLowerCase()));
  };

  return (
    <MissionContext.Provider value={{ processingDepts, startMission, completeMission }}>
      {children}
    </MissionContext.Provider>
  );
}

export function useMission() {
  const context = useContext(MissionContext);
  if (context === undefined) {
    throw new Error('useMission must be used within a MissionProvider');
  }
  return context;
}
