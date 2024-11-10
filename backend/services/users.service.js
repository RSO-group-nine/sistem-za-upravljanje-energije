"use strict";

const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const { Sequelize, DataTypes, where } = require("sequelize");

/**
 * @typedef {import('moleculer').Context} Context
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema
 * @typedef {import('moleculer-db').MoleculerDB} MoleculerDB
 */

module.exports = {
	name: "users",
	mixins: [DbService],

	// Use Sequelize adapter for PostgreSQL
	adapter: new SqlAdapter(process.env.POSTGRES_URI),
	model: {
		// Define the model for PostgreSQL using Sequelize DataTypes
		name: "user",
		define: {
			id: { type: DataTypes.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
			email: { type: DataTypes.STRING, allowNull: false, unique: true },
			password: { type: DataTypes.STRING, allowNull: false }
		},
		options: {
			// Additional options for Sequelize model
			timestamps: true,
		}
	},

	settings: {
		// Validation rules for actions
		entityValidator: {
			email: { type: "email" },
			password: { type: "string", min: 6 }
		}
	},

	actions: {
		// Create a new user
		create: {
			params: {
				email: "email",
				password: "string|min:6"
			},
			async handler(ctx) {
				const user = ctx.params;
				return await this.adapter.insert(user);
			}
		},

		// Retrieve a user by ID
		verifyUser: {
            rest: "POST /verify",
			params: {
				email: "email",
                password: "string"
			},
			async handler(ctx) {
                this.logger.info('Verify user:', ctx.params);
				const user = await this.adapter.findOne({where: ctx.params});

                if (!user) {
                    return { error: "User not found", status: 404 };
                }
                return { user: user, status: 200 };
			}
		},

		// Update an existing user
		update: {
			params: {
				id: "string",
				email: { type: "email", optional: true },
				password: { type: "string", optional: true, min: 6 }
			},
			async handler(ctx) {
				const { id, ...updates } = ctx.params;
				return await this.adapter.updateById(id, { $set: updates });
			}
		},

		// Delete a user
		remove: {
			params: {
				id: "string"
			},
			async handler(ctx) {
				return await this.adapter.removeById(ctx.params.id);
			}
		}
	},

	methods: {
		/**
		 * Seed the DB with initial users.
		 */
		async seedDB() {
			await this.adapter.insertMany([
				{ email: "john@example.com", password: "password123" },
				{ email: "jane@example.com", password: "password456" }
			]);
		}
	},

	async started() {
		// Call the started lifecycle method from DbService
		if (this.seedDB) {
				const count = await this.adapter.count();
				if (count === 0) {
					this.logger.info(`The users table is empty. Seeding the table...`);
					await this.seedDB();
					this.logger.info("Seeding is complete. Number of records:", await this.adapter.count());
				}
			}
	}
};
