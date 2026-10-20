import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type { ApprovalPackage } from "./approvalTypes";
import type { MatchInfo } from "../types";
import type { MatchDayContent } from "../schemas/matchDayContentSchema";
import type { TransitAlert } from "../tools/getTransitAlerts";

import { saveApprovalPackage } from "../storage/approvalStorage";

type CreateApprovalPackageInput = {
  match: MatchInfo;

  weather: {
    time: string;
    temperature: number;
    rainChance: number;
    condition: string;
  } | null;

  events: ApprovalPackage["events"];

  transitAlerts: TransitAlert[];

  content: MatchDayContent;

  posterPath?: string | null;
  posterUrl?: string | null;
};

export async function createApprovalPackage(
  input: CreateApprovalPackageInput
): Promise<ApprovalPackage> {
  const approvalPackage: ApprovalPackage = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),

    status: "pending",
    publishingStatus: "not_started",

    match: input.match,
    weather: input.weather,
    events: input.events,
    transitAlerts: input.transitAlerts,

    content: input.content,

    posterPath: input.posterPath ?? null,
    posterUrl: input.posterUrl ?? null,

    notes: [],
  };

  // Local copy for development/fallback
  const approvalsDirectory = path.join(
    process.cwd(),
    "data",
    "approvals"
  );

  await fs.mkdir(approvalsDirectory, {
    recursive: true,
  });

  const filePath = path.join(
    approvalsDirectory,
    `${approvalPackage.id}.json`
  );

  await fs.writeFile(
    filePath,
    JSON.stringify(approvalPackage, null, 2),
    "utf-8"
  );

  console.log(
    `Approval package saved locally: ${approvalPackage.id}`
  );

  // Cloud copy used by the hosted approval server
  await saveApprovalPackage(
    approvalPackage
  );

  console.log(
    `Approval package saved to R2: ${approvalPackage.id}`
  );

  return approvalPackage;
}