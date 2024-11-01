import ConsumptionGraph from "./consumptionGraph";

export default function Light() {
    const LightsData = [1,2,3,4]
    return (
        <div className="bg-red-50 container">
            <h1 className="flex items-center justify-center text-blue-500">Lights</h1>
            <div className="flex items-center justify-center">
            <ConsumptionGraph data={LightsData} />
            </div>
        </div>
    );
}