import { getClient } from "../config/db";
import { producer } from "../config/kafka";

const BATCH_SIZE = 10;
const POLLING_INTERVAL_MS = 5000;
let workerTimer: NodeJS.Timeout | null = null;

async function processOutboxBatch() {
  const client = await getClient();

  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `SELECT * FROM outbox_events WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT ${BATCH_SIZE} FOR UPDATE SKIP LOCKED`,
    );

    console.log(`[Worker] Grabbed ${rows.length} events for processing.`);
    for (const event of rows) {
      try {
        await producer.send({
          topic: event.topic,
          messages: [{ key: event.aggregate_id, value: JSON.stringify(event.payload) }],
          acks: -1,
        });
        await client.query(
          "UPDATE outbox_events SET status = 'PROCESSED' WHERE id = $1",
          [event.id],
        );
      } catch (err) {
        console.error("Transient error in batch processing:", err);
        break;
      }
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[Worker] Critical Error in batch processing:", error);
  } finally {
    client.release();
  }
}

export function startOutboxWorker() {
  console.log(
    `Outbox Polling Worker started. Polling every ${POLLING_INTERVAL_MS}ms...`,
  );
  workerTimer = setInterval(processOutboxBatch, POLLING_INTERVAL_MS);
}

export function stopOutboxWorker() {
  if (workerTimer) {
    clearInterval(workerTimer);
    console.log("Outbox Polling Worker stopped.");
  }
}
