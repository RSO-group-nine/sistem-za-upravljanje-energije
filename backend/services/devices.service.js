"use strict";
const { MoleculerClientError } = require("moleculer").Errors;
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const { Sequelize, DataTypes, where, json } = require("sequelize");
const Registry = require('azure-iothub').Registry;
const Client = require('azure-iothub').Client;
const Message = require('azure-iot-device').Message;

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
		JWT_SECRET: process.env.JWT_SECRET || "jwt-placeholder-secret", // JWT secret key
		// Validation rules for actions
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
		
				try {
					// Find device by ID
					const device = await this.adapter.findById(device_id);
					if (!device) {
						throw new MoleculerClientError("Device not found", 404);
					}
		
					const data = device.toJSON();
					const connection_string = data.az_connection_string;
					const deviceToReboot = data.az_device_id;
					this.logger.info(`Using connection string: ${connection_string}`);
		
					// Initialize the DeviceClient and IoT Hub Client
					const deviceClient = DeviceClient.fromConnectionString(connection_string, Protocol);
					const serviceClient = Client.fromConnectionString(process.env.IOT_HUB_CONNECTION_STRING);
					const methodParams = {
						methodName: 'sendTelemetry',
						payload: null,
						timeoutInSeconds: 30,
					};
		
					// Open device client with better error handling
					// try {
					// 	await deviceClient.open();
					// 	this.logger.info('IoT Hub device client opened');
		
					// 	// Register the 'sendTelemetry' method
					// 	deviceClient.onDeviceMethod('sendTelemetry', this.onSendTelemetry.bind(this));
					// 	this.logger.info('Device method "sendTelemetry" registered successfully');
					// } catch (err) {
					// 	this.logger.error('Could not open or register device method on IoT Hub device client:', err.message);
					// 	throw new MoleculerClientError('Failed to initialize device client', 500);
					// }
		
					// Open service client and invoke method
					try {
						await serviceClient.open();
						this.logger.info('IoT Hub service client opened');
						
						this.logger.info("Invoking method on device with ID:", deviceToReboot);

						const result = await serviceClient.invokeDeviceMethod(deviceToReboot, methodParams);
						
						this.logger.info('Telemetry successfully sent', result);
						return { deviceInfo: JSON.parse(result.payload) };
					} catch (err) {
						this.logger.error('Error invoking method:', err.message);
						throw new MoleculerClientError('Failed to invoke method', 500);
					} finally {
						await serviceClient.close();
						this.logger.info('IoT Hub service client closed');
					}
				} catch (err) {
					this.logger.error('Handler error:', err.message);
					throw err;
				}
			}
		},
	},
		
		methods: {
			// Method to handle the device method call and send telemetry data
			async onSendTelemetry(request, response) {
				this.logger.info("Sending telemetry data...");
		
				// Generate random telemetry data
				const telemetryData = this.generateRandomTelemetry();
				this.logger.info("Generated telemetry data:", telemetryData);
		
				try {
					// Send telemetry data to IoT Hub
					await this.deviceClient.sendEvent(new Message(JSON.stringify(telemetryData)));
					this.logger.info('Telemetry data sent successfully');
		
					// Send response back to IoT Hub
					response.send(200, JSON.stringify(telemetryData));
					this.logger.info('Response sent successfully');
				} catch (err) {
					this.logger.error('Error in onSendTelemetry method:', err.message);
					response.send(500, { error: "Failed to send telemetry data" });
				}
			},

		// Helper method to generate random telemetry values
		generateRandomTelemetry() {
			return {
				temperature: (Math.random() * 15 + 15).toFixed(2), // Random temperature between 15-30°C
				humidity: (Math.random() * 50 + 30).toFixed(2),    // Random humidity between 30-80%
				pressure: (Math.random() * 50 + 950).toFixed(2),   // Random pressure between 950-1000 hPa
				timestamp: new Date().toISOString(),               // Timestamp
			};
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
