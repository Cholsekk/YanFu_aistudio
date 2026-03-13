import { createContext, useContext } from 'react';
import { AppItem } from '../types';

export const AppDevHubContext = createContext<AppItem | null>(null);

export const useAppDevHub = () => {
  const context = useContext(AppDevHubContext);
  if (!context) {
    throw new Error('useAppDevHub must be used within an AppDevHubProvider');
  }
  return context;
};
