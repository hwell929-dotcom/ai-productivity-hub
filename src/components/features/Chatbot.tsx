import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/storage-types";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompts";
import { SystemPromptViewer } from "@/components/dashboard/SystemPromptViewer";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Bot, RotateCcw, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const EXAMPLES = [
  "Help me write a follow-up email after a client meeting",
  "How should I prioritize 6 tasks for tomorrow?",
  "Summarize the main idea in 2 sentences: ...",
  "What questions should I ask in a 1:1 with my manager?",
];

export function Chatbot() {
  const [stored, setStored, reset] = useLocalStorage<UIMessage[]>(STORAGE_KEYS.chat, []);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    id: "primary",
    messages: stored,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (e) => toast.error("Chat error", { description: e.message }),
  });

  // Persist whenever messages change after a stream completes
  useEffect(() => {
    if (status === "ready" || status === "error") {
      setStored(messages);
    }
  }, [messages, status, setStored]);

  // Autofocus
  useEffect(() => {
    inputRef.current?.focus();
  }, [status]);

  // Autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const submit = async () => {
    const text = input.trim();
    if (text.length < 3) return;
    setInput("");
    await sendMessage({ text });
  };

  const isLoading = status === "submitted" || status === "streaming";

  const clear = () => {
    reset();
    window.location.reload();
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-border-strong bg-surface p-2 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">AI Chat</h1>
            <p className="text-xs text-muted-foreground">
              Your default workplace assistant — ask anything.
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clear}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> New conversation
          </Button>
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-xl border border-border bg-surface p-4"
      >
        {messages.length === 0 ? (
          <EmptyState
            onExample={(t) => {
              setInput(t);
              inputRef.current?.focus();
            }}
          />
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <Message key={m.id} message={m} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                Thinking…
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                {error.message}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-3">
        <Textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Ask anything... (Shift+Enter for newline)"
          className="min-h-[60px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
          disabled={isLoading}
        />
        <div className="mt-2 flex items-center justify-between">
          <SystemPromptViewer prompt={CHAT_SYSTEM_PROMPT} />
          <Button
            onClick={submit}
            disabled={isLoading || input.trim().length < 3}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="mr-2 h-4 w-4" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

function Message({ message }: { message: UIMessage }) {
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
          isUser
            ? "border-border bg-surface-elevated text-muted-foreground"
            : "border-border-strong bg-primary/10 text-primary"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-primary/15 text-foreground"
            : "border border-border bg-surface-elevated text-foreground/95"
        }`}
      >
        <pre className="whitespace-pre-wrap font-sans">{text}</pre>
      </div>
    </div>
  );
}

function EmptyState({ onExample }: { onExample: (t: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
      <div className="rounded-2xl border border-border-strong bg-surface-elevated p-4">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">How can I help today?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Try one of these, or just type your question.
        </p>
      </div>
      <div className="grid w-full max-w-2xl gap-2 sm:grid-cols-2">
        {EXAMPLES.map((e) => (
          <button
            key={e}
            onClick={() => onExample(e)}
            className="rounded-lg border border-border bg-surface-elevated/60 p-3 text-left text-xs text-foreground/90 transition-colors hover:border-border-strong hover:bg-surface-elevated"
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}
