import cloudinary from "../core/cloudinary";
import { UploadFileModel } from "../models";

class UserController {
  create = (req, res) => {
    const userId = req.user._id;
    const file = req.file;

    cloudinary.v2.uploader
      .upload_stream({ resource_type: "auto" }, (error, result) => {
        if (error) {
          throw new Error(error);
        }

        const fileData = {
          filename: result.original_filename,
          size: result.bytes,
          ext: result.format,
          url: result.url,
          user: userId
        };

        const uploadFile = new UploadFileModel(fileData);

        uploadFile
          .save()
          .then((fileObj) => {
            res.json({
              status: "success",
              file: fileObj
            });
          })
          .catch((err) => {
            res.json({
              status: "error",
              message: err
            });
          });
      })
      .end(file.buffer);
  };

  delete = () => {};
}

export default UserController;