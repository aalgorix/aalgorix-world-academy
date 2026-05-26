export type MessageChannelKind = "batch" | "teacher";

export type MessageChannel = {
  id: string;
  kind: MessageChannelKind;
  label: string;
  subtitle: string;
  initials: string;
  teacherId: string | null;
};

export type LoungeChatMessage = {
  id: string;
  authorName: string;
  body: string;
  sentAtIso: string;
  isSelf: boolean;
};

export type StudentMessagesPayload = {
  displayName: string;
  batchCode: string;
  channels: MessageChannel[];
  threads: Record<string, LoungeChatMessage[]>;
};
