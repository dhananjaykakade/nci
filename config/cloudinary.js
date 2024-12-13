const cloudinary = require('cloudinary').v2;
const config = require ('./config.js')

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name:config.cloudinaryName ,
  api_key:config.cloudinaryApi ,
  api_secret:config.cloudinaryApiSecrete ,
});

const uploadImage = async (imagePath) => {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: "local_Registration/" // specify the folder in Cloudinary
    });
      // Clean up the local image file

    return result;
  } catch (error) {
    throw new Error('Image upload failed');
  }
};



const uploadQR = async (imageBuffer) => {
  try {
    const result = await new Promise((resolve, reject) => {
      const bufferStream = new require('stream').PassThrough();
      bufferStream.end(imageBuffer);

      cloudinary.uploader.upload_stream(
        { folder: 'local_Registration/', resource_type: 'auto' },
        (error, result) => {
          if (error) {
            reject(error); // Reject if there's an error
          } else {
            resolve(result); // Resolve if the upload is successful
          }
        }
      ).end(imageBuffer);
    });


    return result;

  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Failed to upload QR code image to Cloudinary');
  }
};





module.exports = { uploadImage ,cloudinary,uploadQR};
