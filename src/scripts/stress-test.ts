import crypto from "node:crypto";

const API_URL = "http://localhost:3000/api/transfer";
const ALICE_ID = "019f16e5-a577-735b-ab0c-1bf76017cf2f";
const BOB_ID = "019f16e6-692e-7599-9df3-f511ec6bd68e";
const TRANSFER_AMOUNT = 100;

const printTally = (testName: string, statuses: number[]) => {
  const tally = statuses.reduce(
    (acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>,
  );
  console.log(`\n📊 ${testName} Results:`, tally);
};

// --- TEST CASE A: REDIS IDEMPOTENCY ---
async function runIdempotencyTest() {
  console.log("🚀 Starting Idempotency Test (50 identical requests)...");
  const sharedKey = crypto.randomUUID();
  const requests = Array.from({ length: 50 }, (_, i) => ({
    url: API_URL,
    method: "POST",
    headers: {
      "x-idempotency-key": sharedKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      senderId: ALICE_ID,
      receiverId: BOB_ID,
      amount: TRANSFER_AMOUNT,
      note: `Test ${i + 1}`,
    }),
  }));
  const responses = await Promise.all(
    requests.map((request) =>
      fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      }),
    ),
  );
  const statuses = responses.map((response) => response.status);
  printTally("Idempotency", statuses);
}

// --- TEST CASE B: POSTGRESQL CONCURRENCY ---
async function runConcurrencyTest() {
  console.log("\n🚀 Starting Concurrency Test (10 unique requests)...");
  const requests = Array.from({ length: 10 }, (_, i) => ({
    url: API_URL,
    method: "POST",
    headers: {
      "x-idempotency-key": crypto.randomUUID(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      senderId: ALICE_ID,
      receiverId: BOB_ID,
      amount: TRANSFER_AMOUNT,
      note: `Test ${i + 1}`,
    }),
  }));
  const responses = await Promise.all(
    requests.map((request) =>
      fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      }),
    ),
  );
  const statuses = responses.map((response) => response.status);
  printTally("Concurrency", statuses);
}

async function executeSuite() {
  try {
    await runIdempotencyTest();

    await new Promise((resolve) => setTimeout(resolve, 3000));

    await runConcurrencyTest();

    console.log("\n✅ Stress Test Suite Completed.");
  } catch (error) {
    console.error("❌ Test Suite Failed:", error);
  }
}

executeSuite();
