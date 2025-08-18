import { OpeningStats } from "@/app/types";
import { cn } from "../../utils";

const PLACEHOLDER = "No Variations";

interface OptionProps {
    option: string;
    className?: string;
}

const Option = ({ option, className }: OptionProps) => (
    <option
        key={option}
        value={option}
        className={cn("text-white bg-gray-800/20", className)}
    >
        {option}
    </option>
);

interface VariantDropdownProps {
    data: OpeningStats;
    openingSearch: string;
    value: string;
    disabled: boolean;
    setValue: (value: string) => void;
}

/** VariantDropdown renders and allows the user to select a variant from the dropdown */
const VariantDropdown = ({ data, openingSearch, value, disabled, setValue }: VariantDropdownProps) => {

    const uniqueOptions = [...new Set(data
        .find(opening => opening.opening === openingSearch)
        ?.variations.map(variant => variant.variation)
    )]

    const renderOptions = uniqueOptions && uniqueOptions.length > 0 ? (
        <>
            {uniqueOptions
                .map((option) => (
                    <Option key={option} option={option} />
                ))}
        </>
    ) : (
        <Option option={PLACEHOLDER} className="text-gray-400" />
    );

    return (
        <select
            value={value}
            onChange={(ev) => {
                if (setValue) {
                    setValue(ev.target.value);
                }
            }}
            disabled={disabled}
            aria-label={PLACEHOLDER}
            className={cn("flex-1 w-full relative p-2 border border-gray-300 rounded-md focus:outline-none",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent truncate min-w-0",
                "transition-colors duration-200 bg-white/10 text-white")}
        >
            {renderOptions}
        </select>
    );
};

export default VariantDropdown; 