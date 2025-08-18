"use client"

import { OpeningStats } from "@/app/types";
import { cn } from "@/app/utils";
import { ChangeEvent, useCallback, useMemo, useState, useEffect } from "react";

interface OpeningSearchProps {
    setOpeningSearch: (value: string) => void;
    data: OpeningStats;
    value?: string;
}

const PLACEHOLDER = "Search Openings..."

const OpeningSearch = ({ setOpeningSearch, data, value = "" }: OpeningSearchProps) => {
    const [openingTemp, setOpeningTemp] = useState<string>(value);
    const [showDropdown, setShowDropdown] = useState<boolean>(false);

    // Update local state when value prop changes
    useEffect(() => {
        setOpeningTemp(value);
    }, [value]);

    const handleChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
        const searchVal = ev.target.value;
        setOpeningTemp(searchVal);
    }, []);

    const handleFocus = useCallback(() => {
        setShowDropdown(true);
    }, []);

    const handleBlur = useCallback(() => {
        setShowDropdown(false);
    }, []);

    const handleOptionClick = useCallback((option: string) => {
        setOpeningTemp(option);
        setShowDropdown(false);
        setOpeningSearch(option);
    }, [setOpeningSearch]);

    const filteredOptions = useMemo(() => {
        if (!openingTemp.trim()) {
            return data.map((opening) => opening.opening).slice(0, 10);
        }

        const searchTerm = openingTemp.toLowerCase().trim();
        return data
            .filter((opening) => opening.opening.toLowerCase().includes(searchTerm))
            .map((opening) => opening.opening)
            .slice(0, 15)
    }, [data, openingTemp])

    return (
        <div className="flex-1 relative">
            <input
                type="string"
                value={openingTemp}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={PLACEHOLDER}
                className={cn("flex-1 pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full focus:border-transparent transition-colors duration-200 bg-white/10 text-white placeholder-gray-400")}
                aria-label={PLACEHOLDER}
            />
            {
                showDropdown && filteredOptions.length > 0 && (
                    <div className="absolute top-full left-0 w-full border border-gray-200 bg-white/90 backdrop-blur-sm rounded-md shadow-lg max-h-48 overflow-y-auto z-10 mt-1">
                        {filteredOptions.map((option) => (
                            <div
                                key={option}
                                className="px-3 py-2 hover:bg-blue-100 text-gray-800 font-semibold cursor-pointer text-sm"
                                onMouseDown={() => handleOptionClick(option)}
                                tabIndex={0}
                                role="option"
                                aria-selected={openingTemp === option}
                                onKeyDown={event => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        handleOptionClick(option);
                                    }
                                }}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                )
            }
        </div>
    );
};

export default OpeningSearch;