import ConsumptionGraph from "./consumptionGraph";
import GptPrompt from "./gptPrompt";

export default function Light() {
    const LightsData = [1,2,3,4]
    return (
        <div className="container flex flex-col gap-4">
            <h1 className="text-blue-500">Lights</h1>
            <ConsumptionGraph data={LightsData} />
            <GptPrompt />
        </div>
    );
}