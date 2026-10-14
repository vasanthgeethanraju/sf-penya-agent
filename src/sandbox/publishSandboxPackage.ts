import fs from "node:fs/promises";
import path from "node:path";

import type { ApprovalPackage } from "../approval/approvalTypes";
import type {
  ChannelExecutionResult,
  SandboxExecution,
} from "./sandboxTypes";

import { publishSandboxEmail } from "./publishSandboxEmail";
import { publishSandboxInstagram } from "./publishSandboxInstagram";

function successResult(): ChannelExecutionResult {
  return {
    status: "success",
    completedAt: new Date().toISOString(),
    error: null,
  };
}

function failedResult(
  error: unknown
): ChannelExecutionResult {
  return {
    status: "failed",
    completedAt: new Date().toISOString(),
    error:
      error instanceof Error
        ? error.message
        : "Unknown error",
  };
}

export async function publishSandboxPackage(
  approvalPackage: ApprovalPackage
): Promise<SandboxExecution> {
  if (approvalPackage.status !== "approved") {
    throw new Error(
      "Only approved packages can be published."
    );
  }

  const startedAt =
    new Date().toISOString();

  let instagram: ChannelExecutionResult;
  let email: ChannelExecutionResult;
  let whatsapp: ChannelExecutionResult;

  // Instagram
  try {
    console.log(
      "Publishing sandbox Instagram post..."
    );

    if (!approvalPackage.posterPath) {
      throw new Error(
        "No poster is available for Instagram publishing."
      );
    }

    const result =
      await publishSandboxInstagram({
        posterPath: approvalPackage.posterPath,
        caption:
          approvalPackage.content.instagram,
      });

    console.log(
      `Sandbox Instagram published. Media ID: ${result.mediaId}`
    );

    instagram = successResult();
  } catch (error) {
    console.error(
      "Sandbox Instagram failed."
    );

    instagram = failedResult(error);
  }

  // Email
  try {
    console.log(
      "Publishing sandbox email..."
    );

    const result =
      await publishSandboxEmail(
        approvalPackage
      );

    console.log(
      `Sandbox email sent to: ${result.recipients.join(", ")}`
    );

    email = successResult();
  } catch (error) {
    console.error(
      "Sandbox email failed."
    );

    email = failedResult(error);
  }

  // WhatsApp
  try {
    console.log(
      "Sandbox WhatsApp publish..."
    );

    // Future real WhatsApp action goes here.

    whatsapp = successResult();
  } catch (error) {
    whatsapp = failedResult(error);
  }

  const execution: SandboxExecution = {
    approvalId: approvalPackage.id,
    mode: "sandbox",
    startedAt,
    completedAt:
      new Date().toISOString(),

    channels: {
      instagram,
      email,
      whatsapp,
    },
  };

  const sandboxDirectory = path.join(
    process.cwd(),
    "data",
    "sandbox-published"
  );

  await fs.mkdir(
    sandboxDirectory,
    {
      recursive: true,
    }
  );

  const filePath = path.join(
    sandboxDirectory,
    `${approvalPackage.id}.json`
  );

  await fs.writeFile(
    filePath,
    JSON.stringify(
      execution,
      null,
      2
    ),
    "utf-8"
  );

  console.log(
    `Sandbox execution saved: ${filePath}`
  );

  return execution;
}