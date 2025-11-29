import { memo, ReactElement } from "react";

const Draw = memo(
  (): ReactElement => (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 700 700"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="350" cy="350" r="225" stroke="#EA6512" strokeWidth={50} />
    </svg>
  ),
);

export default Draw;
