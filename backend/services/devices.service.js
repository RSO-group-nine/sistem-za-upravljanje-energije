"use strict";
const { MoleculerClientError } = require("moleculer").Errors;
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const { Sequelize, DataTypes, where, json } = require("sequelize");
const Registry = require('azure-iothub').Registry;
const Client = require('azure-iothub').Client;
const Message = require('azure-iot-device').Message;
const { QueueClient } = require('@azure/storage-queue');

const DeviceClient = require('azure-iot-device').Client;
const Protocol = require('azure-iot-device-mqtt').Mqtt;

/**
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema
 * @typedef {import('moleculer-db').MoleculerDB} MoleculerDB
 */

module.exports = {
	name: "devices",
	mixins: [DbService],

	// Use Sequelize adapter for PostgreSQL
	adapter: new SqlAdapter(process.env.POSTGRES_URI),

	model: {
		// Define the model for PostgreSQL using Sequelize DataTypes
		name: "device",
		define: {
			device_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
			user_email: { type: DataTypes.STRING, allowNull: false, unique: false },
			az_connection_string: { type: DataTypes.STRING, allowNull: false, unique: true },
			az_device_id: { type: DataTypes.STRING, allowNull: false, unique: true },
		},
		options: {
			// Additional options for Sequelize model
			timestamps: true,
		}
	},

	settings: {
		JWT_SECRET: process.env.JWT_SECRET || "jwt-placeholder-secret",
		Q_NAME: process.env.Q_NAME || "telemetry-q",
		Q_CONNECTION_STRING: process.env.Q_CONNECTION_STRING || "DefaultEndpointsProtocol=https;AccountName=rsoproject;AccountKey=uUz7Gad/xjFUYox/n2V85N09s3KEvyi3e/ShIOM2IEYGTZgT2gX8mFrGYCnVjWsZkiRB0wUCrMgk+AStRu3jIA==;EndpointSuffix=core.windows.net",
		entityValidator: {
			user_email: { type: "email" },
		}
	},

	actions: {
		// Create a new user
		getUserDevices: {
			rest: "GET /:user_id",
			// Use GET for fetching data
			params: {
				user_id: "string",
			},
			async handler(ctx) {
				this.logger.info("Fetching devices for user with ID: ", ctx.params.user_id);
				const user_id = ctx.params.user_id;
				this.logger.info(`Fetching devices for user with ID: ${user_id}`);
	
				// First, find the user by user_id (assuming you have an action or method for this)
				const user = await this.broker.call("users.getUserById", { user_id });

				this.logger.info(`User found: ${user}`);
	
				if (!user) {
					throw new MoleculerClientError("User not found", 404);
				}
	
				const user_email = user.email; // Assuming user object has the email field
	
				// Now, use the 'include' option to join the 'device' table with the 'user' table
				const devices = await this.adapter.find({where: { user_email }});

				this.logger.info(`Devices found: ${devices}`);
					
	
				if (!devices || devices.length === 0) {
					throw new MoleculerClientError("No devices found for this user", 404);
				}
	
				return {devices, user}; 
			},
		},
		getDeviceInfo: {
			rest : "POST /info",
			params: {
				id: "number",
			},
			async handler(ctx) {
				const device_id = ctx.params.id;
				this.logger.info(`Fetching device info for device with ID: ${device_id}`);
				const device = await this.adapter.findById(device_id);
					if (!device) {
						throw new MoleculerClientError("Device not found", 404);
					}
				const data = device.toJSON();
				const az_device_id = data.az_device_id;
				const res = await this.readMessages(this.settings.Q_CONNECTION_STRING, this.settings.Q_NAME, az_device_id);

				if (!res) {
					throw new MoleculerClientError("No messages found", 404);
				}
				return JSON.parse(res);
				
			}
		},
	},
		
		methods: {

		async readMessages(connectionString, queueName, device_id) {
			const queueClient = new QueueClient(connectionString, queueName);

			console.log(`Reading messages from queue "${queueName}"...`);

			// Retrieve one or more messages
			const receivedMessages = await queueClient.receiveMessages({ numberOfMessages: 24, visibilityTimeout: 1 });
			
			if (receivedMessages.receivedMessageItems.length === 0) {
				console.log("No messages found in the queue.");
				return;
			}
			let msges = []
			console.log(`Received messages: ${receivedMessages.receivedMessageItems.length}`);
			for (const message of receivedMessages.receivedMessageItems) {
				// decode the message body from base64
				const messageText = Buffer.from(message.messageText, "base64").toString();
				const messageJson = JSON.parse(messageText);
				const body = messageJson.data;

				console.log(`Received message: ${JSON.stringify(body)}, ID: ${message.messageId}`);
				const msg_device_id = body.systemProperties['iothub-connection-device-id'];
				console.log(`Device ID: ${msg_device_id}`);
				if (msg_device_id === device_id)
					msges.push(body);
			}
			return JSON.stringify(msges);
		},

		async seedDB() {
			const existingDevice = await this.adapter.findOne({ where: { user_email: "rok.rajher8@gmail.com" } });
			if (!existingDevice) {
				await this.adapter.insertMany([
					{ user_email: "rok.rajher8@gmail.com", az_connection_string: "HostName=RSO-group-09.azure-devices.net;DeviceId=device1;SharedAccessKey=AkFeFJhZXXzivYr5jAWaLKxwYyWOKVzdRV1lT89iD1U=", az_device_id: "device1" },
				]);
			}
		}
	},

	async started() {
		// Initialize the associations after the service has started
		await this.adapter.model.sync();
		// Seed the database with some initial data
		await this.seedDB();
		// Log a message to the console
		this.logger.info("Device service started!");
	},
};
