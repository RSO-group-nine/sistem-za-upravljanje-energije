"use strict";

const helpers = require("../utils/promptHelper.js");

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
*/

/** @type {ServiceSchema} */
module.exports = {
	name: "gpt",

	/**
	 * Settings
	 */
	settings: {

	},

	/**
	 * Dependencies
	 */
	dependencies: [
	],

	/**
	 * Actions
	 */
	actions: {
		/**
		 * Welcome, a username
		 *
		 * @param {String} prompt - User name
		 */
		prompt: {
			rest: "POST /prompt",
			params: {
				prompt: "string"
			},
			/** @param {Context} ctx  */
			async handler(ctx) {
				try {
					const promptResponse = await helpers.generatePrompt(ctx.params.prompt);

					this.broker.logger.info(`The response to your question is, ${promptResponse}`);
					return `The response to your question is, ${promptResponse}`;
				} catch (error) {
					this.broker.logger.error("Failed to get response from OpenAI.");
					return "Failed to get response from OpenAI.";
				}
			}
		}
	},

	/**
	 * Events
	 */
	events: {

	},

	/**
	 * Methods
	 */
	methods: {

	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};
