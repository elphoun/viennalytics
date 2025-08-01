// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { ReactNode } from 'react';

import { OpeningsProvider } from './Providers/OpeningsContext';

// ─ Router ───────────────────────────────────────────────────────────────────────────────────────
const AppProviders = ({ children }: { children: ReactNode }) => (
    <OpeningsProvider>
        {children}
    </OpeningsProvider>
);

// ─ Exports ──────────────────────────────────────────────────────────────────────────────────────
export default AppProviders;
