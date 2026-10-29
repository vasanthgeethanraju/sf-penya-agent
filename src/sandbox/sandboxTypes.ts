export type ChannelExecutionStatus =
  | "success"
  | "failed"
  | "skipped";

export type ChannelExecutionResult = {
  status: ChannelExecutionStatus;
  completedAt: string | null;
  error: string | null;
};

export type SandboxExecution = {
  approvalId: string;
  mode: "sandbox";
  startedAt: string;
  completedAt: string;

  channels: {
    instagram: ChannelExecutionResult;
    email: ChannelExecutionResult;
    // WhatsApp is on hold; only active channels participate in publishing status.
    // whatsapp: ChannelExecutionResult;
  };
};
