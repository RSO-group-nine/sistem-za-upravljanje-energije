import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface ConsumptionGraphProps {
    data: {
        properties: any;
        systemProperties: {
            "iothub-enqueuedtime": string;
        };
        body: {
            temperature: number;
        };
        ID: string;
    }[];
}

export default function ConsumptionGraph({ data }: ConsumptionGraphProps) {
    // Format data for Recharts
    const formattedData = data.map(item => ({
        timestamp: new Date(item.systemProperties["iothub-enqueuedtime"]).toLocaleString(),
        temperature: item.body.temperature,
    }));

    return (
        <main className="border-blue-500 border w-2/3 aspect-video flex flex-col justify-center items-center">
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-500">Consumption Graph</h2>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" angle={-45} textAnchor="end" interval={0} height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="temperature" stroke="#3B82F6" />
                </LineChart>
            </ResponsiveContainer>
        </main>
    );
}
