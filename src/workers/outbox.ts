import { getClient } from "../config/db";

const BATCH_SIZE = 10;
const POLLING_INTERVAL_MS = 5000;

async function processOutboxBatch() {
  const client = await getClient();

  try {
    const lockQuery = `
    UPDATE outbox_events 
    SET status = 'PROCESSING' 
    WHERE id IN (
        SELECT id FROM outbox_events 
        WHERE status = 'PENDING' 
        ORDER BY created_at ASC 
        LIMIT ${BATCH_SIZE} 
        FOR UPDATE SKIP LOCKED
    ) 
    RETURNING *`;
    const { rows: lockedEvents } = await client.query(lockQuery);

    if (lockedEvents.length === 0) {
      return;
    }

    console.log(
      `[Worker] Grabbed ${lockedEvents.length} events for processing.`,
    );

    for (const event of lockedEvents) {
      try {
        console.log(
          `[Worker] Emitting Event ID ${event.id}:`,
          event.event_data,
        );
        await client.query(
          "UPDATE outbox_events SET status = 'PROCESSED' WHERE id = $1",
          [event.id],
        );
      } catch (err) {
        console.error(`[Worker] Failed to process event ${event.id}:`, err);
        await client.query(
          "UPDATE outbox_events SET status = 'FAILED' WHERE id = $1",
          [event.id],
        );
      }
    }
  } catch (error) {
    console.error("[Worker] Critical Error in batch processing:", error);
  } finally {
    client.release();
  }
}

export function startOutboxWorker() {
  console.log(
    `Outbox Polling Worker started. Polling every ${POLLING_INTERVAL_MS}ms...`,
  );
  setInterval(processOutboxBatch, POLLING_INTERVAL_MS);
}
