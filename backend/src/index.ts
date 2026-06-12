import "dotenv/config";
import cors from "cors";
import express, { Request, Response } from "express";
import { pingDb, waitForDb } from "./db";

const PORT = Number(process.env.BACKEND_PORT ?? 3000);

async function main(): Promise<void> {
  try {
    await waitForDb();
  } catch (err) {
    console.error("db connection failed", err);
    process.exit(1);
  }

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", async (_req: Request, res: Response) => {
    const dbOk = await pingDb();
    if (dbOk) {
      res.status(200).json({ status: "ok", db: "connected" });
    } else {
      res.status(503).json({ status: "degraded", db: "down" });
    }
  });

  app.listen(PORT, () => {
    console.log(`mitzgo-auction backend listening on :${PORT}`);
  });
}

main().catch((err) => {
  console.error("backend failed to start", err);
  process.exit(1);
});
