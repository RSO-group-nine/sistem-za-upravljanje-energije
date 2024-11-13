"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaSignOutAlt } from "react-icons/fa";

export interface SideBarProps {
    options: string[];
    onSelect: (option: string) => void;
}


export default function SideBar({ options, onSelect }: SideBarProps) {
    const [selectedOption, setSelectedOption] = useState(options[0]);
    const router = useRouter();

    const handleOptionClick = (option: string) => {
        setSelectedOption(option);
        onSelect(option); // Trigger the callback with the selected option
    };

    const handleLogout = () => {
        router.push("/login");
    };

    return (
        <aside className="bg-white text-gray-800 w-64 h-screen shadow-lg flex flex-col">
            <div className="text-neutral-500 p-4 bg-blue-100 flex justify-center items-center rounded-md shadow-lg m-4">
                <h1 className="font-bold">TODO</h1>
            </div>
            <nav className="flex-grow">
                <h1 className="text-3xl font-bold text-blue-500 p-6 border-b border-gray-200">Devices</h1>
                <ul className="flex flex-col mt-4">
                    {options.map((option) => (
                        <li
                            key={option}
                            className={`cursor-pointer p-4 w-full rounded-lg transition-colors duration-200 ease-in-out ${
                                option === selectedOption ? "bg-blue-400 text-white" : "hover:bg-blue-100"
                            }`}
                            onClick={() => handleOptionClick(option)}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            </nav>
            <button
                onClick={handleLogout}
                className="bg-blue-500 text-white p-4 w-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-200 ease-in-out"
            >
                <FaSignOutAlt className="mr-2" />
                Log Out
            </button>
        </aside>
    );
}