"use strict";

const { ServiceBroker } = require("moleculer");
const ApiService = require("../../services/api.service");
const UsersService = require("../../services/users.service");
const supertest = require("supertest");

describe("Test API Service", () => {
	// Create a Service Broker
	const broker = new ServiceBroker({ logger: false });

	// Load the services
	broker.createService(ApiService);
	broker.createService(UsersService);

	// Start the broker before tests
	beforeAll(() => broker.start());

	// Stop the broker after tests
	afterAll(() => broker.stop());

	let request;
	beforeEach(() => {
		request = supertest(`http://146.190.206.116:3000`);
	});

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
			const res = await request.post(`/api/v1/devices/getUserDevices`);
			expect(res.status).toBe(401);
			expect(res.body).toHaveProperty("message", "Unauthorized");
		});

		it("should return unauthorized if token is invalid", async () => {
			const res = await request
				.post(`/api/v1/devices/getUserDevices`)
				.set("Authorization", "Bearer invalidToken")
				.send({ user_id: userId });
			expect(res.status).toBe(401);
			expect(res.body).toHaveProperty("message", "Unauthorized");
		});

		it("should authorize user with a valid token", async () => {
			const res = await request
				.post(`/api/v1/devices/getUserDevices`)
				.set("Authorization", `Bearer ${token}`)
				.send({ user_id: userId });
			expect(res.status).toBe(200);
		});

		it("should return unauthorized if token is expired", async () => {
			// Mock expired token scenario (Assuming you have a way to mock expired token handling in your `resolveToken` method)
			const expiredToken = "expiredToken"; // You can generate an expired token for testing if needed
			const res = await request
				.post(`/api/v1/devices/getUserDevices`)
				.set("Authorization", `Bearer ${expiredToken}`)
				.send({ user_id: userId });
			expect(res.status).toBe(401);
			expect(res.body).toHaveProperty("message", "Unauthorized");
		});
	});

	describe("Test OpenAPI Routes", () => {
		it("should serve the OpenAPI documentation JSON", async () => {
			const res = await request.get(`/api/openapi/openapi.json`);
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("openapi");
		});

		it("should serve the OpenAPI UI", async () => {
			const res = await request.get(`/api/openapi/ui`);
			expect(res.status).toBe(200);
			expect(res.text).toContain("<title>OpenAPI UI</title>");
		});
	});
});
