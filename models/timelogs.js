const mongoose = require("mongoose");

const timeSchema = mongoose.Schema(
  {
    date: {
        type: Date,
        required: true
    },
    timeIn: {
      type: Date,
    },
    timeOut: {
      type: Date,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Timelog", timeSchema);