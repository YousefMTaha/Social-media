import cron from "node-cron";
import userModel from "../../DB/models/User.model.js";
import { htmlTemplate, sendEmail } from "./sendMail.js";

// define the cron schedule for sending the email (every day at 9 PM)
const emailAlert = cron.schedule("0 21 * * *", async () => {
  const users = await userModel.find({
    confirmEmail: false,
  });
  for (const user of users) {
    sendEmail({
      to: user.email,
      subject: "please confirm your email",
      html: htmlTemplate("CONFIRM EMAIL"),
    });
  }
});

export default emailAlert
