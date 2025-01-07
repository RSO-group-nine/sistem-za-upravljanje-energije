const { ServiceBroker } = require("moleculer");
const UsersSchema = require("../../services/users.service");

describe("Test 'users' service", () => {
	let broker = new ServiceBroker({ logger: false });
	let usersService = broker.createService(UsersSchema);

	// Create a mock insert function
	const mockRegister = jest.fn(() =>
		Promise.resolve({
			id: 123,
			email: "test@example.com",
			password: "hashedPassword",
		})
	);
	const mockFindOne = jest.fn(() => Promise.resolve(null)); // Simulate no user found

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	describe("Test 'users.register' action", () => {
		it("should create new user", async () => {
			// Replace adapter's insert with a mock
			usersService.adapter.insert = mockRegister;
			usersService.adapter.findOne = mockFindOne;

			// Call the action with email and password
			let result = await broker.call("users.register", {
				email: "test@example.com",
				password: "testpassword",
			});

			// Check the result
			expect(result).toEqual({
				id: 123,
				email: "test@example.com",
				password: "hashedPassword",
			});

			// Check if mock was called
			expect(mockRegister).toBeCalledTimes(1);
			expect(mockRegister).toBeCalledWith({
				email: "test@example.com",
				password: "testpassword",
			});
		});
	});
});
