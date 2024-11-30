"use strict";
const { MoleculerClientError } = require("moleculer").Errors;
const DbService = require("moleculer-db");
const SqlAdapter = require("moleculer-db-adapter-sequelize");
const { Sequelize, DataTypes, where, json } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			email: { type: DataTypes.STRING, allowNull: false, unique: true },
			password: { type: DataTypes.STRING, allowNull: false },
		},
		options: {
			// Additional options for Sequelize model
			timestamps: true,
		},
	},

	settings: {
		JWT_SECRET: process.env.JWT_SECRET || "jwt-placeholder-secret", // JWT secret key
		// Validation rules for actions
		entityValidator: {
			email: { type: "email" },
			password: { type: "string", min: 6 },
		},
	},

	actions: {
		// Create a new user
		userRegister: {
			rest: "POST /register",
			params: {
				email: "email",
				password: "string|min:6",
			},
			async handler(ctx) {
				const user = ctx.params;
				// Check if the email is already in use
				const found = await this.adapter.findOne({
					where: { email: user.email },
				});

				if (found) {
					throw new MoleculerClientError(
						"Email already in use",
						422,
						"",
						[{ field: "email", message: "is already in use" }]
					);
				}

				// Hash the password before saving it to the database
				user.password = await bcrypt.hash(user.password, 10);

				const doc = await this.adapter.insert(user);
				const json = doc.toJSON();

				const entity = this.transformEntity(json, true, ctx.meta.token);

				return entity;
			},
		},

		userLogin: {
			rest: "POST /login",
			params: {
				email: "email",
				password: "string",
			},
			async handler(ctx) {
				const { email, password } = ctx.params;
				const user = await this.adapter.findOne({ where: { email } });

				if (!user) {
					throw new MoleculerClientError("User not found", 404, "", [
						{ field: "email", message: "is not found" },
					]);
				}

				// Verify the password
				const match = await bcrypt.compare(password, user.password);
				if (!match) {
					throw new MoleculerClientError(
						"Invalid password",
						401,
						"",
						[{ field: "password", message: "is incorrect" }]
					);
				}

				// Transform and return user data with token
				const json = user.toJSON();
				const entity = this.transformEntity(json, true, ctx.meta.token);
				const token = entity.user.token;
				ctx.meta.$responseHeaders = {
					"Set-Cookie": `token=${token}; HttpOnly; Secure; Path=/; Max-Age=86400; SameSite=Strict`,
				};

				return entity;
			},
		},
		userLogout: {
			rest: "POST /logout",
			async handler(ctx) {
				ctx.meta.$responseHeaders = {
					"Set-Cookie": `token=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Strict`,
				};
				return { status: "success" };
			},
		},
		/**
		 * Get user by JWT token (for API GW authentication)
		 *
		 * @actions
		 * @param {String} token - JWT token
		 *
		 * @returns {Object} Resolved user
		 */
		resolveToken: {
			rest: "POST /resolve",
			cache: {
				keys: ["token"],
				ttl: 60 * 60, // 1 hour
			},
			params: {
				token: "string",
			},
			async handler(ctx) {
				this.logger.info("Resolving token:", ctx.params.token);
				const decoded = await new this.Promise((resolve, reject) => {
					jwt.verify(
						ctx.params.token,
						this.settings.JWT_SECRET,
						(err, decoded) => {
							if (err) return reject(err);

							resolve(decoded);
						}
					);
				});

				if (decoded.id) return this.getById(decoded.id);
			},
		},
	},
	getUserById: {
		rest: "GET /:user_id",
		async handler(ctx) {
			const user_id = ctx.params.user_id;
			this.logger.info(`Fetching user with ID: ${user_id}`);

			const user = await this.getById(user_id);

			this.logger.info(`User found: ${user}`);

			if (!user) {
				throw new MoleculerClientError("User not found", 404);
			}

			return user;
		},
	},
	methods: {
		/**
		 * Generate a JWT token from user entity
		 *
		 * @param {Object} user
		 */
		generateJWT(user) {
			const today = new Date();
			const exp = new Date(today);
			exp.setDate(today.getDate() + 60);

			return jwt.sign(
				{
					id: user.id,
					username: user.username,
					exp: Math.floor(exp.getTime() / 1000),
				},
				this.settings.JWT_SECRET
			);
		},

		/**
		 * Transform returned user entity. Generate JWT token if neccessary.
		 *
		 * @param {Object} user
		 * @param {Boolean} withToken
		 */
		transformEntity(user, withToken, token) {
			if (user) {
				if (withToken) user.token = token || this.generateJWT(user);
			}

			return { user };
		},
		/**
		 * Seed the DB with initial users.
		 */
		async seedDB() {
			await this.adapter.insertMany([
				{ email: "john@example.com", password: "password123" },
				{ email: "jane@example.com", password: "password456" },
			]);
		},
	},

	async started() {
		// Call the started lifecycle method from DbService
		if (this.seedDB) {
			const count = await this.adapter.count();
			if (count === 0) {
				this.logger.info(
					`The users table is empty. Seeding the table...`
				);
				await this.seedDB();
				this.logger.info(
					"Seeding is complete. Number of records:",
					await this.adapter.count()
				);
			}
		}
	},
};
