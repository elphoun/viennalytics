import { lazy, Suspense, CSSProperties } from 'react';

// Lazy load the heavy react-plotly.js component
const PlotlyComponent = lazy(() => 
  import('react-plotly.js').then(module => ({ default: module.default }))
);

interface PlotlyLazyProps {
  data: any[];
  layout: any;
  config?: any;
  style?: CSSProperties;
  className?: string;
}

const PlotlyLazy = (props: PlotlyLazyProps) => (
  <Suspense 
    fallback={
      <div className="w-full h-64 bg-slate-800 rounded-lg flex items-center justify-center">
        <div className="text-slate-300 font-semibold">Loading chart...</div>
      </div>
    }
  >
    <PlotlyComponent {...props} />
  </Suspense>
);

export default PlotlyLazy;
