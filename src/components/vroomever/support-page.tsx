import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Circle, Clock3, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SiteShell } from "./site-shell";
import { PageTitle } from "./marketplace-pages";
import { analyzeSupportMessage } from "@/lib/support.functions";

type Ticket = { id: string; topic: string; message: string; status: string; created_at: string; updated_at: string };
type Reply = { id: string; message_id: string; is_admin: boolean; body: string; created_at: string };

export const statusSteps = [
  { key: "open", label: "Submitted" },
  { key: "in_progress", label: "In progress" },
  { key: "resolved", label: "Resolved" },
] as const;

export function StatusTrack({ status }: { status: string }) {
  const idx = Math.max(0, statusSteps.findIndex((s) => s.key === status));
  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs" aria-label={`Status: ${statusSteps[idx]?.label}`}>
      {statusSteps.map((s, i) => (
        <li key={s.key} className={`flex items-center gap-1.5 ${i <= idx ? "font-semibold text-primary" : "text-muted-foreground"}`}>
          {i < idx || status === "resolved" ? <CheckCircle2 className="size-4" /> : i === idx ? <Clock3 className="size-4" /> : <Circle className="size-4" />}
          {s.label}
          {i < statusSteps.length - 1 && <span className="mx-1 h-px w-5 bg-border" />}
        </li>
      ))}
    </ol>
  );
}

export function SupportPage() {
  const analyze = useServerFn(analyzeSupportMessage);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("help");
  const [message, setMessage] = useState("");
  const [uid, setUid] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const loadTickets = async () => {
    const { data: t } = await supabase.from("support_messages").select("id,topic,message,status,created_at,updated_at").order("updated_at", { ascending: false });
    setTickets(t ?? []);
    const ids = (t ?? []).map((x) => x.id);
    if (ids.length) {
      const { data: r } = await supabase.from("support_replies").select("id,message_id,is_admin,body,created_at").in("message_id", ids).order("created_at");
      setReplies(r ?? []);
    } else setReplies([]);
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const u = data.session?.user;
      if (!u) return;
      setUid(u.id);
      setEmail(u.email ?? "");
      const { data: pr } = await supabase.from("profiles").select("full_name").eq("id", u.id).maybeSingle();
      setName(pr?.full_name ?? "");
      void loadTickets();
    });
  }, []);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const n = name.trim(), em = email.trim(), m = message.trim();
    if (!n || n.length > 100) return setMsg({ ok: false, text: "Enter your name (up to 100 characters)." });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em) || em.length > 255) return setMsg({ ok: false, text: "Enter a valid email so we can reply." });
    if (m.length < 5 || m.length > 2000) return setMsg({ ok: false, text: "Write a message between 5 and 2000 characters." });
    setBusy(true);
    const id = crypto.randomUUID();
    const { error } = await supabase.from("support_messages").insert({ id, name: n, email: em, topic, message: m, user_id: uid });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: "Could not send right now. Please try again." });
    setMessage("");
    setMsg({ ok: true, text: uid ? "Sent! Track its status and our replies below." : "Thanks — our support team received your message and will reply by email. Sign in next time to track replies here." });
    void analyze({ data: { id } }).then((r) => { if (!r.ok) console.warn("Support AI:", r.error); }).catch((e) => console.warn("Support AI failed", e));
    if (uid) void loadTickets();
  };

  const reply = async (ticketId: string) => {
    const body = (drafts[ticketId] ?? "").trim();
    if (!uid || !body || body.length > 2000) return;
    const { error } = await supabase.from("support_replies").insert({ message_id: ticketId, author_id: uid, is_admin: false, body });
    if (!error) { setDrafts((d) => ({ ...d, [ticketId]: "" })); void loadTickets(); }
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-5 sm:py-10">
        <PageTitle eyebrow="Help centre" title="Contact support" copy="Report a problem, a suspicious user or ask for help. Our team reads every message." />
        <form onSubmit={send} className="glass-panel grid gap-4 rounded-card p-5 sm:p-6">
          <label className="text-sm font-semibold">Name<Input className="mt-2" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} /></label>
          <label className="text-sm font-semibold">Email<Input className="mt-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} /></label>
          <label className="text-sm font-semibold">Topic<select value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3"><option value="help">I need help</option><option value="report">Report a problem or user</option><option value="account">Account or login</option><option value="payment">Packages and payments</option><option value="other">Other</option></select></label>
          <label className="text-sm font-semibold">Message<Textarea className="mt-2 min-h-36" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} /></label>
          {msg && <p className={`rounded-lg p-3 text-sm ${msg.ok ? "bg-secondary text-primary" : "bg-destructive/10 text-destructive"}`}>{msg.text}</p>}
          <Button type="submit" disabled={busy}>{busy ? "Sending…" : "Send message"}</Button>
        </form>

        {uid && (
          <section className="mt-10">
            <h2 className="font-display text-2xl font-bold">My support requests</h2>
            {!tickets.length && <p className="mt-3 text-sm text-muted-foreground">You haven't contacted support yet.</p>}
            <div className="mt-4 grid gap-4">
              {tickets.map((t) => (
                <article key={t.id} className="rounded-card border border-border bg-card p-4 shadow-card sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="outline" className="capitalize">{t.topic}</Badge>
                    <small className="text-muted-foreground">{new Date(t.created_at).toLocaleString()}</small>
                  </div>
                  <div className="mt-3"><StatusTrack status={t.status} /></div>
                  <p className="mt-3 whitespace-pre-line rounded-lg bg-muted p-3 text-sm">{t.message}</p>
                  <div className="mt-3 grid gap-2">
                    {replies.filter((r) => r.message_id === t.id).map((r) => (
                      <div key={r.id} className={`max-w-[90%] rounded-lg p-3 text-sm ${r.is_admin ? "border border-primary/30 bg-primary/10" : "ml-auto bg-secondary"}`}>
                        <strong className="block text-xs">{r.is_admin ? "VRUMEVER Support" : "You"} · {new Date(r.created_at).toLocaleString()}</strong>
                        <span className="whitespace-pre-line">{r.body}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Input value={drafts[t.id] ?? ""} onChange={(e) => setDrafts((d) => ({ ...d, [t.id]: e.target.value }))} maxLength={2000} placeholder={t.status === "resolved" ? "Reply to reopen this request" : "Write a reply"} aria-label="Reply" />
                    <Button type="button" size="icon" onClick={() => void reply(t.id)} aria-label="Send reply"><Send /></Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </SiteShell>
  );
}
