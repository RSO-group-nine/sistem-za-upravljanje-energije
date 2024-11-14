"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaSignOutAlt } from "react-icons/fa";
import getUserDevices from "@/app/utils/getUserDevices";
import Device from "@/app/entities/device";

export interface SideBarProps {
    onSelect: (device: Device) => void;
}

export default function SideBar({ onSelect }: SideBarProps) {
    const router = useRouter();
    const [email, setEmail] = useState<string>("");
    const [id, setId] = useState<string>("");
    const [devices, setDevices] = useState<Device[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

    const handleLogout = () => {
        sessionStorage.removeItem("email");
        sessionStorage.removeItem("id");
        router.push("/login");
    };

    const handleGetDevices = async (userId: string) => {
        try {
            const devices = await getUserDevices(userId);
            if (devices && devices.length > 0) {
                setDevices(devices);
                setSelectedDevice(devices[0]); // Set the first device as the default selected Device
            }
        } catch (error) {
            console.error('Error fetching devices:', error);
        }
    };

    useEffect(() => {
        const emailFromStorage = sessionStorage.getItem("email") ?? "";
        const idFromStorage = sessionStorage.getItem("id") ?? "";
        setEmail(emailFromStorage);
        setId(idFromStorage);
        if (idFromStorage) {
            handleGetDevices(idFromStorage);
        }
    }, []); // Empty dependency array to run this once when the component mounts

    return (
        <aside className="bg-white text-gray-800 w-64 h-screen shadow-lg flex flex-col">
            <div className="text-neutral-500 p-4 bg-blue-100 flex justify-center items-center rounded-md shadow-lg m-4">
                <h1 className="font-bold">{email}</h1>
            </div>
            <nav className="flex-grow">
                <h1 className="text-3xl font-bold text-blue-500 p-6 border-b border-gray-200">Devices</h1>
                <ul className="flex flex-col mt-4">
                    {devices.map((device) => (
                        <li
                            key={device.device_id}
                            className={`cursor-pointer p-4 w-full rounded-lg transition-colors duration-200 ease-in-out ${
                                device.device_id === selectedDevice?.device_id ? "bg-blue-400 text-white" : "hover:bg-blue-100"
                            }`}
                            onClick={() => onSelect(device)}
                        >
                            {device.device_id}
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
