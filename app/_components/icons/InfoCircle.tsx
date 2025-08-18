import { memo, ReactElement } from "react";

const InfoCircle = memo((): ReactElement => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <path
      d="M12 16v-4m0-4h.01"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
));

export default InfoCircle;
