const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const accountSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
);

module.exports = mongoose.model("Account", accountSchema);