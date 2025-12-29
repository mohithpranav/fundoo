import amqp from "amqplib";

let connection = null;
let channel = null;

const QUEUE_NAME = "email_notifications";

/**
 * Connect to RabbitMQ
 */
const connectRabbitMQ = async () => {
  try {
    if (!connection) {
      const rabbitMQUrl = process.env.RABBITMQ_URL || "amqp://localhost:5672";
      connection = await amqp.connect(rabbitMQUrl);

      connection.on("error", (err) => {
        console.error("RabbitMQ connection error:", err);
        connection = null;
        channel = null;
      });

      connection.on("close", () => {
        console.log("RabbitMQ connection closed");
        connection = null;
        channel = null;
      });

      console.log("✅ Connected to RabbitMQ");
    }

    if (!channel) {
      channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      console.log(`✅ Queue "${QUEUE_NAME}" ready`);
    }

    return { connection, channel };
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error.message);
    throw error;
  }
};

/**
 * Publish email notification to RabbitMQ queue
 */
const publishEmailNotification = async (emailData) => {
  try {
    await connectRabbitMQ();

    const message = {
      to: emailData.to,
      subject: emailData.subject,
      body: emailData.body,
      noteId: emailData.noteId,
      sharedBy: emailData.sharedBy,
      timestamp: new Date().toISOString(),
    };

    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    console.log("📧 Email notification queued:", emailData.to);
    return true;
  } catch (error) {
    console.error("Failed to publish email notification:", error.message);
    // Don't throw - we don't want to fail the request if RabbitMQ is down
    return false;
  }
};

//  Consume messages from email queue
const consumeEmailNotifications = async (callback) => {
  try {
    await connectRabbitMQ();

    console.log(`🔔 Listening for emails in queue: ${QUEUE_NAME}\n`);

    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (msg !== null) {
          try {
            const emailData = JSON.parse(msg.content.toString());
            await callback(emailData);
            channel.ack(msg);
            console.log(msg.content.toString());
          } catch (error) {
            console.error("Error processing email:", error);
            channel.nack(msg, false, true);
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Failed to consume emails:", error.message);
    throw error;
  }
};

//  Close RabbitMQ connection
const closeRabbitMQ = async () => {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    console.log("RabbitMQ connection closed");
  } catch (error) {
    console.error("Error closing RabbitMQ connection:", error);
  }
};

export {
  connectRabbitMQ,
  publishEmailNotification,
  consumeEmailNotifications,
  closeRabbitMQ,
};
