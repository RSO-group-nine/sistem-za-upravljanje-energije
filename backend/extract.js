const { QueueClient } = require('@azure/storage-queue');


const connectionString = "DefaultEndpointsProtocol=https;AccountName=rsoproject;AccountKey=uUz7Gad/xjFUYox/n2V85N09s3KEvyi3e/ShIOM2IEYGTZgT2gX8mFrGYCnVjWsZkiRB0wUCrMgk+AStRu3jIA==;EndpointSuffix=core.windows.net";

const queueName = "telemetry-q";

async function readMessages() {
  const queueClient = new QueueClient(connectionString, queueName);

  console.log(`Reading messages from queue "${queueName}"...`);

  // Retrieve one or more messages
  const receivedMessages = await queueClient.receiveMessages({ numberOfMessages: 5, visibilityTimeout: 5 });
  
  if (receivedMessages.receivedMessageItems.length === 0) {
    console.log("No messages found in the queue.");
    return;
  }

  for (const message of receivedMessages.receivedMessageItems) {
    // decode the message body from base64
    const messageText = Buffer.from(message.messageText, "base64").toString();
    const messageJson = JSON.parse(messageText);
    const body = JSON.stringify(messageJson.data.body);

    console.log(`Received message: ${body}, ID: ${message.messageId}`);
    
    // //Delete the message after processing
    // await queueClient.deleteMessage(message.messageId, message.popReceipt);
    // console.log(`Deleted message ID: ${message.messageId}`);
  }
}

readMessages().catch((err) => {
  console.error("Error reading messages:", err.message);
});