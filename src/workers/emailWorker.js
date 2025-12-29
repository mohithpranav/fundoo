import { consumeEmailNotifications } from "../utils/rabbitmq.js";
import { sendEmail } from "../service/email.service.js";
import dotenv from "dotenv";

dotenv.config();

//  Email worker - processes email notifications from RabbitMQ queue

const startEmailWorker = async () => {
  console.log("🚀 Starting Email Worker...\n");

  try {
    await consumeEmailNotifications(async (emailData) => {
      await sendEmail(emailData);
    });
  } catch (error) {
    console.error("❌ Email worker failed:", error);
    process.exit(1);
  }
};

startEmailWorker();

process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down email worker...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down email worker...");
  process.exit(0);
});
