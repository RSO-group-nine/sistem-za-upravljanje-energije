"use strict";
const { MoleculerClientError } = require("moleculer").Errors;
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const { Sequelize, DataTypes, where, json } = require("sequelize");
const Registry = require('azure-iothub').Registry;
const Client = require('azure-iothub').Client;

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
				id: "number"
			},

			async handler(ctx) {
				let device_id = ctx.params.id;
				this.logger.info(`Fetching device info for device with ID: ${device_id}`);
				let device = await this.adapter.findById(device_id);
				if (!device) {
					throw new MoleculerClientError("Device not found", 404);
				}
				let data = device.toJSON();
				let connection_string = data.az_connection_string;
				this.logger.info(`Fetching device info for device with connection string: ${connection_string}`);
				let deviceClient = DeviceClient.fromConnectionString(connection_string, Protocol);
				this.logger.info('Device client created');
				let client = Client.fromConnectionString(process.env.IOT_HUB_CONNECTION_STRING);
				this.logger.info('IotHub client created');
				let registry = Registry.fromConnectionString(process.env.IOT_HUB_CONNECTION_STRING);

				let methodName = 'reboot';
				let deviceToReboot = data.device_id;

				let methodParams = {
					methodName: methodName,
					payload: null,
					timeoutInSeconds: 30
				};

				deviceClient.open((err) => {
					if (err) {
						this.logger.error('could not open IotHub client');
					} else {
						this.logger.info('IotHub client opened');
						deviceClient.onDeviceMethod('reboot', this.onReboot);
						this.logger.info('Device method registered');
					}
				});

				client.invokeDeviceMethod(deviceToReboot, methodParams, (err, result) => {
					if (err) {
						this.logger.error('could not invoke method' + err);
					} else {
						this.logger.info('Method invoked');
					}
				});

				return {"hellow":"world"};

			}
		},
	},



	methods: {		
		async onReboot(client) {

			this.logger.info("Rebooting device...");

			let date = new Date();

			let patch = {
				iothubDM : {
					reboot : {
						lastReboot : date.toISOString(),
					}
				}
			};

			client.getTwin(function(err, twin) {
				if (err) {
					this.logger.error('could not get twin');
				} else {
					console.log('twin acquired');
					twin.properties.reported.update(patch, function(err) {
						if (err) throw err;
						this.logger.info('Device reboot twin state reported')
					});  
				}
			});
		
			this.logger.info('Rebooting!');
		},


		async seedDB() {
			await this.adapter.insertMany([
				{ user_email: "rok.rajher8@gmail.com", az_connection_string: "HostName=RSO-group-09.azure-devices.net;DeviceId=device1;SharedAccessKey=AkFeFJhZXXzivYr5jAWaLKxwYyWOKVzdRV1lT89iD1U="},
			]);
		}
    },

    async started() {
        // Initialize the associations after the service has started
		await this.adapter.model.sync();
		// Seed the database with some initial data
		// await this.seedDB();
		// Log a message to the console
        this.logger.info("Device service started!");
    },
};
