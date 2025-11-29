import { memo } from "react";

const H3 = memo(({ text }: { text: string }) => (
  <h3 className="text-lg font-semibold tracking-wider text-blue-200">{text}</h3>
));

H3.displayName = "H3";

export default H3;
