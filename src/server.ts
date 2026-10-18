import "dotenv/config";

import express from "express";

import type {
  ApprovalPackage,
  ApprovalStatus,
} from "./approval/approvalTypes";

import {
  loadApprovalPackage,
  saveApprovalPackage,
} from "./storage/approvalStorage";

import { publishSandboxPackage } from "./sandbox/publishSandboxPackage";

const app = express();

const PORT = Number(process.env.PORT ?? 3000);

async function updateApprovalStatus(
  id: string,
  status: ApprovalStatus
): Promise<ApprovalPackage> {
  const approvalPackage =
    await loadApprovalPackage(id);

  if (!approvalPackage) {
    throw new Error(
      "Approval package not found."
    );
  }

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

app.get("/", (_req, res) => {
  res.send(
    renderPage(
      "SF Penya Agent",
      "Approval server is running."
    )
  );
});

app.get("/approve/:id", async (req, res) => {
  try {
    const approvalPackage =
      await updateApprovalStatus(
        req.params.id,
        "approved"
      );

    await publishSandboxPackage(
      approvalPackage
    );

    res.send(
      renderPage(
        "Approved",
        `
          Barça vs ${approvalPackage.match.opponent}
          has been approved.

          <br><br>

          Sandbox publishing completed successfully.
        `
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Approval server running on port ${PORT}`
  );
});