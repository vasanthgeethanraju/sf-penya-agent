import "dotenv/config";

import express from "express";

import type {
  ApprovalPackage,
  ApprovalStatus,
  PublishingStatus,
} from "./approval/approvalTypes";

import {
  loadApprovalPackage,
  saveApprovalPackage,
} from "./storage/approvalStorage";

import { publishSandboxPackage } from "./sandbox/publishSandboxPackage";

const app = express();

const PORT = Number(
  process.env.PORT ?? 3000
);

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

async function updatePublishingStatus(
  approvalPackage: ApprovalPackage,
  publishingStatus: PublishingStatus
): Promise<void> {
  approvalPackage.publishingStatus =
    publishingStatus;

  await saveApprovalPackage(
    approvalPackage
  );
}

async function publishInBackground(
  approvalPackage: ApprovalPackage
): Promise<void> {
  try {
    console.log(
      `Background publishing started for: ${approvalPackage.id}`
    );

    const execution =
      await publishSandboxPackage(
        approvalPackage
      );

    const channelStatuses =
      Object.values(
        execution.channels
      ).map(
        (channel) => channel.status
      );

    const allSucceeded =
      channelStatuses.every(
        (status) => status === "success"
      );

    const allFailed =
      channelStatuses.every(
        (status) => status === "failed"
      );

    if (allSucceeded) {
      await updatePublishingStatus(
        approvalPackage,
        "published"
      );

      console.log(
        `Publishing completed successfully: ${approvalPackage.id}`
      );

      return;
    }

    if (allFailed) {
      await updatePublishingStatus(
        approvalPackage,
        "failed"
      );

      console.error(
        `All publishing channels failed: ${approvalPackage.id}`
      );

      return;
    }

    await updatePublishingStatus(
      approvalPackage,
      "partially_failed"
    );

    console.warn(
      `Publishing partially failed: ${approvalPackage.id}`
    );
  } catch (error) {
    console.error(
      "Background publishing failed:",
      error
    );

    try {
      await updatePublishingStatus(
        approvalPackage,
        "failed"
      );
    } catch (statusError) {
      console.error(
        "Could not update publishing status:",
        statusError
      );
    }
  }
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

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

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

// Simple health/home page
app.get("/", (_req, res) => {
  res.send(
    renderPage(
      "SF Penya Agent",
      "Approval server is running."
    )
  );
});

// Approve
app.get(
  "/approve/:id",
  async (req, res) => {
    try {
      const approvalPackage =
        await updateApprovalStatus(
          req.params.id,
          "approved"
        );

      await updatePublishingStatus(
        approvalPackage,
        "publishing"
      );

      // Do NOT await this.
      // The approver gets the response immediately.
      void publishInBackground(
        approvalPackage
      );

      res.send(
        renderPage(
          "Approved",
          `
            Barça vs ${approvalPackage.match.opponent}
            has been approved.

            <br><br>

            Publishing is now in progress.
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
  }
);

// Reject
app.get(
  "/reject/:id",
  async (req, res) => {
    try {
      const approvalPackage =
        await updateApprovalStatus(
          req.params.id,
          "rejected"
        );

      res.send(
        renderPage(
          "Rejected",
          `
            Barça vs ${approvalPackage.match.opponent}
            has been rejected.
          `
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
  }
);

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Approval server running on port ${PORT}`
    );
  }
);