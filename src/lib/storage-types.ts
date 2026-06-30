export type FeatureKey = "chat" | "email" | "meetings" | "tasks" | "research";

export type SavedOutput = {
  id: string;
  type: FeatureKey;
  title: string;
  content: string;
  createdAt: string;
};

export type Settings = {
  disclaimerSeen: boolean;
  lastFeature: FeatureKey;
};

export const STORAGE_KEYS = {
  settings: "aiw.settings",
  chat: "aiw.chat",
  saved: "aiw.saved",
} as const;
