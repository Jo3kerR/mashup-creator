const mongoose = require("mongoose");

const problemSchema = mongoose.Schema({
  rating: {
    type: Number,
    required: true,
  },
  problems: [
    {
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
    },
  ],
});

module.exports = mongoose.model("problem", problemSchema);
