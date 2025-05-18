const cloudinary = require("cloudinary").v2;

exports.uploadImageToCloudinary = async (file, folder, quality, height) => {
  try {
    const options = {
      folder: folder,
      resource_type: "auto",
      public_id: file.name,
      use_filename: true,
      unique_filename: false,
    };
    if (height) {
      options.height = height;
    }
    if (quality) {
      options.quality = quality;
    }

    options.resource_type = "auto";

    console.log("temp file path", file.tempFilePath);

    // Upload the image to Cloudinary
    return await cloudinary.uploader.upload(file.tempFilePath, options);
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
};
