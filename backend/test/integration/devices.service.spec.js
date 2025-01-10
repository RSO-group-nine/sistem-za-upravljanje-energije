"use strict";

const { ServiceBroker } = require("moleculer");
const UsersService = require("../../services/users.service");
const DevicesService = require("../../services/devices.service");
const MonitoringService = require("../../services/monitoring.service");

describe("Test Devices Service", () => {
	let broker;

	beforeAll(async () => {
		// Create a new ServiceBroker
		broker = new ServiceBroker({ logger: false });

		// Load the services
		broker.createService(UsersService);
		broker.createService(DevicesService);
		broker.createService(MonitoringService);

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

	let token;
	let userId;
	it("should login and not get devices", async () => {
		const loginRes = await broker.call("users.userLogin", {
			email: "tone@google.si",
			password: "aaaaaa",
		});

		token = loginRes.token;
		userId = loginRes.user.id;

		const getDevices = await broker.call("devices.getUserDevices", {
			user_id: userId,
		});

		expect(Array.isArray(getDevices)).toBe(true);
		expect(getDevices).toEqual([]);

		const logoutRes = await broker.call("users.userLogout", {
			token,
		});

		expect(logoutRes).toEqual({
			status: "success",
		});
	});

	it("should login and get devices", async () => {
		const loginRes = await broker.call("users.userLogin", {
			email: "rok.rajher8@gmail.com",
			password: "roko1113",
		});

		token = loginRes.token;
		userId = loginRes.user.id;

		const getDevices = await broker.call("devices.getUserDevices", {
			user_id: userId,
		});

		// Check that the response is an array
		expect(Array.isArray(getDevices)).toBe(true);

		// Check that the array is not empty
		expect(getDevices.length).toBeGreaterThan(0);

		// Iterate through the devices to check their properties
		getDevices.forEach((device) => {
			expect(device).toHaveProperty("az_connection_string");
			expect(device).toHaveProperty("az_device_id");
			expect(device).toHaveProperty("createdAt");
			expect(device).toHaveProperty("updatedAt");
			expect(device).toHaveProperty("device_id");
			expect(device).toHaveProperty("user_email");
		});

		const deviceInfo = await broker.call(
			"monitoring.getDeviceMonitoringInfo",
			{
				id: getDevices[0].device_id,
			}
		);

		// Check that the response is an array
		expect(Array.isArray(deviceInfo)).toBe(true);

		// Iterate through the messages to verify their structure
		deviceInfo.forEach((message) => {
			// Check that each message has 'properties', 'systemProperties', and 'body'
			expect(message).toHaveProperty("properties");
			expect(message).toHaveProperty("systemProperties");
			expect(message).toHaveProperty("body");

			// Validate 'properties' is an object
			expect(typeof message.properties).toBe("object");

			// Validate 'systemProperties' contains the expected keys
			expect(message.systemProperties).toHaveProperty(
				"iothub-content-type"
			);
			expect(message.systemProperties).toHaveProperty(
				"iothub-content-encoding"
			);
			expect(message.systemProperties).toHaveProperty(
				"iothub-connection-device-id"
			);
			expect(message.systemProperties).toHaveProperty(
				"iothub-connection-auth-method"
			);
			expect(message.systemProperties).toHaveProperty(
				"iothub-connection-auth-generation-id"
			);
			expect(message.systemProperties).toHaveProperty(
				"iothub-enqueuedtime"
			);
			expect(message.systemProperties).toHaveProperty(
				"iothub-message-source"
			);
			expect(message.systemProperties).toHaveProperty("dt-dataschema");

			// Validate 'body' contains the expected keys
			expect(message.body).toHaveProperty("temperature");
			expect(message.body).toHaveProperty("date");

			// Optionally validate types for 'body'
			expect(typeof message.body.temperature).toBe("number");
			expect(typeof message.body.date).toBe("string");
		});

		const logoutRes = await broker.call("users.userLogout", {
			token,
		});

		expect(logoutRes).toEqual({
			status: "success",
		});
	});
});
