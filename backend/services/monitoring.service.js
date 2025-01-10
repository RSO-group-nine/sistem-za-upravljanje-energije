"use strict";
const { MoleculerClientError } = require("moleculer").Errors;
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const { DataTypes } = require("sequelize");
const { QueueClient } = require("@azure/storage-queue");
require("dotenv").config();

/**
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema
 * @typedef {import('moleculer-db').MoleculerDB} MoleculerDB
 */
module.exports = {
	name: "monitoring",
	mixins: [DbService],

	// Use Sequelize adapter for PostgreSQL
	adapter: new SqlAdapter(process.env.POSTGRES_URI, { dialect: "postgres" }),

	model: {
		// Define the model for PostgreSQL using Sequelize DataTypes
		name: "device",
		define: {
			device_id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			user_email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: false,
			},
			az_connection_string: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			az_device_id: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
		},
		options: {
			// Additional options for Sequelize model
			timestamps: true,
		},
	},

	settings: {
		JWT_SECRET: process.env.JWT_SECRET || "jwt-placeholder-secret",
		Q_NAME: process.env.Q_NAME || "telemetry-q",
		Q_CONNECTION_STRING:
			process.env.Q_CONNECTION_STRING ||
			"DefaultEndpointsProtocol=https;AccountName=rsoproject;AccountKey=uUz7Gad/xjFUYox/n2V85N09s3KEvyi3e/ShIOM2IEYGTZgT2gX8mFrGYCnVjWsZkiRB0wUCrMgk+AStRu3jIA==;EndpointSuffix=core.windows.net",
		entityValidator: {
			user_email: { type: "email" },
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

	actions: {
		getDeviceMonitoringInfo: {
			rest: "POST /info",
			params: {
				id: "number",
			},
			async handler(ctx) {
				const device_id = ctx.params.id;
				this.logger.info(
					`Fetching device info for device with ID: ${device_id}`
				);
				const device = await this.adapter.findById(device_id);
				if (!device) {
					throw new MoleculerClientError("Device not found", 404);
				}
				const data = device.toJSON();
				const az_device_id = data.az_device_id;
				const res = await this.readMessages(
					this.settings.Q_CONNECTION_STRING,
					this.settings.Q_NAME,
					az_device_id
				);

				if (!res) {
					throw new MoleculerClientError("No messages found", 404);
				}
				return JSON.parse(res);
			},
		},
		live: {
			rest: "GET /live",
			async handler(ctx) {
				this.logger.info("Monitoring service is live!");
				return "The monitoring service is live!";
			},
		},
		ready: {
			rest: "GET /ready",
			async handler(ctx) {
				this.logger.info("Monitoring service is ready!");
				return "The monitoring service is ready!";
			},
		},
	},

	methods: {
		async readMessages(connectionString, queueName, device_id) {
			const queueClient = new QueueClient(connectionString, queueName);

			console.log(`Reading messages from queue "${queueName}"...`);

			// Retrieve one or more messages
			const receivedMessages = await queueClient.receiveMessages({
				numberOfMessages: 32,
				visibilityTimeout: 1,
			});

			if (receivedMessages.receivedMessageItems.length === 0) {
				console.log("No messages found in the queue.");
				return;
			}
			let msges = [];
			console.log(
				`Received messages: ${receivedMessages.receivedMessageItems.length}`
			);
			for (const message of receivedMessages.receivedMessageItems) {
				// decode the message body from base64
				const messageText = Buffer.from(
					message.messageText,
					"base64"
				).toString();
				const messageJson = JSON.parse(messageText);
				const body = messageJson.data;

				console.log(
					`Received message: ${JSON.stringify(body)}, ID: ${
						message.messageId
					}`
				);
				const msg_device_id =
					body.systemProperties["iothub-connection-device-id"];
				console.log(`Device ID: ${msg_device_id}`);
				if (msg_device_id === device_id) msges.push(body);
			}
			return JSON.stringify(msges);
		},

		async seedDB() {
			const existingDevice = await this.adapter.findOne({
				where: { user_email: "rok.rajher8@gmail.com" },
			});
			if (!existingDevice) {
				await this.adapter.insertMany([
					{
						user_email: "rok.rajher8@gmail.com",
						az_connection_string:
							"HostName=RSO-group-09.azure-devices.net;DeviceId=device1;SharedAccessKey=AkFeFJhZXXzivYr5jAWaLKxwYyWOKVzdRV1lT89iD1U=",
						az_device_id: "device1",
					},
				]);
			}
		},
	},

	async started() {
		// Initialize the associations after the service has started
		await this.adapter.model.sync();
		// Seed the database with some initial data
		await this.seedDB();
		// Log a message to the console
		this.logger.info("Monitoring service started!");
	},
};
