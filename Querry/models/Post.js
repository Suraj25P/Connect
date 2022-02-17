const mongoose = require("mongoose");
const {ObjectId} = mongoose.Schema.Types
const Schema = mongoose.Schema;


const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    postedByName: {
      type: String,
      required: true
    },
    comments:[{
      commentedByName: {
        type: String,
        required: true
      },
      comment: {
        type: String,
        required: true
      },
    }]
  },
);

module.exports = mongoose.model("Query", postSchema);
