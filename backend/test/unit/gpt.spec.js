const { ServiceBroker } = require("moleculer");
const gptService = require("../../services/gpt.service");
const helpers = require("../../utils/promptHelper");

jest.mock("../../utils/promptHelper", () => ({
	generatePrompt: jest.fn(),
}));

describe("Test 'gpt' service", () => {
	let broker;

	beforeAll(async () => {
		// Create a new ServiceBroker
		broker = new ServiceBroker({ logger: false });

		// Load the service
		broker.createService(gptService);

		// Start the broker
		await broker.start();
	});

	afterAll(async () => {
		// Stop the ServiceBroker
		await broker.stop();
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should respond with a valid prompt response", async () => {
		// Mock the helper function
		helpers.generatePrompt.mockResolvedValue("Mocked AI Response");

		// Call the action
		const response = await broker.call("gpt.prompt", {
			prompt: "Hello AI",
		});

		expect(response).toBe(
			"The response to your question is:\nMocked AI Response"
		);
		expect(helpers.generatePrompt).toHaveBeenCalledTimes(1);
		expect(helpers.generatePrompt).toHaveBeenCalledWith("Hello AI");
	});

	it("should handle errors gracefully", async () => {
		// Mock the helper function to throw an error
		helpers.generatePrompt.mockRejectedValue(new Error("Mocked error"));

		// Call the action
		const response = await broker.call("gpt.prompt", {
			prompt: "Hello AI",
		});

		expect(response).toBe(
			"Failed to get a response from the Generative AI model."
		);
		expect(helpers.generatePrompt).toHaveBeenCalledTimes(1);
		expect(helpers.generatePrompt).toHaveBeenCalledWith("Hello AI");
	});

	it("should throw validation error for invalid params", async () => {
		await expect(
			broker.call("gpt.prompt", { prompt: 123 }) // Invalid prompt type
		).rejects.toThrow("Parameters validation error!");
	});
});
