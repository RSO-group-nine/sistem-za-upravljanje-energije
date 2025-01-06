"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Device from "@/app/entities/device";
import userLogout from "@/app/utils/userLogout";
import getDeviceReadings from "@/app/utils/getDeviceReadings";
import { useCookies } from "react-cookie";

export interface SideBarProps {
  devices: Device[];
  device: Device | "All" | null;
  onSelect: (device: Device | "All" | null) => void;
  onData: (
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
  ) => void;
}

export default function SideBar({
  devices,
  device,
  onSelect,
  onData,
}: SideBarProps) {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [fetchId, setFetchId] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | "All" | null>(
    devices[0] ?? null
  );

  const [, , removeCookie] = useCookies(["token"]);

  async function fetchTheData() {
    try {
      if (device === "All") {
        return;
      }
      if (device === null) {
        return;
      }
      const data = await getDeviceReadings(device);
      setDeviceData(data);
    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  }

  async function fetchAllDevicesData() {
    try {
      const data = [];

      for (const device of devices) {
        await delay(1000); // Delay of 1 second between each call
        const deviceData = await getDeviceReadings(device);
        data.push(deviceData);
      }
      const flattenedData = data.flat();

      setDeviceData(flattenedData);
    } catch (error) {
      console.error("Error fetching device data:", error);
    }
  }

  // Function to add a delay
  function delay(ms: number | undefined) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const setDeviceData = (
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
    onData(data);
  };

  const handleLogout = async () => {
    const response = await userLogout();
    // Clear sessionStorage
    if (response.status == "success") {
      removeCookie("token");
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("id");

      // Redirect to login
      router.push("/login");
    }
  };

  useEffect(() => {
    // Get the email from sessionStorage
    const emailFromStorage = sessionStorage.getItem("email") ?? "";
    setEmail(emailFromStorage);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      console.log(device);
      setLoading(true);
      if (device === "All" && devices.length > 0) {
        await fetchAllDevicesData();
        setFetchId(-1);
      } else if (
        device  && device !== "All" &&
        device.device_id !== null &&
        fetchId !== device.device_id
      ) {
        setFetchId(device.device_id);
        await fetchTheData();
      }
      setLoading(false);
    };

    fetchData();
  }, [device]);

  return (
    <aside className="bg-white text-gray-800 w-64 h-full shadow-lg flex flex-col">
      <div className="text-neutral-500 p-4 bg-blue-100 flex justify-center items-center rounded-md shadow-lg m-4">
        <h1 className="font-bold">{email}</h1>
      </div>
      <nav className="flex-grow">
        <h1 className="text-3xl font-bold text-blue-500 p-6 border-b border-gray-200">
          Devices
        </h1>
        {devices.length === 0 ? (
          <div className="p-4 text-center text-blue-500">No devices found</div>
        ) : loading ? (
          <div className="p-4 text-center text-blue-500">Fetching data...</div>
        ) : (
          <ul className="flex flex-col mt-4">
            <li
              key="all"
              className={`cursor-pointer p-4 w-full rounded-lg transition-colors duration-200 ease-in-out ${
                selectedDevice === "All"
                  ? "bg-blue-400 text-white"
                  : "hover:bg-blue-100"
              }`}
              onClick={() => {
                setSelectedDevice("All");
                onSelect("All");
              }}
            >
              All
            </li>
            {devices.map((device) => (
              <li
                key={device.device_id}
                className={`cursor-pointer p-4 w-full rounded-lg transition-colors duration-200 ease-in-out ${
                  selectedDevice !== "All" &&
                  device.device_id === selectedDevice?.device_id
                    ? "bg-blue-400 text-white"
                    : "hover:bg-blue-100"
                }`}
                onClick={() => {
                  setSelectedDevice(device);
                  onSelect(device);
                }}
              >
                {device.device_id}
              </li>
            ))}
          </ul>
        )}
      </nav>
      <button
        onClick={handleLogout}
        className="bg-blue-500 text-white p-4 w-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-200 ease-in-out"
      >
        Logout
      </button>
    </aside>
  );
}
  
