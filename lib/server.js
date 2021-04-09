const Hapi = require("hapi");
const Joi = require("@hapi/joi");
const Boom = require("boom");
const AuthBearer = require("hapi-auth-bearer-token");
const mongoose = require("mongoose");
const moment = require("moment");
const Ticket = require("../ticket.model");
const { reducer } = require("../utility");
const customToken = "47290320668846711828869882046916";
const mongoDbUri = "mongodb://mongo:27017/test"; //"mongodb://localhost:27017/test";

mongoose.connect(mongoDbUri, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
  poolSize: 10,
});

mongoose.connection.on("connected", () => {
  console.log(`app is connected to ${mongoDbUri}`);
});

mongoose.connection.on("error", (err) => {
  console.log("error while connecting to mongodb", err);
});

const server = Hapi.server({ port: 8080 });

/**
 * Post tickets
 * @returns {Object} the created ticket
 */
server.route({
  path: "/api/tickets",
  method: "POST",
  options: {
    tags: ["api", "ticket"],
    description: "Create a ticket",
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      payload: Joi.object({})
        .keys({
          creation_date: Joi.date().description("Creation Date"),
          customer_name: Joi.string().required().description("Customer Name"),
          performance_title: Joi.string()
            .required()
            .description("Performance Title"),
          performance_time: Joi.date()
            .required()
            .description("Performance Time"),
          ticket_price: Joi.number().required().description("Ticket Price"),
        })
        .meta({ className: "Ticket" }),
    },
    handler: async (req, h) => {
      const ticket = await Ticket.create({
        ...req.payload,
      });
      return { id: ticket.get("id") };
    },
  },
});

/**
 * Get all tickets
 * @returns {[Object]} all the tickets
 */
server.route({
  path: "/api/tickets",
  method: "GET",
  options: {
    tags: ["api", "ticket"],
    description: "Get all tickets",
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
    },

    handler: async (req, h) => {
      const tickets = await Ticket.find({});
      return { tickets };
    },
  },
});

/**
 * Get ticket by id
 * @param {String} id
 * @returns {[Object]} ticket
 */
server.route({
  path: "/api/tickets/{id}",
  method: "GET",
  options: {
    tags: ["api", "ticket"],
    description: "Get ticket by id",
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      params: {
        id: Joi.string().required().description("ticket id"),
      },
    },
    handler: async (req, h) => {
      if (!req.params.id) {
        throw Boom.badRequest("id parameter missing");
      }
      const ticket = await Ticket.findById(req.params.id);
      if (ticket) {
        return { tickets: [ticket._doc] };
      } else {
        throw Boom.notFound("ticket not found");
      }
    },
  },
});

/**
 * Update ticket by id
 * @param {String} id
 * @returns {[Object]} ticket
 */
server.route({
  path: "/api/tickets/{id}",
  method: "PUT",
  options: {
    tags: ["api", "ticket"],
    description: "Update ticket by id",
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      params: {
        id: Joi.string().required().description("ticket id"),
      },
    },
    handler: async (req, h) => {
      if (!req.params.id) {
        throw Boom.badRequest("id parameter missing");
      }
      const attributes = { ...req.payload };
      const ticket = await Ticket.findByIdAndUpdate(req.params.id, attributes, {
        new: true,
      });
      if (ticket) {
        return { tickets: [ticket._doc] };
      } else {
        throw Boom.notFound("ticket not found");
      }
    },
  },
});

/**
 * Delete ticket by id
 * @param {String} id
 * @returns
 */
server.route({
  path: "/api/tickets/{id}",
  method: "DELETE",
  options: {
    tags: ["api", "ticket"],
    description: "Delete ticket by id",
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      params: {
        id: Joi.string().required().description("ticket id"),
      },
    },
    handler: async (req, h) => {
      try {
        if (!req.params.id) {
          throw Boom.badRequest("id parameter missing");
        }

        await Ticket.findByIdAndRemove(req.params.id);

        return h.response().code(204);
      } catch (err) {
        return err.message;
      }
    },
  },
});

/**
 * Get Analytics
 * @param {String} type
 * @returns {[object]} analytics
 */
server.route({
  path: "/api/analytics/{type}",
  method: "POST",
  options: {
    tags: ["api", "analytics"],
    description: "Get analytics",
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required(),
      }).options({ allowUnknown: true }),
      query: {
        method: Joi.string()
          .required()
          .description("Method to be used to get analytics"),
      },
      payload: Joi.object({})
        .keys({
          start_date: Joi.date().required().description("Start Date"),
          end_date: Joi.date().required().description("End Date"),
        })
        .meta({ className: "Analytics" }),
      params: {
        type: Joi.string()
          .required()
          .description("type of analytics (visits or profit)"),
      },
    },
    handler: async (req, h) => {
      try {
        let tickets;
        let method = req.query.method || "aggregation";
        if (method === "aggregation") {
          tickets = await Ticket.aggregate([
            {
              $match: {
                performance_time: {
                  $gt: new Date(req.payload.start_date),
                  $lt: new Date(req.payload.end_date),
                },
              },
            },
            {
              $group: {
                _id: {
                  month: { $month: "$performance_time" },
                  year: { $year: "$performance_time" },
                },
                total: {
                  $sum: req.params.type === "profit" ? "$ticket_price" : 1,
                },
              },
            },
          ]);

          const stats =
            req.params.type === "profit" ? "summaryProfit" : "summaryVisits";
          const resp = tickets.map((ticket) => {
            return {
              month: moment()
                .month(ticket._id.month - 1)
                .format("MMMM"),
              [stats]: ticket.total,
              year: ticket._id.year,
            };
          });
          return { analytics: resp };
        } else {
          tickets = await Ticket.find({
            performance_time: {
              $gt: new Date(req.payload.start_date),
              $lt: new Date(req.payload.end_date),
            },
          });

          const resp = tickets.map((ticket) => {
            return {
              ...ticket._doc,
              month: parseInt(moment(ticket._doc.performance_time).format("M")),
              year: parseInt(
                moment(ticket._doc.performance_time).format("YYYY")
              ),
            };
          });

          return { analytics: reducer(req, resp) };
        }
      } catch (err) {
        throw err.message;
      }
    },
  },
});

/**
 * Start the server
 * @returns object
 */
exports.start = async () => {
  await server.register([
    require("inert"),
    require("vision"),
    {
      plugin: require("hapi-swaggered"),
      options: {
        auth: false,
        tags: {
          api: "Ticket Management API",
        },
        info: {
          title: "Ticket Management API",
          description:
            "Powered by node, hapi, hapi-swaggered, hapi-swaggered-ui and swagger-ui",
          version: "1.0",
        },
      },
    },
    {
      plugin: require("hapi-swaggered-ui"),
      options: {
        title: "Example API",
        path: "/docs",
        auth: false,
        authorization: {
          // see above
          field: "authorization",
          scope: "header", // header works as well
          valuePrefix: "bearer ", // prefix incase
          defaultValue: "47290320668846711828869882046916",
          placeholder: "Enter your apiKey here",
        },
      },
    },
    AuthBearer,
  ]);

  server.auth.strategy("simple", "bearer-access-token", {
    allowQueryToken: true,
    validate: async (request, token, h) => {
      const isValid = token === customToken;
      const credentials = { token };

      return { isValid, credentials };
    },
  });

  server.auth.default("simple");
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
  return server;
};

/**
 * Init new server for testing
 * @returns object
 */
exports.init = async () => {
  await server.initialize();
  return server;
};
