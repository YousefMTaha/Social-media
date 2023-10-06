import { StatusCodes } from "http-status-codes";
import userModel from "../../../../DB/models/User.model.js";
import ErrorClass from "../../../utils/errorClass.js";
import { sendConfirmationCode } from "../../../utils/sendMail.js";
import bcryptjs from "bcryptjs";
import cryptojs from "crypto-js";
import jwt from "jsonwebtoken";
import cloudinary from "../../../utils/cloudinary.js";

export const signup = async (req, res, next) => {
  const { userName, email, password, phone, age } = req.body;

  // validate that the email isn't exist before
  const isEmailExist = await userModel.findOne({ email });
  if (isEmailExist) {
    return next(new ErrorClass("Email is already exist", StatusCodes.CONFLICT));
  }

  // send confirmation code to confirm email
  const code = sendConfirmationCode({ email, subject: "Confirm Email" }); // return code to store it into DB

  // add user to DB
  const user = new userModel({
    firstName: userName,
    lastName: userName, // userName will be separated into (first and last)Name in hooks
    password,
    phone, // password hashing or phone encryption will be in hooks
    email,
    age,
    code, // confirmation code
  });
  await user.save();

  return res.status(StatusCodes.ACCEPTED).json({ message: "done", user });
};

export const confirmEmail = async (req, res, next) => {
  const { code, email } = req.body;

  const checkEmail = await userModel.findOne({ email });

  // validate that the user exist in DB
  if (!checkEmail) {
    return next(
      new ErrorClass(
        "Email doesn't exist, please signup first",
        StatusCodes.NOT_FOUND
      )
    );
  }

  // verifying that the email hasn't been confirmed before
  if (checkEmail.confirmEmail) {
    return next(
      new ErrorClass(
        "Email is already confirmed before",
        StatusCodes.BAD_REQUEST
      )
    );
  }

  // verifying that the confirmation code in DB matched the code from user
  if (checkEmail.code != code) {
    return next(
      new ErrorClass("code doesn't matched", StatusCodes.BAD_REQUEST)
    );
  }

  // change the confirmEmail to true
  await userModel.updateOne({ _id: checkEmail._id }, { confirmEmail: true });

  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  // validate that the email is exist
  const checkEmailExist = await userModel.findOne({ email });
  if (!checkEmailExist) {
    return next(new ErrorClass("invalid information", StatusCodes.NOT_FOUND));
  }

  // verifying that the password matched with password of email
  if (!bcryptjs.compareSync(password, checkEmailExist.password)) {
    return next(new ErrorClass("invalid information", StatusCodes.NOT_FOUND));
  }

  // validate that the user confirm his email
  if (!checkEmailExist.confirmEmail) {
    return next(
      new ErrorClass("you must confirm your email first", StatusCodes.FORBIDDEN)
    );
  }

  // validate that the user hasn't been deleted
  if (checkEmailExist.isDeleted) {
    return next(
      new ErrorClass("this user has been deleted", StatusCodes.FORBIDDEN)
    );
  }

  // create payload to generate token
  const payload = {
    id: checkEmailExist._id,
    email,
  };

  // generate token to user
  const token = jwt.sign(payload, process.env.TOKEN_SIGNATURE, {
    expiresIn: "120s",
  });

  // generate refresh token to user
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SIGNATURE, {
    expiresIn: "90d",
  });

  return res
    .status(StatusCodes.ACCEPTED)
    .json({ message: "done", token, refreshToken });
};

export const update = async (req, res, next) => {
  const { firstName, lastName, email, phone, age } = req.body;

  if (email) {
    // verifying that the email isn't the same as old
    const oldEmail = await userModel.findOne({
      _id: req.user._id,
      email,
    });

    if (oldEmail) {
      return next(
        new ErrorClass(
          "the email address same as the old, you need to choose another one",
          StatusCodes.CONFLICT
        )
      );
    }

    // verifying that email hasn't been used before
    const isEmailExist = await userModel.findOne({
      _id: { $ne: req.user._id },
      email: email,
    });

    if (isEmailExist) {
      return next(
        new ErrorClass("email is already exist", StatusCodes.CONFLICT)
      );
    }

    // send confirmation code to confirm new email
    req.body.code = sendConfirmationCode({
      email,
      subject: "Confirmation Code",
    }); // return code to store it into DB

    req.body.confirmEmail = false;
  }

  if (phone) {
    //encryption phone
    req.body.phone = cryptojs.AES.encrypt(
      phone,
      process.env.CRYPTO_SIGNATURE
    ).toString();
  }

  // update user model
  await userModel.updateOne(
    {
      _id: req.user._id,
    },
    {
      firstName: firstName,
      lastName: lastName,
      email,
      phone: req.body.phone,
      age,
      code: req.body.code,
      confirmEmail: req.body.confirmEmail,
    }
  );

  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const getUserProfile = async (req, res, next) => {
  const { id } = req.params; // user id

  //validate that userID exist in DB
  const user = await userModel.findById(id);

  return !user?.isDeleted
    ? res.status(StatusCodes.ACCEPTED).json({ message: "done", user })
    : next(new ErrorClass("userId doesn't exist", StatusCodes.NOT_FOUND));
};

export const softDelete = async (req, res, next) => {
  await userModel.findByIdAndUpdate(req.user._id, { isDeleted: true });
  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const updatePassword = async (req, res, next) => {
  const { newPassword } = req.body;

  //verifying that the new password doesn't match the old password
  if (bcryptjs.compareSync(newPassword, req.user.password)) {
    return next(
      new ErrorClass("This is the old password", StatusCodes.CONFLICT)
    );
  }

  //add new password(hashed) to DB
  await userModel.updateOne(
    { _id: req.user._id },
    {
      password: bcryptjs.hashSync(
        newPassword,
        parseInt(process.env.SALT_ROUND)
      ),
    }
  );

  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const forgetPasswordMail = async (req, res, next) => {
  const { email } = req.body;

  // validate that the user exist in DB
  const checkEmail = await userModel.findOne({ email });
  if (!checkEmail) {
    return next(new ErrorClass("Email doesn't exist", StatusCodes.NOT_FOUND));
  }

  // send mail to user with confirmation code
  const code = sendConfirmationCode({ email, subject: "Forget Password" }); // return code to store it into DB

  //add confirmation code and expireDate to DB
  await userModel.updateOne(
    { email },
    {
      code,
      expireCodeDuration: Date.now() + 2 * 60 * 1000, //confirmation code available for only two minutes
    }
  );

  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const forgetPassword = async (req, res, next) => {
  const { code, email, newPassword } = req.body;

  // validate that the user exist in DB
  const checkEmail = await userModel.findOne({ email });
  if (!checkEmail) {
    return next(new ErrorClass("Email doesn't exist", StatusCodes.NOT_FOUND));
  }

  // verifying that the confirmation code in DB matched the code from user
  if (checkEmail.code != code) {
    return next(
      new ErrorClass("code doesn't matched", StatusCodes.BAD_REQUEST)
    );
  }

  // verifying that the confirmation code hasn't been expired yet
  if (checkEmail.expireCodeDuration < Date.now()) {
    return next(new ErrorClass("code expired", StatusCodes.BAD_REQUEST));
  }

  // update password into DB
  await userModel.updateOne(
    { email },
    {
      password: bcryptjs.hashSync(
        newPassword,
        parseInt(process.env.SALT_ROUND)
      ),
    }
  );

  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const addProfilePic = async (req, res, next) => {
  // check if user has pic before or not
  if (req.user.image) {
    await cloudinary.uploader.destroy(req.user.image.public_id, (err) => {
      if (err) console.log(err);
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
      if (err) console.log({ err });
    }
  );

  // update image in DB
  await userModel.updateOne(
    { _id: req.user._id },
    { image: { public_id, secure_url } }
  );

  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const addCoverPhoto = async (req, res, next) => {
  // define array to hold {public_id ,secure_url} for each photo
  const coverImageArr = [];

  // upload new coverPhotos on cloudinary host
  for (const image of req.files) {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      image.path,
      {
        folder: `socialMedia/user/${
          req.user.firstName + " " + req.user.lastName
        }/coverImage`,
      },
      (err) => {
        if (err) console.log({ err });
      }
    );
    coverImageArr.push({ public_id, secure_url });
  }

  // update image in DB
  await userModel.updateOne(
    { _id: req.user._id },
    { $push: { coverImages: coverImageArr } }
  );

  return res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};

export const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Refresh token not provided" });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SIGNATURE, (err, decoded) => {
    if (err) {
      return next(
        new ErrorClass("Invalid refresh token", StatusCodes.UNAUTHORIZED)
      );
    }

    const { id, email } = decoded;

    // generate a new access token
    const accessToken = jwt.sign({ id, email },process.env.TOKEN_SIGNATURE, {
      expiresIn: "120s",
    });

    // return the new access token to the user
    return res.status(200).json({ message: "done", accessToken });
  });
};
