// ─ Imports ──────────────────────────────────────────────────────────────────────────────────────
import { ReactNode } from 'react';

import { GamesProvider } from './Providers/GamesContext';
import { OpeningsProvider } from './Providers/OpeningsContext';

// ─ Router ───────────────────────────────────────────────────────────────────────────────────────
const AppProviders = ({ children }: { children: ReactNode }) => (
    <OpeningsProvider>
        <GamesProvider>
            {children}
        </GamesProvider>
    </OpeningsProvider>
);

export default AppProviders;
