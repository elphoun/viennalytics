import React, { memo } from 'react';

const StockfishIcon = memo(() => (
  <svg
    viewBox='0 0 32 32'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-label='Stockfish'
  >
    <ellipse
      cx='16'
      cy='16'
      rx='10'
      ry='6'
      fill='#4ade80'
      stroke='#166534'
      strokeWidth='1.5'
    />
    <polygon
      points='26,16 32,12 32,20'
      fill='#22d3ee'
      stroke='#0e7490'
      strokeWidth='1'
    />
    <polygon
      points='12,10 16,8 14,13'
      fill='#bbf7d0'
      stroke='#166534'
      strokeWidth='0.7'
    />
    <circle cx='21' cy='15' r='1' fill='#222' />
    <rect
      x='7'
      y='13'
      width='2.2'
      height='6'
      rx='0.7'
      fill='#fff'
      stroke='#166534'
      strokeWidth='0.7'
    />
    <rect x='7' y='13' width='2.2' height='1.2' fill='#166534' />
    <rect x='7.3' y='14.2' width='0.5' height='1.2' fill='#166534' />
    <rect x='8.4' y='14.2' width='0.5' height='1.2' fill='#166534' />
  </svg>
));

export default StockfishIcon;
