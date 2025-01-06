"use strict";

const { ServiceBroker } = require("moleculer");
const ApiService = require("../../services/api.service");
const UsersService = require("../../services/users.service");

describe("Test Users Service", () => {
	let broker;

	beforeAll(async () => {
		// Create a new ServiceBroker
		broker = new ServiceBroker({ logger: false });

		// Load the service
		broker.createService(UsersService);
		broker.createService(ApiService);

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
	it("should register, login, logout and delete a user", async () => {
		try {
			await broker.call("users.userDelete", {
				email: "test@example.com",
			});
		} catch (e) {
			console.log(e);
		}

		// Register a user and log in to get a token
		const register = await broker.call("users.userRegister", {
			email: "test@example.com",
			password: "testpassword",
		});

		// Check that the response contains a 'user' object
		expect(register).toHaveProperty("user");

		const { user } = register;

		// Check that the 'user' object has the correct properties
		expect(user).toHaveProperty("id");
		expect(user).toHaveProperty("email");
		expect(user).toHaveProperty("password");
		expect(user).toHaveProperty("updatedAt");
		expect(user).toHaveProperty("createdAt");
		expect(user).toHaveProperty("token");

		// Check that the properties are defined
		expect(user.id).toBeDefined();
		expect(user.email).toBeDefined();
		expect(user.password).toBeDefined();
		expect(user.updatedAt).toBeDefined();
		expect(user.createdAt).toBeDefined();
		expect(user.token).toBeDefined();

		const loginRes = await broker.call("users.userLogin", {
			email: "test@example.com",
			password: "testpassword",
		});

		// Check that the response contains the 'user' object and 'token'
		expect(loginRes).toHaveProperty("user");
		expect(loginRes).toHaveProperty("token");

		const { user: loggedInUser, token: logInToken } = loginRes;

		// Check that the 'user' object has the correct properties
		expect(loggedInUser).toHaveProperty("id");
		expect(loggedInUser).toHaveProperty("email");
		expect(loggedInUser).toHaveProperty("password");
		expect(loggedInUser).toHaveProperty("createdAt");
		expect(loggedInUser).toHaveProperty("updatedAt");
		expect(loggedInUser).toHaveProperty("token");

		// Check that the 'token' is a string (JWT format)
		expect(typeof logInToken).toBe("string");
		expect(logInToken).toMatch(/^eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/); // Check token format

		// Check that the 'user' properties are defined
		expect(loggedInUser.id).toBeDefined();
		expect(loggedInUser.email).toBeDefined();
		expect(loggedInUser.password).toBeDefined();
		expect(loggedInUser.createdAt).toBeDefined();
		expect(loggedInUser.updatedAt).toBeDefined();
		expect(loggedInUser.token).toBeDefined();

		token = loginRes.token;

		const allUsers = await broker.call("users.fetchAllUsers");

		// Check that the result is an array
		expect(Array.isArray(allUsers)).toBe(true);

		// Optionally, check that each item in the array is an object (user)
		allUsers.forEach((user) => {
			expect(typeof user).toBe("object");
			expect(user).toHaveProperty("id"); // Example property, adjust based on your user object
			expect(user).toHaveProperty("email"); // Example property, adjust as needed
		});

		const getUserById = await broker.call("users.getUserById", {
			user_id: loggedInUser.id,
		});

		expect(getUserById).toHaveProperty("dataValues");

		const { dataValues } = getUserById;
		expect(dataValues).toHaveProperty("id");
		expect(dataValues).toHaveProperty("email");
		expect(dataValues).toHaveProperty("password");
		expect(dataValues).toHaveProperty("createdAt");
		expect(dataValues).toHaveProperty("updatedAt");

		const logoutRes = await broker.call("users.userLogout", {
			token,
		});

		expect(logoutRes).toEqual({
			status: "success",
		});

		const deleteUser = await broker.call("users.userDelete", {
			email: "test@example.com",
		});

		expect(deleteUser).toEqual({
			status: "success",
			message: "User deleted successfully",
		});
	});
});
