import { Kafka, Producer } from "kafkajs";

const kafkaClient = new Kafka({
  clientId: "ledger-engine",
  brokers: [process.env.KAFKA_BROKER_URL || "localhost:9092"],
});

export const producer: Producer = kafkaClient.producer({
  idempotent: true,
  maxInFlightRequests: 1,
  retry: { retries: 5 },
});

export const connectProducer = async (): Promise<void> => {
  try {
    await producer.connect();
    console.log("Kafka producer connected successfully");
  } catch (error) {
    console.error("Error connecting to Kafka producer:", error);
    process.exit(1);
  }
};

export const disconnectProducer = async (): Promise<void> => {
  try {
    await producer.disconnect();
    console.log("Kafka producer disconnected successfully");
  } catch (error) {
    console.error("Error disconnecting from Kafka producer:", error);
  }
};
