const mongoose = require("mongoose");

const contestSchema = mongoose.Schema({
  duration: {
    type: Number,
    default: 120,
  },
  contestNumber: {
    type: Number,
    required: true,
  },
  users: [
    {
      type: String,
      required: true,
    },
  ],
  ratings: [
    {
      type: Number,
      min: 800,
      max: 3500,
      required: true,
    },
  ],
});

module.exports = mongoose.model("contest", contestSchema);
