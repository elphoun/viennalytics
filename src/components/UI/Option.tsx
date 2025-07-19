import { cn } from "../utils";

interface OptionType {
  value?: string;
  label: string;
}

interface OptionProps {
  option: OptionType;
  className?: string;
}

const Option = ({ option, className }: OptionProps) => (
  <option 
    key={option.value} 
    value={option.value} 
    className={cn("text-white bg-gray-800/20", className)}
  >
    {option.label}
  </option>
);

export default Option;
export type { OptionType }; 