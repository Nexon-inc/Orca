'use client';

import { MissionProvider } from './context/MissionContext';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MissionProvider>
      {children}
      <Toaster position="top-center" richColors />
    </MissionProvider>
  );
}
