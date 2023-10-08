
# Social-Media RESTful API

This project is a simple REST API for a social media application built with Node.js and Express which contains 4 modules (users, posts, comments and reply comments) each module has several endpoints (there is a link for all endpoints documentation below)

## Features
- CRUD operations for users 
- CRUD operations for posts 
- CRUD operations for comments
- CRUD operations for reply comments 
- Validation (using Joi)
- Authentication (using JWT)
- Refresh token
- Send email (confirm email, forget password) (send everyday a reminder email to all users didn’t confirm their emails)
- Pagination
- Liking and unliking posts
- Soft delete for posts
- File upload (images and videos on cloudinary host)
- Error Handling
- Password hashing
- Phone encryption

## Endpoints

[Endpoints Documentation](https://documenter.getpostman.com/view/25674968/2s9YJbzN4j) (Postman)

## Run Locally

You don't have to run it locally as I deployed it on the vercel server (link in the description of the project) but if you want To run this project locally, you will need to add environment variables to your .env file which is unpublished for security reasons but you can contact me for .env file after that follow these steps

Clone the project

```bash
  git clone https://github.com/YousefMTaha/Social-media.git
```

Go to the project directory

```bash
  cd Social-media
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```


## Versions

<img alt="Static Badge" src="https://img.shields.io/badge/bcryptjs-2.4.3-blue"> <img alt="Static Badge" src="https://img.shields.io/badge/crypto--js-4.1.1-yellow">
<img alt="Static Badge" src="https://img.shields.io/badge/cloudinary-1.41.0-yellow"> <img alt="Static Badge" src="https://img.shields.io/badge/jsonwebtoken-9.0.2-blue">
<img alt="Static Badge" src="https://img.shields.io/badge/nodemailer-6.9.5-blue"> <img alt="Static Badge" src="https://img.shields.io/badge/node--cron-3.0.2-yellow">
<img alt="Static Badge" src="https://img.shields.io/badge/multer-1.4.5--lts.1-yellow"> <img alt="Static Badge" src="https://img.shields.io/badge/nanoid-5.0.1-yellow">
<img alt="Static Badge" src="https://img.shields.io/badge/dotenv-16.3.1-yellow"> <img alt="Static Badge" src="https://img.shields.io/badge/express-4.18.2-red">
<img alt="Static Badge" src="https://img.shields.io/badge/http--status--codes-2.2.0-yellow"> <img alt="Static Badge" src="https://img.shields.io/badge/joi-17.10.1-blue">
<img alt="Static Badge" src="https://img.shields.io/badge/mongoose-7.3.1-red">



## Feedback

If you have any feedback or you want .env file, please reach out to me at yousefmahmoudmahmed@outlook.com

