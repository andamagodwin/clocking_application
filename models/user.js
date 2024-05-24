const mongoose = require("mongoose");
const {isEmail} = require("validator");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a name"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Please enter an email address"],
    unique: true,
    validate:[isEmail,"Invalid email address"]
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    required: true,
  },
  timelogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Timelog",
    },
  ],
},
{
  timestamps:true
}
);

module.exports = mongoose.model("User",userSchema);
