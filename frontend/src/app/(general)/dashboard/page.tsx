"use client";
import { useState } from "react";
import SideBar from "../components/sideBar";
import DeviceComponent from "../components/deviceComponent";
import Device from "@/app/entities/device";

export default function Page() {
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

    // Update the selected device
    const handleDeviceSelect = (device: Device) => {
        setSelectedDevice(device);
    };

    return (
        <div className="flex">
          <div className="">
            <SideBar onSelect={handleDeviceSelect} />
          </div>
            <main className="p-8 bg-white w-full">
                {selectedDevice && <DeviceComponent device={selectedDevice} />}
            </main>
        </div>
    );
}
