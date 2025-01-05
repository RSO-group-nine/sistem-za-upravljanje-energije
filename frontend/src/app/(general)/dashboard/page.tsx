"use client";
import { useState, useEffect } from "react";
import SideBar from "../components/sideBar";
import DeviceComponent from "../components/deviceComponent";
import Device from "@/app/entities/device";
import getUserDevices from "@/app/utils/getUserDevices";

export default function Page() {
  const [selectedDevice, setSelectedDevice] = useState<Device | "All" | null>(
    null
  );
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceData, setDeviceData] = useState<
    {
      body: {
        date: string;
        temperature: number;
      };
      systemProperties: {
        "iothub-enqueuedtime": string;
        "iothub-connection-device-id": string;
      };
      ID: string;
    }[]
  >([]);
  

  // Update the selected device
  const handleDeviceSelect = (device: Device | "All" | null) => {
    setSelectedDevice(device);
  };

  const handleDeviceData = (
    data: {
      body: {
        date: string;
        temperature: number;
      };
      systemProperties: {
        "iothub-enqueuedtime": string;
        "iothub-connection-device-id": string;
      };
      ID: string;
    }[]
  ) => {
    setDeviceData(data);
  };

  const handleGetDevices = async (userId: string) => {
    try {
      const intUserId = parseInt(userId);
      const devices = await getUserDevices(intUserId);
      console.log("Devices:", devices);
      if (devices && devices.length > 0) {
        setDevices(devices);
        setSelectedDevice(devices[0]); // Set the first device as the default selected Device
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
      setDevices([]);
    }
  };

  useEffect(() => {
    // const emailFromStorage = sessionStorage.getItem("email") ?? "";
    const idFromStorage = sessionStorage.getItem("id") ?? "";
    console.log("ID from storage:", idFromStorage);
    if (idFromStorage) {
      handleGetDevices(idFromStorage);
    }
  }, []); // Empty dependency array to run this once when the component mounts

  return (
    <div className="flex h-full">
      <div className="">
        {(
          <SideBar
            devices={devices}
            device={selectedDevice}
            onSelect={handleDeviceSelect}
            onData={handleDeviceData}
          />
        )}
      </div>
      <main className="p-8 bg-white w-full">
        {selectedDevice && (
          <DeviceComponent device={selectedDevice} deviceDataG={deviceData} />
        )}
      </main>
    </div>
  );
}
