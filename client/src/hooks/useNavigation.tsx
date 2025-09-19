import { React, useState, useContext, createContext } from 'react';

interface NavigationContextType {
  currentPage: string;
  navigateTo: (page: string, params?: Record<string, string>) => void;
  pageHistory: string[];
  goBack: () => void;
  currentParams: Record<string, string>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageHistory, setPageHistory] = useState<string[]>(['dashboard']);
  const [currentParams, setCurrentParams] = useState<Record<string, string>>({});

  const navigateTo = (page: string, params?: Record<string, string>) => {
    setCurrentPage(page);
    setCurrentParams(params || {});
    setPageHistory(prev => [...prev.slice(-9), page]); // Keep last 10 pages
  };

  const goBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = [...pageHistory];
      newHistory.pop(); // Remove current page
      const previousPage = newHistory[newHistory.length - 1] || 'dashboard';
      setCurrentPage(previousPage);
      setPageHistory(newHistory);
      setCurrentParams({});
    }
  };

  return (
    <NavigationContext.Provider value={{ currentPage, navigateTo, pageHistory, goBack, currentParams }}>
      {children}
    </NavigationContext.Provider>
  );
}