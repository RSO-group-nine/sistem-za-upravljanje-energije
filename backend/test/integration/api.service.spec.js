const { ServiceBroker } = require("moleculer");
const UsersService = require("../../services/users.service");
const DevicesService = require("../../services/devices.service");
const GptService = require("../../services/gpt.service");
const ApiServices = require("../../services/api.service");

describe("Test API Services", () => {
	// Create a Service Broker
	const broker = new ServiceBroker({ logger: false });

	// Load the services
	broker.createService(UsersService);
	broker.createService(DevicesService);
	broker.createService(GptService);
	broker.createService(ApiServices);

	// Start the broker before tests
	beforeAll(() => broker.start());

	// Stop the broker after tests
	afterAll(() => broker.stop());

	describe("Test Authentication", () => {
		let token;
		let userId;

		beforeAll(async () => {
			const loginRes = await broker.call("users.userLogin", {
				email: "tone@google.si",
				password: "aaaaaa",
			});
			token = loginRes.token;
			userId = loginRes.user.id;
		});

		it("should return unauthorized if no token is provided", async () => {
			try {
				await broker.call("devices.getUserDevices", {
					user_id: userId,
				});
			} catch (err) {
				expect(err.code).toBe(401);
				expect(err.message).toBe("Unauthorized");
			}
		});

		it("should return unauthorized if token is invalid", async () => {
			try {
				await broker.call(
					"devices.getUserDevices",
					{
						user_id: userId,
					},
					{ meta: { Authorization: "Bearer invalidToken" } }
				);
			} catch (err) {
				expect(err.code).toBe(401);
				expect(err.message).toBe("Unauthorized");
			}
		});

		it("should authorize user with a valid token", async () => {
			const res = await broker.call(
				"devices.getUserDevices",
				{
					user_id: userId,
				},
				{ meta: { Authorization: `Bearer ${token}` } }
			);
			expect(res).toBeDefined();
		});

		it("should return unauthorized if token is expired", async () => {
			try {
				const expiredToken = "expiredToken"; // Generate an expired token for testing if needed
				await broker.call(
					"devices.getUserDevices",
					{
						user_id: userId,
					},
					{ meta: { Authorization: `Bearer ${expiredToken}` } }
				);
			} catch (err) {
				expect(err.code).toBe(401);
				expect(err.message).toBe("Unauthorized");
			}
		});
	});
});
