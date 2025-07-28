import { FC } from 'react';

interface DrawProps {
  width?: number;
  height?: number;
  className?: string;
  stroke?: string;
  strokeWidth?: number;
}

const Draw: FC<DrawProps> = ({
  className,
  stroke = "#EA6512",
  strokeWidth = 50
}) => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 700 700"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="350"
        cy="350"
        r="225"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
};

export default Draw;