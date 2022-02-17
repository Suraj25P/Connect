const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const commentSchema = new Schema(
  {
    postId: {
      type: String,
      required: true
    },
    commentedByName: {
      type: String,
      required: true
    },
    comment: {
      type: String,
      required: true
    },
  },
);

module.exports = mongoose.model("Comments", commentSchema);
