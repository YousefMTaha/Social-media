import mongoose from "mongoose";

// establish connection with mongoDB
const connectionDB = async () => {
  return await mongoose
    .connect(process.env.DB_LOCAL)
    .then((res) => console.log(`DB Connected successfully on .........`))
    .catch((err) => console.log(` Fail to connect  DB.........${err} `));
};

export default connectionDB;
