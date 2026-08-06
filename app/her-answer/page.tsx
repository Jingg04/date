import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, CalendarHeart, Clock3, Heart, MapPin, Sparkles } from "lucide-react";
import { getAnswers, type StoredAnswer } from "@/app/actions";

// Always read the latest saved answer from disk instead of a build-time snapshot.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Her Sweet Answer",
  description: "A little keepsake page that saves what she answered."
};

function formatDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return "Whenever we sneak away together";
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours)) return "A time we'll decide together";
  const date = new Date();
  date.setHours(hours, minutes || 0, 0, 0);
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function formatSavedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });
}

export default async function HerAnswerPage() {
  const answers = await getAnswers();
  const latest = answers.at(-1);
  const earlier = answers.slice(0, -1).reverse();

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_12%,rgba(255,185,218,0.5),transparent_26rem),radial-gradient(circle_at_84%_8%,rgba(196,181,253,0.4),transparent_27rem),linear-gradient(135deg,#fff8fb_0%,#ffe7f1_34%,#f2eaff_68%,#ffffff_100%)]"
      />

      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-2 text-sm font-semibold text-[#7a3150] shadow-lg shadow-pink-200/30 backdrop-blur transition hover:bg-white"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to her invitation
        </Link>

        <div className="glass-panel rounded-[2rem] p-6 sm:p-10">
          <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-white/75 text-rose-500 shadow-xl shadow-rose-200/60">
            <Heart className="size-8 fill-current" aria-hidden="true" />
          </div>
          <p className="mb-2 text-center text-sm font-semibold uppercase tracking-[0.24em] text-rose-500">
            Kept safe, just for me
          </p>
          <h1 className="romantic-text text-balance text-center text-4xl font-bold leading-tight text-[#451529] sm:text-5xl">
            Here&apos;s what my babe said 💌
          </h1>

          {!latest ? (
            <p className="mx-auto mt-6 max-w-xl text-center text-lg leading-8 text-[#71425a]">
              No answer saved yet. The moment she says yes and picks our plan, it will land right here for me to keep
              forever.
            </p>
          ) : (
            <>
              <p className="mx-auto mt-4 max-w-xl text-center text-base leading-7 text-[#71425a]">
                Saved on {formatSavedAt(latest.answeredAt)} — and yes, I have already read it more times than I will
                admit.
              </p>

              <div className="mt-8 space-y-4">
                <AnswerRow icon={<Sparkles className="size-5" />} label="Activity" value={latest.activity || "A surprise, apparently"} />
                <AnswerRow icon={<CalendarHeart className="size-5" />} label="Date" value={formatDate(latest.date)} />
                <AnswerRow icon={<Clock3 className="size-5" />} label="Time" value={formatTime(latest.time)} />
                <AnswerRow icon={<MapPin className="size-5" />} label="Location" value={latest.location || "A surprise, she says"} />
              </div>

              {latest.note && (
                <div className="mt-6 rounded-2xl border border-white/70 bg-white/60 p-5 shadow-lg shadow-pink-200/25">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#98657c]">Her note to me</p>
                  <p className="romantic-text mt-2 text-xl leading-8 text-[#4a1830]">&ldquo;{latest.note}&rdquo;</p>
                </div>
              )}
            </>
          )}
        </div>

        {earlier.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#98657c]">Earlier answers</h2>
            <ul className="space-y-3">
              {earlier.map((answer, index) => (
                <EarlierAnswerRow key={`${answer.answeredAt}-${index}`} answer={answer} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}

function AnswerRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/56 p-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-500">{icon}</span>
      <span>
        <span className="block text-xs font-bold uppercase tracking-[0.16em] text-[#98657c]">{label}</span>
        <span className="block font-semibold text-[#4a1830]">{value}</span>
      </span>
    </div>
  );
}

function EarlierAnswerRow({ answer }: { answer: StoredAnswer }) {
  return (
    <li className="rounded-2xl border border-white/60 bg-white/50 p-4 text-sm text-[#633048] shadow shadow-pink-200/20">
      <span className="font-semibold text-[#4a1830]">{answer.activity || "A surprise"}</span> ·{" "}
      {formatDate(answer.date)} at {formatTime(answer.time)} · {answer.location || "TBD"}
      {answer.note && <p className="romantic-text mt-1 text-[#4a1830]">&ldquo;{answer.note}&rdquo;</p>}
    </li>
  );
}
