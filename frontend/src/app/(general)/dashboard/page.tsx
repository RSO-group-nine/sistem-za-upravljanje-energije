"use client";
import { useState } from "react";
import SideBar from "../components/sideBar";
import Light from "../components/light";

export default function Page() {
    const [selectedOption, setSelectedOption] = useState("Light");

    // Update the selected option
    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
        console.log(option);
    };

    return (
        <div className="flex">
          <div className="">
            <SideBar onSelect={handleOptionSelect} />
          </div>
            <main className="p-8 bg-white w-full">
                {selectedOption == "1" && <Light />}
            </main>
        </div>
    );
}
