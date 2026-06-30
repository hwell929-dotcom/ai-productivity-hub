import { Toaster } from "@/components/ui/sonner";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS, type FeatureKey, type Settings } from "@/lib/storage-types";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ResponsibleAiModal } from "@/components/dashboard/ResponsibleAiModal";
import { Chatbot } from "@/components/features/Chatbot";
import { EmailGenerator } from "@/components/features/EmailGenerator";
import { MeetingNotes } from "@/components/features/MeetingNotes";
import { TaskPlanner } from "@/components/features/TaskPlanner";
import { ResearchAssistant } from "@/components/features/ResearchAssistant";
import { useState } from "react";

const DEFAULT_SETTINGS: Settings = { disclaimerSeen: false, lastFeature: "chat" };

export function Dashboard() {
  const [settings, setSettings] = useLocalStorage<Settings>(
    STORAGE_KEYS.settings,
    DEFAULT_SETTINGS,
  );
  const [active, setActive] = useState<FeatureKey>(settings.lastFeature);
  const [forceModal, setForceModal] = useState(false);

  const select = (key: FeatureKey) => {
    setActive(key);
    setSettings({ ...settings, lastFeature: key });
  };

  const acknowledge = (dontShowAgain: boolean) => {
    setSettings({ ...settings, disclaimerSeen: dontShowAgain });
    setForceModal(false);
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      <Sidebar
        active={active}
        onSelect={select}
        onOpenDisclaimer={() => setForceModal(true)}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto h-full max-w-6xl px-4 py-6 pl-14 md:px-8 md:pl-8">
          {active === "chat" && <Chatbot />}
          {active === "email" && <EmailGenerator />}
          {active === "meetings" && <MeetingNotes />}
          {active === "tasks" && <TaskPlanner />}
          {active === "research" && <ResearchAssistant />}
        </div>
      </main>

      <ResponsibleAiModal
        open={forceModal || !settings.disclaimerSeen}
        onAcknowledge={acknowledge}
      />

      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}
