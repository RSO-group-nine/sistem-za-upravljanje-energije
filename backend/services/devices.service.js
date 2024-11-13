"use strict";
const { MoleculerClientError } = require("moleculer").Errors;
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const { Sequelize, DataTypes, where, json } = require("sequelize");
const Client = require('azure-iot-device').Client;
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
		getDevices: {
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
	},

	methods: {
		async seedDB() {
			await this.adapter.insertMany([
				{ user_email: "rok.rajher8@gmail.com" },
				{ user_email: "rok.rajher8@gmail.com" },
			]);
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
