"use client";
import { useState } from "react";

export interface SideBarProps {
    options: string[];
    onSelect: (option: string) => void;
}

export default function SideBar({ options, onSelect }: SideBarProps) {
    const [selectedOption, setSelectedOption] = useState(options[0]);

    const handleOptionClick = (option: string) => {
        setSelectedOption(option);
        onSelect(option); // Trigger the callback with the selected option
    };

    return (
        <aside className="bg-white text-gray-800 w-full h-full">
            <nav>
                <h1 className="text-2xl font-bold text-blue-500 p-16">Devices</h1>
                <ul className="flex flex-col">
                    {options.map((option) => (
                        <li
                            key={option}
                            className={`cursor-pointer p-2 w-full rounded-sm hover:bg-blue-300 ${
                                option === selectedOption ? "bg-blue-400" : ""
                            }`}
                            onClick={() => handleOptionClick(option)}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}