import React, { createContext, useContext, useState } from 'react';

interface GuidedDemoContextType {
  isActive: boolean;
  currentStep: number;
  startGuide: () => void;
  nextStep: () => void;
  prevStep: () => void;
  endGuide: () => void;
}

const GuidedDemoContext = createContext<GuidedDemoContextType | undefined>(undefined);

export const TOTAL_STEPS = 8;

export const GuidedDemoProvider = ({ children }: { children: React.ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const startGuide = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    setCurrentStep((prev) => {
      if (prev >= TOTAL_STEPS - 1) {
        setIsActive(false);
        return 0;
      }
      return prev + 1;
    });
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(0, prev - 1));

  const endGuide = () => {
    setIsActive(false);
    setCurrentStep(0);
  };

  return (
    <GuidedDemoContext.Provider value={{ isActive, currentStep, startGuide, nextStep, prevStep, endGuide }}>
      {children}
    </GuidedDemoContext.Provider>
  );
};

export const useGuidedDemo = () => {
  const ctx = useContext(GuidedDemoContext);
  if (!ctx) throw new Error('useGuidedDemo 必須在 GuidedDemoProvider 內使用');
  return ctx;
};
