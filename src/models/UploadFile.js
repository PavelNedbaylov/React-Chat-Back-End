import mongoose, { Schema } from "mongoose";

const UploadFileSchema = new Schema(
  {
    filename: String,
    size: Number,
    ext: String,
    url: String,
    message: { type: Schema.Types.ObjectId, ref: "Message", require: true },
    user: { type: Schema.Types.ObjectId, ref: "User", require: true }
  },
  {
    timestamps: true
  }
);

const UploadFileModel = mongoose.model(
  "UploadFile",
  UploadFileSchema
);

export default UploadFileModel;