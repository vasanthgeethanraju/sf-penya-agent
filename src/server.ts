import "dotenv/config";

import express from "express";
import fs from "node:fs/promises";
import path from "node:path";

import type {
  ApprovalPackage,
  ApprovalStatus,
} from "./approval/approvalTypes";

const app = express();

const PORT = 3000;

async function updateApprovalStatus(
  id: string,
  status: ApprovalStatus
) {
  const filePath = path.join(
    process.cwd(),
    "data",
    "approvals",
    `${id}.json`
  );

  const file = await fs.readFile(
    filePath,
    "utf-8"
  );

  const approvalPackage =
    JSON.parse(file) as ApprovalPackage;

  approvalPackage.status = status;

  await fs.writeFile(
    filePath,
    JSON.stringify(
      approvalPackage,
      null,
      2
    ),
    "utf-8"
  );

  return approvalPackage;
}

app.get("/approve/:id", async (req, res) => {
  try {
    const approvalPackage =
      await updateApprovalStatus(
        req.params.id,
        "approved"
      );

    res.send(`
      <h1>Approved ✅</h1>
      <p>
        Barça vs ${approvalPackage.match.opponent}
        has been approved.
      </p>
    `);
  } catch (error) {
    console.error(error);

    res.status(500).send(
      "Could not approve this match package."
    );
  }
});

app.get("/reject/:id", async (req, res) => {
  try {
    const approvalPackage =
      await updateApprovalStatus(
        req.params.id,
        "rejected"
      );

    res.send(`
      <h1>Rejected ❌</h1>
      <p>
        Barça vs ${approvalPackage.match.opponent}
        has been rejected.
      </p>
    `);
  } catch (error) {
    console.error(error);

    res.status(500).send(
      "Could not reject this match package."
    );
  }
});

app.listen(PORT, () => {
  console.log(
    `Approval server running at http://localhost:${PORT}`
  );
});