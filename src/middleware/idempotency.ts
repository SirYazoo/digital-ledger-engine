import { NextFunction, Request, Response } from "express";
import redis from "../config/redis";

export const requireIdempotency = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const idempotencyKey = req.headers["x-idempotency-key"] as string;

  if (!idempotencyKey) {
    return res.status(400).json({ message: "Missing idempotency key" });
  }

  try {
    const lockAcquired = await redis.set(
      idempotencyKey,
      "IN_PROGRESS",
      "EX",
      120,
      "NX",
    );

    if (lockAcquired) {
      const originalJson = res.json;

      res.json = function (body) {
        const status = res.statusCode;
        if (status === 200 || status === 201) {
          redis
            .set(idempotencyKey, JSON.stringify(body), "EX", 86400)
            .catch(() => {});
        } else {
          redis.del(idempotencyKey).catch(() => {});
        }
        return originalJson.call(this, body);
      };
      return next();
    }

    const cachedResponse = await redis.get(idempotencyKey);

    if (cachedResponse === "IN_PROGRESS") {
      return res
        .status(409)
        .json({ message: "Idempotency key already in progress" });
    }

    if (cachedResponse) {
      return res.status(200).json(JSON.parse(cachedResponse));
    }

    return res
      .status(409)
      .json({ message: "Idempotency conflict. Please retry." });
  } catch (error) {
    console.error("Error in idempotency middleware:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default requireIdempotency;
