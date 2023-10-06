import express from "express";
import dotenv from "dotenv";
import bootstrap from "./src/index.router.js";
import emailAlert from "./src/utils/emailAlert.js";

const app = express();
//access .env file
dotenv.config();

//init Routing
bootstrap(app, express);

//send daily email at 9 pm to the users with confirm email false
emailAlert.start() 

//create server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`server is running on port ${port}`));

