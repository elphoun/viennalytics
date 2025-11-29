import { memo } from "react";

const H2 = memo(({ text }: { text: string }) => (
  <h2 className="text-xl font-semibold tracking-wider text-white/95">{text}</h2>
));

H2.displayName = "H2";

export default H2;
