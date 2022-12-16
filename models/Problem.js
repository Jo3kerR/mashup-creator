const mongoose = require("mongoose");

const problemSchema = mongoose.Schema({
  contestId: {
    type: String,
    required: true,
  },
  index: {
    type: String,
    rqeuired: true,
  },
  name: {
    type: String,
    rqeuired: true,
  },
  rating: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("problem", problemSchema);
