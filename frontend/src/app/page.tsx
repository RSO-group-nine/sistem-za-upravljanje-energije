"use client";
import { useState } from "react";
import SideBar from "./components/sideBar";

export default function Page() {
    const [selectedOption, setSelectedOption] = useState("Home"); // Default option
    const options = ["Light", "Thermostat"];

    // Update the selected option
    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
    };

    return (
        <div className="flex h-screen">
          <div className="">
            <SideBar options={options} onSelect={handleOptionSelect} />
          </div>
            <main className="p-8">
                {selectedOption === "Home" && <div>Welcome to the Home Page</div>}
                {selectedOption === "Profile" && <div>Here is your Profile</div>}
                {selectedOption === "Settings" && <div>Adjust your Settings here</div>}
                {selectedOption === "About" && <div>About this Application</div>}
            </main>
        </div>
    );
}
