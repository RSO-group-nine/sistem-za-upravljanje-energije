"use strict";

require("dotenv").config();
const ApiGateway = require("moleculer-web");

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 * @typedef {import('http').IncomingMessage} IncomingRequest Incoming HTTP Request
 * @typedef {import('http').ServerResponse} ServerResponse HTTP Server Response
 * @typedef {import('moleculer-web').ApiSettingsSchema} ApiSettingsSchema API Setting Schema
 */

module.exports = {
	name: "api",
	mixins: [ApiGateway],

	/** @type {ApiSettingsSchema} More info about settings: https://moleculer.services/docs/0.14/moleculer-web.html */
	settings: {
		// Exposed port
		port: process.env.PORT || 5000,

		// Exposed IP
		ip: "0.0.0.0",

		// Global Express middlewares. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Middlewares
		use: [],

		routes: [
			{
				path: `/api/${process.env.API_VERSION || "v1"}`,

				whitelist: ["**"],
				cors: {
					origin: ["http://localhost:3000", "http://localhost:5000", "https://sistem-za-upravljanje-energije-91846956206.europe-central2.run.app"], // Allow all origins for testing purposes
					methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
					allowedHeaders: ["Content-Type", "Authorization"], // Add Content-Type here
					exposedHeaders: [],
					credentials: true,
					maxAge: 3600,
				},

				// Route-level Express middlewares. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Middlewares
				use: [],

				// Enable/disable parameter merging method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Disable-merging
				mergeParams: true,

				// Enable authentication. Implement the logic into `authenticate` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authentication
				authentication: false,

				// Enable authorization. Implement the logic into `authorize` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authorization
				authorization: false,

				// The auto-alias feature allows you to declare your route alias directly in your services.
				// The gateway will dynamically build the full routes from service schema.
				autoAliases: true,

				aliases: {},

				/**
				 * Before call hook. You can check the request.
				 * @param {Context} ctx
				 * @param {Object} route
				 * @param {IncomingRequest} req
				 * @param {ServerResponse} res
				 * @param {Object} data
				 *
				onBeforeCall(ctx, route, req, res) {
					// Set request headers to context meta
					ctx.meta.userAgent = req.headers["user-agent"];
				}, */

				/**
				 * After call hook. You can modify the data.
				 * @param {Context} ctx
				 * @param {Object} route
				 * @param {IncomingRequest} req
				 * @param {ServerResponse} res
				 * @param {Object} data
				onAfterCall(ctx, route, req, res, data) {
					// Async function which return with Promise
					return doSomething(ctx, res, data);
				}, */

				// Calling options. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Calling-options
				callOptions: {},

				bodyParsers: {
					json: {
						strict: false,
						limit: "1MB",
					},
					urlencoded: {
						extended: true,
						limit: "1MB",
					},
				},

				// Mapping policy setting. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Mapping-policy
				mappingPolicy: "all", // Available values: "all", "restrict"

				// Enable/disable logging
				logging: true,
			},
			{
				path: "/api/openapi",
				whitelist: ["**"],
				cors: {
					origin: ["http://localhost:3000", "http://localhost:5000", "https://sistem-za-upravljanje-energije-91846956206.europe-central2.run.app"], // Allow all origins for testing purposes
					methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
					allowedHeaders: ["Content-Type", "Authorization"], // Add Content-Type here
					exposedHeaders: [],
					credentials: true,
					maxAge: 3600,
				},
				aliases: {
					"GET /openapi.json": "openapi.generateDocs", // swagger scheme
					"GET /ui": "openapi.ui", // ui
					"GET /assets/:file": "openapi.assets", // js/css files
				},
			},
		],

		// Do not log client side errors (does not log an error response when the error.code is 400<=X<500)
		log4XXResponses: false,
		// Logging the request parameters. Set to any log level to enable it. E.g. "info"
		logRequestParams: null,
		// Logging the response data. Set to any log level to enable it. E.g. "info"
		logResponseData: null,

		// Serve assets from "public" folder. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Serve-static-files
		assets: {
			folder: "public",

			// Options to `server-static` module
			options: {},
		},
	},

	methods: {
		/**
		 * Authorize the request. Check that the authenticated user has right to access the resource.
		 *
		 * PLEASE NOTE, IT'S JUST AN EXAMPLE IMPLEMENTATION. DO NOT USE IN PRODUCTION!
		 *
		 * @param {Context} ctx
		 * @param {Object} route
		 * @param {IncomingRequest} req
		 * @returns {Promise}
		 */
		async authorize(ctx, route, req) {
			let token;
			if (req.headers.authorization) {
				let type = req.headers.authorization.split(" ")[0];
				if (type === "Token" || type === "Bearer")
					token = req.headers.authorization.split(" ")[1];
			}

			let user;
			if (token) {
				// Verify JWT token
				try {
					user = await ctx.call("users.resolveToken", { token });
					if (user) {
						this.logger.info(
							"Authenticated via JWT: ",
							user.username
						);
						// Reduce user fields (it will be transferred to other nodes)
						ctx.meta.user = _.pick(user, [
							"id",
							"username",
							"email",
						]);
						ctx.meta.token = token;
						ctx.meta.userID = user._id;
					}
				} catch (err) {
					// Ignored because we continue processing if user doesn't exists
				}
			}

			if (req.$action.auth == "required" && !user)
				throw new UnAuthorizedError();
		},
	},
};
