"use client";
import { useState } from "react";
import SideBar from "./components/sideBar";
import Light from "./components/light";

export default function Page() {
    const [selectedOption, setSelectedOption] = useState("Light");
    const options = ["Light", "Thermostat"];

    // Update the selected option
    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
    };

    return (
        <div className="flex">
          <div className="">
            <SideBar options={options} onSelect={handleOptionSelect} />
          </div>
            <main className="p-8 bg-white w-full">
                {selectedOption === "Light" && <Light />}
            </main>
        </div>
    );
}
