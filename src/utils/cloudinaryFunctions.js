/* 
 * The purpose of this functions is to upload (image(s) or video(s)) of posts easily 
 * The main reason for creating this functions is to apply the "DON'T REPEAT YOUR SELF" concept
*/ 

import cloudinary from "./cloudinary.js";

export const cloudinaryTypes = { image: "image", video: "video" }; // to avoid any misWritten

export const cloudinaryUpload = async ({ req, pathId, type = "image", deletePrevious = false, files = false}) => {
  if (type == "image") {
    await uploadImage({ req, pathId, deletePrevious, files });
  } else {
    await uploadVideo({ req, pathId, deletePrevious, files });
  }
};

export const cloudinaryRemove = async ({ req,pathId,type = "image",delete_folder = false}) => {
  if (type == "image") {
    await deleteImage({ req, pathId, delete_folder });
  } else {
    await deleteVideo({ req, pathId, delete_folder });
  }
};

const uploadImage = ({req, pathId, files = false, deletePrevious = false}) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (files) {
        // delete pervious images from cloudinary host
        if (deletePrevious) {
          await cloudinary.api.delete_resources_by_prefix(
            `socialMedia/user/${
              req.user.firstName + " " + req.user.lastName
            }/post/${pathId}/image`
          );
        }

        const imageArr = []; // array hold information about each photo (public_id,secure_url) that user send

        // upload images to cloudinary host
        for (const image of req.files.images) {
          const { public_id, secure_url } = await cloudinary.uploader.upload(
            image.path,
            {
              folder: `socialMedia/user/${
                req.user.firstName + " " + req.user.lastName
              }/post/${pathId}/image`,
            },
            (err) => {
              if (err) {
                reject(err);
              }
            }
          );

          imageArr.push({ public_id, secure_url });
        }
        req.body.images = imageArr; // pass array to request body to use it outside the scope of (if condition)
      } else {
        if (deletePrevious) {
          await cloudinary.uploader.destroy(req.user.image.public_id, (err) => {
            if (err) {
              reject(err);
            }
          });
        }

        // upload new image on cloudinary host
        const { public_id, secure_url } = await cloudinary.uploader.upload(
          req.file.path,
          {
            folder: `socialMedia/user/${
              req.user.firstName + " " + req.user.lastName
            }/img`,
          },
          (err) => {
            if (err) reject(err);
          }
        );

        req.body.image = { public_id, secure_url };
      }

      resolve();
    } catch (error) {}
  });
};

const uploadVideo = ({ req, files = false, deletePrevious = false, pathId}) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (files) {
        // delete pervious videos from cloudinary host
        if (deletePrevious) {
          await cloudinary.api.delete_resources_by_prefix(
            `socialMedia/user/${
              req.user.firstName + " " + req.user.lastName
            }/post/${pathId}/image`,
            (err) => {
              if (err) reject(err);
            }
          );
        }

        // upload video to cloudinary host
        const { public_id, secure_url } = await cloudinary.uploader.upload(
          req.files.video[0].path,
          {
            resource_type: "video",
            folder: `socialMedia/user/${
              req.user.firstName + " " + req.user.lastName
            }/post/${pathId}/video`,
          },
          (err) => {
            if (err) reject(err);
          }
        );

        req.body.video = { public_id, secure_url }; // pass object to request body to use it outside the scope of if condition
      } else {
        if (deletePrevious) {
          await cloudinary.uploader.destroy(
            req.body.video.public_id,
            { resource_type: "video" },
            (err) => {
              if (err) reject(err);
            }
          );
        }
        // upload video to cloudinary host
        const { public_id, secure_url } = await cloudinary.uploader.upload(
          req.file.path,
          {
            resource_type: "video",
            folder: `socialMedia/user/${
              req.user.firstName + " " + req.user.lastName
            }/post/${pathId}/video`,
          },
          (err) => {
            if (err) reject(err);
          }
        );
        req.body.video = { public_id, secure_url };
      }

      resolve();
    } catch (error) {}
  });
};

const deleteImage = ({ req, pathId, delete_folder = false }) => {
  return new Promise(async (resolve, reject) => {
    try {
      // delete the image folder content from cloudinary
      await cloudinary.api.delete_resources_by_prefix(
        `socialMedia/user/${
          req.user.firstName + " " + req.user.lastName
        }/post/${pathId}/image`,
        (err) => {
          if (err) reject(err);
        }
      );

      if (delete_folder) {
        // delete the folder itself (image)
        await cloudinary.api.delete_folder(
          `socialMedia/user/${
            req.user.firstName + " " + req.user.lastName
          }/post/${pathId}/image`,
          (err) => {
            if (err) reject(err);
          }
        );
      }
      resolve();
    } catch (error) {}
  });
};

const deleteVideo = ({ req, pathId, delete_folder = false }) => {
  return new Promise(async (resolve, reject) => {
    try {
      // delete the video folder content from cloudinary
      await cloudinary.api.delete_resources_by_prefix(
        `socialMedia/user/${
          req.user.firstName + " " + req.user.lastName
        }/post/${pathId}/video`,
        { resource_type: "video" },
        (err) => {
          if (err) reject(err);
        }
      );

      if (delete_folder) {
        // delete the folder itself (video)
        await cloudinary.api.delete_folder(
          `socialMedia/user/${
            req.user.firstName + " " + req.user.lastName
          }/post/${pathId}/video`,
          (err) => {
            if (err) reject(err);
          }
        );
      }

      resolve();
    } catch (error) {}
  });
};
