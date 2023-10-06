import multer from "multer";

// specify extension of files to avoid any miswrite
export const fileValidation = {
  image: ["image/jpeg", "image/png", "image/gif"],
  video: ["video/mp4"],
};

export function fileUpload(customValidation = []) {
  const storage = multer.diskStorage({});

  // filter any extension doesn't included in fileValidation array
  function fileFilter(req, file, cb) {
    if (customValidation.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("In-valid file format"), false);
    }
  }
  const upload = multer({ fileFilter, storage });
  return upload;
}
