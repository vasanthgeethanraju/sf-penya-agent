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

async function loadApprovalPackage(
  id: string
): Promise<ApprovalPackage> {
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

  return JSON.parse(file) as ApprovalPackage;
}

async function saveApprovalPackage(
  approvalPackage: ApprovalPackage
) {
  const filePath = path.join(
    process.cwd(),
    "data",
    "approvals",
    `${approvalPackage.id}.json`
  );

  await fs.writeFile(
    filePath,
    JSON.stringify(
      approvalPackage,
      null,
      2
    ),
    "utf-8"
  );
}

async function updateApprovalStatus(
  id: string,
  status: ApprovalStatus
) {
  const approvalPackage =
    await loadApprovalPackage(id);

  if (approvalPackage.status !== "pending") {
    throw new Error(
      `Approval package is already ${approvalPackage.status}.`
    );
  }

  approvalPackage.status = status;

  await saveApprovalPackage(
    approvalPackage
  );

  return approvalPackage;
}

function renderPage(
  title: string,
  message: string
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
      </head>

      <body
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 80px auto;
          padding: 20px;
          text-align: center;
        "
      >
        <h1>${title}</h1>

        <p
          style="
            font-size: 18px;
            line-height: 1.5;
          "
        >
          ${message}
        </p>
      </body>
    </html>
  `;
}

app.get("/approve/:id", async (req, res) => {
  try {
    const approvalPackage =
      await updateApprovalStatus(
        req.params.id,
        "approved"
      );

    res.send(
      renderPage(
        "Approved",
        `Barça vs ${approvalPackage.match.opponent} has been approved.`
      )
    );
  } catch (error) {
    console.error(error);

    res.status(400).send(
      renderPage(
        "Could not approve",
        error instanceof Error
          ? error.message
          : "Unknown error"
      )
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

    res.send(
      renderPage(
        "Rejected",
        `Barça vs ${approvalPackage.match.opponent} has been rejected.`
      )
    );
  } catch (error) {
    console.error(error);

    res.status(400).send(
      renderPage(
        "Could not reject",
        error instanceof Error
          ? error.message
          : "Unknown error"
      )
    );
  }
});

app.listen(PORT, () => {
  console.log(
    `Approval server running at http://localhost:${PORT}`
  );
});