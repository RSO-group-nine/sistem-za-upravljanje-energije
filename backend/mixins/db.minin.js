"use strict";

const fs = require("fs");
const DbService = require("moleculer-db");

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 * @typedef {import('moleculer-db').MoleculerDB} MoleculerDB Moleculer's DB Service Schema
 */

module.exports = function(tableName) {
	const cacheCleanEventName = `cache.clean.${tableName}`;

	/** @type {MoleculerDB & ServiceSchema} */
	const schema = {
		mixins: [DbService],

		events: {
			/**
			 * Subscribe to the cache clean event. If it's triggered
			 * clean the cache entries for this service.
			 *
			 * @param {Context} ctx
			 */
			async [cacheCleanEventName](ctx) {
				if (this.broker.cacher) {
					await this.broker.cacher.clean(`${this.fullName}.*`);
				}
			}
		},

		methods: {
			/**
			 * Send a cache clearing event when an entity changed.
			 *
			 * @param {String} type
			 * @param {any} json
			 * @param {Context} ctx
			 */
			async entityChanged(type, json, ctx) {
				ctx.broadcast(cacheCleanEventName);
			}
		},

		/**
		 * Service lifecycle event handler.
		 */
		async started() {
			// Check the count of items in the DB. If it's empty,
			// call the `seedDB` method of the service.
			if (this.seedDB) {
				const count = await this.adapter.count();
				if (count === 0) {
					this.logger.info(`The '${tableName}' table is empty. Seeding the table...`);
					await this.seedDB();
					this.logger.info("Seeding is complete. Number of records:", await this.adapter.count());
				}
			}
		}
	};

	if (process.env.POSTGRES_URI) {
		const SqlAdapter = require("moleculer-db-adapter-sequelize");
		schema.adapter = new SqlAdapter(process.env.POSTGRES_URI);
	} else {
		// Ensure data directory exists for MemoryAdapter file storage
		try {
			if (!fs.existsSync("./data")) {
				fs.mkdirSync("./data");
			}
		} catch (error) {
			console.error("Error creating data directory:", error);
		}
		schema.adapter = new DbService.MemoryAdapter({ filename: `./data/${tableName}.db` });
	}

	return schema;
};
