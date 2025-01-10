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

	/**
	 * Dependencies
	 */
	dependencies: [],

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
				prompt: "string",
			},
			timeout: 30000, // Timeout 30 seconds
			/** @param {Context} ctx  */
			async handler(ctx) {
				try {
					const promptResponse = await helpers.generatePrompt(
						ctx.params.prompt
					);

					this.broker.logger.info(
						`The response to your question is: ${promptResponse}`
					);
					return `The response to your question is:\n${promptResponse}`;
				} catch (error) {
					this.broker.logger.error(
						"Failed to get a response from the Generative AI model."
					);
					return "Failed to get a response from the Generative AI model.";
				}
			},
		},
		live: {
			rest: "GET /live",
			async handler(ctx) {
				this.logger.info("GPT service is live!");
				return "The GPT service is live!";
			},
		},
		ready: {
			rest: "GET /ready",
			async handler(ctx) {
				this.logger.info("GPT service is ready!");
				return "The GPT service is ready!";
			},
		},
	},

	/**
	 * Events
	 */
	events: {},

	/**
	 * Methods
	 */
	methods: {},

	/**
	 * Service created lifecycle event handler
	 */
	created() {},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {},
};
