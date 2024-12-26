import ConsumptionGraph from "./consumptionGraph";
import GptPrompt from "./gptPrompt";
import Device from "@/app/entities/device";

interface DeviceComponentProps {
  device: Device | "All" | null;
  deviceDataG: {
    body: {
      date: string;
      temperature: number;
    };
    systemProperties: {
      "iothub-enqueuedtime": string;
      "iothub-connection-device-id": string;
    };
    ID: string;
  }[];
}

export default function DeviceComponent({
  device,
  deviceDataG,
}: DeviceComponentProps) {
  function getDeviceIdFromCS(az_connection_string: string) {
    const segments = az_connection_string.split(";");
    const deviceIdSegment = segments.find((segment) =>
      segment.startsWith("DeviceId=")
    );
    const deviceId = deviceIdSegment?.split("=")[1];
    return deviceId;
  }

  return (
    <div className="container flex flex-col gap-4">
      <h1 className="text-blue-500">
        {device !== "All" && device?.az_connection_string
          ? getDeviceIdFromCS(device.az_connection_string)
          : "All"}
      </h1>
      {deviceDataG && <ConsumptionGraph data={deviceDataG} />}
      {deviceDataG && <GptPrompt data={deviceDataG} />}
    </div>
  );
}
