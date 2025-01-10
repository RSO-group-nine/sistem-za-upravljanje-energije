const Openapi = require("moleculer-auto-openapi");

module.exports = {
	name: "openapi",
	mixins: [Openapi],
	settings: {
		openapi: {
			info: {
				description:
					"This is the OpenAPI documentation for the Energy Management System for Smart Homes.",
				title: "Energy Management System API",
				version: "1.0.0",
				contact: {
					name: "API Support",
					url: "http://www.example.com/support",
					email: "support@example.com",
				},
			},
			tags: [
				{
					name: "auth",
					description: "Authentication related endpoints",
				},
			],
			components: {
				securitySchemes: {
					bearerAuth: {
						type: "http",
						scheme: "Bearer",
						bearerFormat: "JWT",
					},
				},
			},
			security: [
				{
					bearerAuth: [],
				},
			],
		},
		circuitBreaker: {
			enabled: true,
			threshold: 0.3,
			windowTime: 30,
		},
		retryPolicy: {
			enabled: true,
			retries: 3,
			delay: 500,
		},
	},
};
