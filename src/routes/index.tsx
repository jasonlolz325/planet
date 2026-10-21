import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Hash, Plus } from "lucide-react";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import {
  createChannel,
  createSpace,
  joinSpace,
  listChannels,
  listMessages,
  listSpaces,
  sendMessage,
} from "@/lib/chat.functions";

export const Route = createFileRoute("/")({ component: Home });

type Space = { id: number; name: string; role: string };
type Channel = { id: number; name: string };
type Message = {
  id: number;
  userId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

function Home() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <main className="grid min-h-screen place-items-center text-muted">Loading…</main>;
  }
  if (!user) return <RedirectToSignIn />;
  return <Chat userId={user.id} displayName={user.displayName || user.primaryEmail || "Member"} />;
}

function Chat({ userId, displayName }: { userId: string; displayName: string }) {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [discover, setDiscover] = useState<{ id: number; name: string }[]>([]);
  const [spaceId, setSpaceId] = useState<number | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelId, setChannelId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [spaceName, setSpaceName] = useState("");
  const [channelName, setChannelName] = useState("");
  const [showDiscover, setShowDiscover] = useState(false);
  const [error, setError] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  const refreshSpaces = useCallback(async () => {
    const res = await listSpaces({ data: { displayName } });
    setSpaces(res.mine);
    setDiscover(res.discover);
    setSpaceId((cur) => cur ?? res.mine[0]?.id ?? null);
  }, [displayName]);

  useEffect(() => {
    void refreshSpaces().catch((e) => setError(String(e)));
  }, [refreshSpaces]);

  useEffect(() => {
    if (!spaceId) return;
    void listChannels({ data: { spaceId } })
      .then((rows) => {
        setChannels(rows);
        setChannelId((cur) => (rows.some((c) => c.id === cur) ? cur : rows[0]?.id ?? null));
      })
      .catch((e) => setError(String(e)));
  }, [spaceId]);

  useEffect(() => {
    if (!channelId) return;
    let alive = true;
    const pull = () => {
      void listMessages({ data: { channelId } })
        .then((rows) => {
          if (alive) setMessages(rows);
        })
        .catch(() => {});
    };
    pull();
    const t = setInterval(pull, 1500);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [channelId]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages.length, channelId]);

  const space = spaces.find((s) => s.id === spaceId);
  const channel = channels.find((c) => c.id === channelId);

  async function onSend(e: React.FormEvent) {
    e.preventDefault();
    if (!channelId || !draft.trim()) return;
    const body = draft;
    setDraft("");
    try {
      await sendMessage({ data: { channelId, body, authorName: displayName } });
      const rows = await listMessages({ data: { channelId } });
      setMessages(rows);
    } catch (err) {
      setError(String(err));
      setDraft(body);
    }
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-bg text-fg">
      <aside className="flex w-16 shrink-0 flex-col items-center gap-2 bg-rail py-3">
        {spaces.map((s) => (
          <button
            key={s.id}
            type="button"
            title={s.name}
            onClick={() => setSpaceId(s.id)}
            className={`grid h-11 w-11 place-items-center rounded-2xl text-sm font-semibold ${
              s.id === spaceId ? "bg-accent text-accent-ink" : "bg-raised text-fg"
            }`}
          >
            {s.name.slice(0, 1).toUpperCase()}
          </button>
        ))}
        <button
          type="button"
          title="New server"
          onClick={() => setShowDiscover(true)}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-raised text-accent"
        >
          <Plus size={18} />
        </button>
        <div className="mt-auto" />
      </aside>

      <aside className="hidden w-56 shrink-0 flex-col border-r border-line bg-panel md:flex">
        <header className="border-b border-line px-4 py-4 font-display text-xl">{space?.name ?? "Servers"}</header>
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {channels.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setChannelId(c.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                c.id === channelId ? "bg-raised text-fg" : "text-muted"
              }`}
            >
              <Hash size={14} />
              {c.name}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2 border-t border-line p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!spaceId || !channelName.trim()) return;
            void createChannel({ data: { spaceId, name: channelName } }).then(async () => {
              setChannelName("");
              const rows = await listChannels({ data: { spaceId } });
              setChannels(rows);
              setChannelId(rows.at(-1)?.id ?? null);
            });
          }}
        >
          <input
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="new channel"
            className="min-w-0 flex-1 rounded-lg bg-raised px-3 py-2 text-sm outline-none"
          />
        </form>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-line px-4 py-3">
          <Hash size={16} className="text-muted" />
          <span className="font-medium">{channel?.name ?? "channel"}</span>
          <div className="ml-auto flex items-center gap-2">
            <UserButton />
          </div>
          <div className="ml-auto flex gap-1 overflow-x-auto md:hidden">
            {channels.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setChannelId(c.id)}
                className={`rounded-full px-3 py-1 text-sm ${c.id === channelId ? "bg-accent text-accent-ink" : "bg-raised"}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </header>
        <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 && <p className="text-sm text-muted">No messages yet. Say hello.</p>}
          {messages.map((m) => (
            <article key={m.id} className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-raised text-sm font-semibold text-accent">
                {m.authorName.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className={`text-sm font-semibold ${m.userId === userId ? "text-accent" : ""}`}>
                    {m.authorName}
                  </span>
                  <time className="text-xs text-muted">{m.createdAt.slice(11, 16)}</time>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.body}</p>
              </div>
            </article>
          ))}
        </div>
        {error && <p className="px-4 text-xs text-accent">{error}</p>}
        <form onSubmit={onSend} className="border-t border-line p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={channel ? `Message #${channel.name}` : "Pick a channel"}
            className="w-full rounded-xl bg-raised px-4 py-3 outline-none"
          />
        </form>
      </section>

      {showDiscover && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-line bg-panel p-5">
            <h2 className="font-display text-2xl">Servers</h2>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void createSpace({ data: { name: spaceName, displayName } }).then(async (r) => {
                  setSpaceName("");
                  await refreshSpaces();
                  setSpaceId(r.id);
                  setShowDiscover(false);
                });
              }}
            >
              <input
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
                placeholder="New server name"
                className="min-w-0 flex-1 rounded-lg bg-raised px-3 py-2 outline-none"
              />
              <button type="submit" className="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-ink">
                Create
              </button>
            </form>
            <ul className="space-y-2">
              {discover.map((d) => (
                <li key={d.id} className="flex items-center justify-between rounded-lg bg-raised px-3 py-2">
                  <span>{d.name}</span>
                  <button
                    type="button"
                    className="text-sm text-accent"
                    onClick={() => {
                      void joinSpace({ data: { spaceId: d.id, displayName } }).then(async () => {
                        await refreshSpaces();
                        setSpaceId(d.id);
                        setShowDiscover(false);
                      });
                    }}
                  >
                    Join
                  </button>
                </li>
              ))}
              {discover.length === 0 && <li className="text-sm text-muted">You are in every public server.</li>}
            </ul>
            <button type="button" className="text-sm text-muted" onClick={() => setShowDiscover(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
