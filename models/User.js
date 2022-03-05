const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  handle: {
    type: String,
    required: true,
  },
  solvedProblems: [
    {
      rating: {
        type: Number,
        required: true,
      },
      contestId: {
        type: Number,
        required: true,
      },
      index: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        rquired: true,
      },
    },
  ],
});

module.exports = mongoose.model("user", userSchema);
