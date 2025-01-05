import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ConsumptionGraphProps {
  data: {
    body: {
      date: string;
      temperature: number;
    };
    systemProperties: {
      "iothub-connection-device-id": string;
    };
    ID: string;
  }[];
}

export default function ConsumptionGraph({ data }: ConsumptionGraphProps) {

  // Group data by device ID
  const groupedData = data.reduce((acc, item) => {
    const deviceId = item.systemProperties["iothub-connection-device-id"];
    const timestamp = new Date(item.body.date).toLocaleString();
    if (!acc[timestamp]) {
      acc[timestamp] = {};
    }
    acc[timestamp][deviceId] = item.body.temperature;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  // Convert grouped data to array format for Recharts
  const formattedData = Object.entries(groupedData).map(
    ([timestamp, devices]) => ({
      timestamp,
      ...devices,
    })
  );

  // Define a color palette
  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#387908",
    "#8a2be2",
    "#ff1493",
    "#00ced1",
    "#ff4500",
    "#2e8b57",
  ];

  // Get unique device IDs
  const deviceIds = Array.from(
    new Set(
      data.map((item) => item.systemProperties["iothub-connection-device-id"])
    )
  );

  return (
    <main className="border-blue-500 border w-2/3 aspect-video flex flex-col justify-center items-center">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-500">
        Consumption Graph
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            angle={-45}
            textAnchor="end"
            interval={0}
            height={80}
            tick={{ fontSize: 12, width: 100 }}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          {deviceIds.map((deviceId, index) => (
            <Line
              key={deviceId}
              type="monotone"
              dataKey={deviceId}
              name={deviceId}
              stroke={colors[index % colors.length]}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </main>
  );
}
