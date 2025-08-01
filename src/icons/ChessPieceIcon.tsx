import React from "react";

const ChessPieceIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4 inline-block align-text-bottom" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <g>
      <ellipse cx="12" cy="19" rx="7" ry="2.5" fill="#222" />
      <rect x="9.5" y="7" width="5" height="8" rx="2.5" fill="#fff" stroke="#222" strokeWidth="1.2" />
      <circle cx="12" cy="6" r="2.5" fill="#fff" stroke="#222" strokeWidth="1.2" />
      <rect x="10.5" y="3.5" width="3" height="1.5" rx="0.75" fill="#222" />
    </g>
  </svg>
);

export default ChessPieceIcon;
