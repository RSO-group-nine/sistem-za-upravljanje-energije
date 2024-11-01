interface ConsumptionGraphProps {
    data: number[];
}

export default function ConsumptionGraph({ data }: ConsumptionGraphProps) {
    return (
        <main className="border-blue-500 border w-2/3 aspect-video flex justify-center">
            <div>
            <h2 className="text-2xl font-bold mb-6 text-center text-blue-500">Consumption Graph</h2>
            </div>
        </main>
    )
}