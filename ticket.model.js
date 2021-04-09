//import the mongoose package
const mongoose = require("mongoose");
//get the Schema class
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
  creation_date: {
    required: true,
    default: Date.now,
    type: Date,
  },
  customer_name: {
    required: true,
    type: String,
  },
  performance_title: {
    required: true,
    type: String,
  },
  performance_time: {
    required: true,
    type: Date,
  },
  ticket_price: {
    required: true,
    type: Number,
  },
});

module.exports = mongoose.model("Ticket", TicketSchema);
