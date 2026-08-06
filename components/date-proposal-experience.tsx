"use client";

import Script from "next/script";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants
} from "framer-motion";
import {
  CalendarHeart,
  Check,
  Clock3,
  Heart,
  Mail,
  MapPin,
  Music,
  Music2,
  Sparkles
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { saveAnswer } from "@/app/actions";

type Screen = "intro" | "proposal" | "celebration" | "planner";

type PlannerState = {
  activity: string;
  date: string;
  time: string;
  location: string;
  note: string;
};

type BurstParticle = {
  id: number;
  kind: "sparkle" | "heart";
  x: number;
  y: number;
  color: string;
  size: number;
  dx: number;
  dy: number;
};

type FloatingMessage = {
  id: number;
  text: string;
  x: number;
  y: number;
};

type NoButtonPose = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
};

const introQuotes = [
  "Before I ask you anything, I just want you to know how much you mean to me.",
  "You turned my ordinary days into my favorite days, without even trying, babe.",
  "I could list a hundred reasons I fell for you, but honestly, it was everything, all at once.",
  "You are still my favorite person to tease, to laugh with, and to completely adore.",
  "I really, truly love you, babe — more than words could ever really say.",
  "You're the last thing I think about before I fall asleep, and the first smile of my morning.",
  "I don't know how I got this lucky, but I promise I will never take it for granted.",
  "Okay, enough sweet talk... time for the important question. 😏"
];

const noLabels = ["No", "Nope 😜", "Too Slow 😂", "Catch Me!", "Almost!", "Try Again ❤️"];
const attemptMessages = ["Nice try!", "You almost got me!", "So close!", "Quick, but not quick enough!", "The yes button looks cozy.", "A heroic attempt!"];
const activities = ["Candlelit dinner", "Cafe and bookstore", "Sunset walk", "Movie night", "Museum date", "Surprise me"];
const youtubeSongId = "tWkUTPj1BT8";

const ambientHearts = Array.from({ length: 30 }, (_, index) => {
  const wave = Math.sin(index * 12.9898) * 43758.5453;
  const normalized = wave - Math.floor(wave);

  return {
    id: index,
    left: `${(index * 31 + 9) % 100}%`,
    delay: Number(((index % 10) * 0.58).toFixed(2)),
    duration: Number((7.5 + (index % 8) * 1.05).toFixed(2)),
    size: Number((13 + normalized * 22).toFixed(2))
  };
});

const pageVariants: Variants = {
  enter: { opacity: 0, y: 24, scale: 0.985, filter: "blur(10px)" },
  center: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, y: -20, scale: 0.985, filter: "blur(8px)" }
};

export function DateProposalExperience() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [isMuted, setIsMuted] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [planner, setPlanner] = useState<PlannerState>({
    activity: activities[0],
    date: "",
    time: "",
    location: "",
    note: ""
  });
  const music = useYouTubeMusic(!isMuted);
  const boing = useBoingSynth(!isMuted);

  const handleYes = useCallback(() => {
    setIsMuted(false);
    music.start();
    music.swell();
    setCelebrating(true);
    setScreen("celebration");
  }, [music]);

  const handlePlannerChange = useCallback(
    (key: keyof PlannerState, value: string) => setPlanner((current) => ({ ...current, [key]: value })),
    []
  );

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
      <Script src="https://www.youtube.com/iframe_api" strategy="afterInteractive" />
      <div id="youtube-music-player" className="pointer-events-none fixed bottom-0 left-0 size-px opacity-0" aria-hidden="true" />
      <BackgroundScene celebrating={celebrating} />
      <FloatingHeartCursor />
      <MusicToggle
        isMuted={isMuted}
        onToggle={() => {
          const next = !isMuted;
          setIsMuted(next);
          if (!next) {
            music.start();
          }
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-6xl items-center justify-center">
        <AnimatePresence mode="wait">
          {screen === "intro" && (
            <IntroScreen key="intro" onDone={() => setScreen("proposal")} />
          )}
          {screen === "proposal" && (
            <ProposalScreen key="proposal" onYes={handleYes} onBoing={boing} />
          )}
          {screen === "celebration" && (
            <CelebrationScreen key="celebration" onPlan={() => setScreen("planner")} />
          )}
          {screen === "planner" && (
            <PlannerScreen key="planner" planner={planner} onChange={handlePlannerChange} onBack={() => setScreen("proposal")} />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function ScreenShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      variants={pageVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-panel relative w-full rounded-[2rem] p-5 sm:p-8 lg:p-10 ${className}`}
    >
      {children}
    </motion.section>
  );
}

function IntroScreen({ onDone }: { onDone: () => void }) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const isLast = index === introQuotes.length - 1;

  const handleNext = () => {
    if (isLast) {
      onDone();
    } else {
      setIndex((current) => current + 1);
    }
  };

  return (
    <ScreenShell className="max-w-3xl text-center">
      <button
        type="button"
        onClick={onDone}
        className="absolute right-6 top-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#9f7088] transition hover:text-[#7a3150]"
      >
        Skip ahead
      </button>

      <motion.div
        animate={reducedMotion ? undefined : { y: [0, -10, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="mx-auto mb-7 grid size-20 place-items-center rounded-full bg-white/75 text-rose-500 shadow-2xl shadow-rose-200/60"
      >
        <Heart className="size-10 fill-current" aria-hidden="true" />
      </motion.div>

      <div className="mx-auto flex min-h-32 max-w-2xl items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="romantic-text text-balance text-3xl font-semibold leading-snug text-[#451529] sm:text-4xl"
          >
            {introQuotes[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2" aria-hidden="true">
        {introQuotes.map((quote, dotIndex) => (
          <span
            key={quote}
            className={`h-2 rounded-full transition-all ${
              dotIndex === index ? "w-6 bg-rose-500" : "w-2 bg-rose-200"
            }`}
          />
        ))}
      </div>

      <PrimaryButton className="mx-auto mt-9" onClick={handleNext}>
        {isLast ? "Ask Me Already" : "Next"}
        <Heart className="size-4" aria-hidden="true" />
      </PrimaryButton>
    </ScreenShell>
  );
}

function ProposalScreen({ onYes, onBoing }: { onYes: () => void; onBoing: () => void }) {
  const reducedMotion = useReducedMotion();
  const yesRef = useRef<HTMLButtonElement | null>(null);
  const noRef = useRef<HTMLButtonElement | null>(null);
  const cooldownRef = useRef(0);
  const [attempts, setAttempts] = useState(0);
  const [particles, setParticles] = useState<BurstParticle[]>([]);
  const [messages, setMessages] = useState<FloatingMessage[]>([]);
  const [noPose, setNoPose] = useState<NoButtonPose>({ x: 0, y: 0, rotate: -3, scale: 1 });
  const [ready, setReady] = useState(false);

  const yesScale = 1 + Math.min(attempts * 0.045, 0.42);
  const speed = Math.max(0.18, 0.48 - attempts * 0.025);
  const label = noLabels[attempts % noLabels.length];

  const safePose = useCallback((avoidX?: number, avoidY?: number) => {
    const buttonWidth = noRef.current?.offsetWidth ?? 154;
    const buttonHeight = noRef.current?.offsetHeight ?? 58;
    const edgeBuffer = Math.min(92, Math.max(28, window.innerWidth * 0.08));
    const topBuffer = 72;
    const maxX = Math.max(edgeBuffer, window.innerWidth - buttonWidth - edgeBuffer);
    const maxY = Math.max(topBuffer, window.innerHeight - buttonHeight - edgeBuffer);

    for (let i = 0; i < 18; i += 1) {
      const x = edgeBuffer + Math.random() * Math.max(1, maxX - edgeBuffer);
      const y = topBuffer + Math.random() * Math.max(1, maxY - topBuffer);
      const distance = avoidX && avoidY ? Math.hypot(x + buttonWidth / 2 - avoidX, y + buttonHeight / 2 - avoidY) : 999;

      if (distance > 170) {
        return {
          x,
          y,
          rotate: -20 + Math.random() * 40,
          scale: 1.04 + Math.random() * 0.22
        };
      }
    }

    return {
      x: edgeBuffer + Math.random() * Math.max(1, maxX - edgeBuffer),
      y: topBuffer + Math.random() * Math.max(1, maxY - topBuffer),
      rotate: -18 + Math.random() * 36,
      scale: 1.08
    };
  }, []);

  const emitParticles = useCallback((kind: BurstParticle["kind"], x: number, y: number, amount: number) => {
    const colors = kind === "heart" ? ["#fb7185", "#ec4899", "#f472b6"] : ["#facc15", "#f9a8d4", "#c084fc", "#ffffff"];
    const created = Array.from({ length: amount }, (_, index) => {
      const angle = (Math.PI * 2 * index) / amount + Math.random() * 0.45;
      const distance = 24 + Math.random() * 58;

      return {
        id: performance.now() + index + Math.random(),
        kind,
        x,
        y,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: kind === "heart" ? 17 + Math.random() * 12 : 11 + Math.random() * 10,
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance - 18
      };
    });

    setParticles((current) => [...current.slice(-52), ...created]);
    window.setTimeout(() => {
      setParticles((current) => current.filter((particle) => !created.some((newParticle) => newParticle.id === particle.id)));
    }, 1100);
  }, []);

  const emitMessage = useCallback((x: number, y: number) => {
    const id = performance.now() + Math.random();
    const text = attemptMessages[Math.floor(Math.random() * attemptMessages.length)];
    setMessages((current) => [...current.slice(-3), { id, text, x, y }]);
    window.setTimeout(() => setMessages((current) => current.filter((message) => message.id !== id)), 1300);
  }, []);

  const escapeNo = useCallback(
    (pointerX?: number, pointerY?: number) => {
      const now = performance.now();
      if (now - cooldownRef.current < 95) return;
      cooldownRef.current = now;

      const noRect = noRef.current?.getBoundingClientRect();
      const yesRect = yesRef.current?.getBoundingClientRect();
      const originX = noRect ? noRect.left + noRect.width / 2 : pointerX ?? window.innerWidth / 2;
      const originY = noRect ? noRect.top + noRect.height / 2 : pointerY ?? window.innerHeight / 2;

      setAttempts((value) => value + 1);
      setNoPose(safePose(pointerX, pointerY));
      onBoing();
      emitParticles("sparkle", originX, originY, 12);
      emitMessage(originX, originY - 28);

      if (yesRect) {
        emitParticles("heart", yesRect.left + yesRect.width / 2, yesRect.top + yesRect.height / 2, 9);
      }
    },
    [emitMessage, emitParticles, onBoing, safePose]
  );

  useEffect(() => {
    const placeInitialButton = () => {
      const buttonWidth = noRef.current?.offsetWidth ?? 154;
      const buttonHeight = noRef.current?.offsetHeight ?? 58;
      const rightBuffer = Math.min(56, window.innerWidth * 0.1);
      setNoPose({
        x: Math.min(window.innerWidth - buttonWidth - rightBuffer, window.innerWidth / 2 + 42),
        y: Math.min(window.innerHeight - buttonHeight - 42, window.innerHeight / 2 + 120),
        rotate: -3,
        scale: 1
      });
      setReady(true);
    };

    placeInitialButton();
    window.addEventListener("resize", placeInitialButton);
    return () => window.removeEventListener("resize", placeInitialButton);
  }, []);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const rect = noRef.current?.getBoundingClientRect();
      if (!rect) return;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      if (Math.hypot(event.clientX - centerX, event.clientY - centerY) < 120) {
        escapeNo(event.clientX, event.clientY);
      }
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [escapeNo]);

  return (
    <ScreenShell className="max-w-5xl text-center">
      <FloatingEffects particles={particles} messages={messages} />

      <motion.div
        animate={reducedMotion ? undefined : { y: [0, -10, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="mx-auto mb-7 grid size-24 place-items-center rounded-full bg-white/75 text-rose-500 shadow-2xl shadow-rose-200/60"
      >
        <Heart className="size-12 fill-current" aria-hidden="true" />
      </motion.div>
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-rose-500">A little love note for my babe</p>
      <h1 className="romantic-text mx-auto max-w-4xl text-balance text-5xl font-bold leading-none text-[#451529] sm:text-7xl lg:text-8xl">
        Will you be my date, babe? ❤️
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#71425a] sm:text-lg">
        You are already my girlfriend, my best friend, and my favorite hello — but I still want to ask, every single
        time, like it is the very first time. You make ordinary days feel like something worth dressing up for.
      </p>
      <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[#71425a] sm:text-lg">
        So say yes, my love, and let&apos;s go make one more memory to add to all the ones I already keep close.</p>

      <div className="relative mx-auto mt-10 flex min-h-36 max-w-xl items-center justify-center">
        <motion.button
          ref={yesRef}
          type="button"
          onClick={onYes}
          animate={{ scale: yesScale }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: Math.max(0.96, yesScale - 0.05) }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
          className="inline-flex min-h-16 min-w-40 items-center justify-center gap-2 rounded-full bg-[#ec4899] px-8 py-4 text-lg font-black tracking-wide text-white shadow-2xl shadow-pink-300/70 ring-1 ring-white/50 transition hover:bg-[#db2777]"
        >
          ❤️ YES, ALWAYS
        </motion.button>
      </div>

      <motion.button
        ref={noRef}
        type="button"
        onPointerDown={(event) => escapeNo(event.clientX, event.clientY)}
        onFocus={() => escapeNo()}
        animate={{ x: noPose.x, y: noPose.y, rotate: noPose.rotate, scale: noPose.scale }}
        transition={{ duration: speed, type: "spring", stiffness: 420 + attempts * 42, damping: 18 }}
        className="fixed left-0 top-0 z-40 inline-flex min-h-14 min-w-36 items-center justify-center rounded-full border border-white/80 bg-white/75 px-7 py-4 font-black text-[#7a3150] opacity-0 shadow-xl shadow-violet-200/45 backdrop-blur transition hover:bg-white data-[ready=true]:opacity-100"
        data-ready={ready}
        aria-label="No, evasive button"
      >
        💔 {label}
      </motion.button>

      <p className="mt-2 text-sm text-[#80536a]">
        Fair warning, babe: the no button is a little shy and runs from your cursor. The yes button has been waiting
        for you all day.
      </p>
    </ScreenShell>
  );
}

function CelebrationScreen({ onPlan }: { onPlan: () => void }) {
  return (
    <ScreenShell className="max-w-4xl text-center">
      <CelebrationCanvas active />
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 130, damping: 12 }}
        className="mx-auto mb-8 grid size-28 place-items-center rounded-full bg-white/75 text-rose-500 shadow-2xl shadow-rose-200/70"
      >
        <Sparkles className="size-14" aria-hidden="true" />
      </motion.div>
      <h2 className="romantic-text text-balance text-5xl font-bold leading-none text-[#451529] sm:text-7xl">
        Yay! I love you so much, babe! ❤️
      </h2>
      <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#71425a]">
        The music swelled, the sky sparkled, and my heart did that little happy thing it only ever does for you.
      </p>
      <p className="mx-auto mt-3 max-w-2xl text-lg leading-8 text-[#71425a]">
        Thank you for choosing me, again and again. Now let&apos;s plan something we will be smiling about for days.
      </p>
      <PrimaryButton className="mx-auto mt-9" onClick={onPlan}>
        Plan Our Date
        <CalendarHeart className="size-5" aria-hidden="true" />
      </PrimaryButton>
    </ScreenShell>
  );
}

function PlannerScreen({
  planner,
  onChange,
  onBack
}: {
  planner: PlannerState;
  onChange: (key: keyof PlannerState, value: string) => void;
  onBack: () => void;
}) {
  const complete = Boolean(planner.activity && planner.date && planner.time && planner.location);
  const [isSaving, startSaving] = useTransition();

  const handleSave = () => {
    if (!complete || isSaving) return;
    startSaving(async () => {
      await saveAnswer({
        activity: planner.activity,
        date: planner.date,
        time: planner.time,
        location: planner.location,
        note: planner.note
      });
    });
  };

  return (
    <ScreenShell className="max-w-5xl">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.24em] text-rose-500">Just for us</p>
          <h2 className="romantic-text text-4xl font-bold text-[#4a1830] sm:text-6xl">
            Let&apos;s plan our next little adventure, babe.
          </h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-[#71425a]">
            Pick whatever sounds like us — I am happy anywhere, as long as I am there with you.
          </p>
          <div className="mt-8 grid gap-5">
            <label className="grid gap-2 text-sm font-semibold text-[#66324a]">
              Activity
              <select
                value={planner.activity}
                onChange={(event) => onChange("activity", event.target.value)}
                className="h-14 rounded-2xl border border-white/80 bg-white/70 px-4 text-base font-medium shadow-lg shadow-pink-200/25 backdrop-blur"
              >
                {activities.map((activity) => (
                  <option key={activity}>{activity}</option>
                ))}
              </select>
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-[#66324a]">
                Date
                <input
                  type="date"
                  value={planner.date}
                  onChange={(event) => onChange("date", event.target.value)}
                  className="date-input h-14 rounded-2xl border border-white/80 bg-white/70 px-4 text-base font-medium shadow-lg shadow-pink-200/25 backdrop-blur"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-[#66324a]">
                Time
                <input
                  type="time"
                  value={planner.time}
                  onChange={(event) => onChange("time", event.target.value)}
                  className="date-input h-14 rounded-2xl border border-white/80 bg-white/70 px-4 text-base font-medium shadow-lg shadow-pink-200/25 backdrop-blur"
                />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-semibold text-[#66324a]">
              Location
              <input
                type="text"
                value={planner.location}
                onChange={(event) => onChange("location", event.target.value)}
                placeholder="That cute place we talked about"
                className="h-14 rounded-2xl border border-white/80 bg-white/70 px-4 text-base font-medium shadow-lg shadow-pink-200/25 backdrop-blur placeholder:text-[#9f7088]"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#66324a]">
              A little note for him (optional)
              <textarea
                value={planner.note}
                onChange={(event) => onChange("note", event.target.value)}
                placeholder="Tell him what you're feeling, babe 💌"
                rows={3}
                maxLength={800}
                className="resize-none rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-base font-medium leading-6 shadow-lg shadow-pink-200/25 backdrop-blur placeholder:text-[#9f7088]"
              />
            </label>
          </div>
        </div>
        <aside className="rounded-[1.6rem] border border-white/70 bg-white/62 p-6 shadow-2xl shadow-violet-200/35">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-full bg-rose-100 text-rose-500">
              <Check className="size-6" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold text-[#4a1830]">Confirmation</h3>
          </div>
          <div className="space-y-4 text-[#633048]">
            <ConfirmationRow icon={<Sparkles className="size-5" />} label="Activity" value={planner.activity} />
            <ConfirmationRow icon={<CalendarHeart className="size-5" />} label="Date" value={planner.date || "Pick a date"} />
            <ConfirmationRow icon={<Clock3 className="size-5" />} label="Time" value={planner.time || "Pick a time"} />
            <ConfirmationRow icon={<MapPin className="size-5" />} label="Location" value={planner.location || "Add a place"} />
          </div>
          <motion.div
            animate={complete ? { opacity: 1, y: 0 } : { opacity: 0.6, y: 4 }}
            className="mt-7 rounded-2xl bg-gradient-to-r from-rose-500 to-violet-500 p-4 text-white shadow-xl shadow-rose-300/35"
          >
            {complete
              ? "It's a date, my love. I am already smiling and counting down."
              : "The card will glow the moment every little detail is set."}
          </motion.div>
          <PrimaryButton className="mt-5 w-full" onClick={handleSave} disabled={!complete || isSaving}>
            {isSaving ? "Saving our plan..." : "Seal It With a Kiss"}
            <Mail className="size-5" aria-hidden="true" />
          </PrimaryButton>
          <p className="mt-3 text-center text-xs text-[#98657c]">
            This tucks your answer away on a page just for us, so I can keep it forever.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[#7a3150] transition hover:bg-white/60"
          >
            Back to question
          </button>
        </aside>
      </div>
    </ScreenShell>
  );
}

function ConfirmationRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/56 p-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-500">{icon}</span>
      <span>
        <span className="block text-xs font-bold uppercase tracking-[0.16em] text-[#98657c]">{label}</span>
        <span className="block font-semibold">{value}</span>
      </span>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  className = "",
  disabled = false
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2, scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#4a1830] px-7 py-4 font-bold text-white shadow-2xl shadow-rose-300/40 transition hover:bg-[#6f2149] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:bg-[#4a1830] ${className}`}
    >
      {children}
    </motion.button>
  );
}

function FloatingEffects({ particles, messages }: { particles: BurstParticle[]; messages: FloatingMessage[] }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-50">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            initial={{ opacity: 0, scale: 0.4, x: particle.x, y: particle.y, rotate: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: particle.kind === "heart" ? [0.5, 1.15, 0.85] : [0.5, 1.35, 0],
              x: particle.x + particle.dx,
              y: particle.y + particle.dy,
              rotate: particle.kind === "heart" ? 18 : 140
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.05, ease: "easeOut" }}
            className="absolute -translate-x-1/2 -translate-y-1/2 font-black"
            style={{ color: particle.color, fontSize: particle.size }}
          >
            {particle.kind === "heart" ? "♥" : "✦"}
          </motion.span>
        ))}
        {messages.map((message) => (
          <motion.span
            key={message.id}
            initial={{ opacity: 0, y: message.y, x: message.x, scale: 0.85 }}
            animate={{ opacity: [0, 1, 0], y: message.y - 72, x: message.x + 18, scale: [0.85, 1, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.25, ease: "easeOut" }}
            className="absolute rounded-full border border-white/80 bg-white/75 px-4 py-2 text-sm font-black text-[#8b2f55] shadow-xl shadow-pink-200/40 backdrop-blur"
          >
            {message.text}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

function BackgroundScene({ celebrating }: { celebrating: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.72, 0.92, 0.72] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[-8rem] top-[-8rem] size-[24rem] rounded-full bg-rose-300/30 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1.05, 1, 1.05], x: [0, -18, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-7rem] top-10 size-[26rem] rounded-full bg-violet-300/30 blur-3xl"
      />
      <motion.div
        animate={{ opacity: [0.34, 0.58, 0.34], rotate: [0, 4, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-12rem] left-[25%] size-[28rem] rounded-full bg-pink-200/35 blur-3xl"
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.34)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.25)_1px,transparent_1px)] bg-[size:54px_54px] opacity-35" />
      {ambientHearts.map((heart) => (
        <motion.span
          key={heart.id}
          initial={{ y: "110vh", opacity: 0, rotate: -14 }}
          animate={{ y: "-16vh", opacity: [0, 0.55, 0], rotate: celebrating ? 45 : 18 }}
          transition={{ delay: heart.delay, duration: celebrating ? heart.duration * 0.58 : heart.duration, repeat: Infinity, ease: "linear" }}
          className="absolute text-rose-400/45"
          style={{ left: heart.left, fontSize: heart.size }}
        >
          ♥
        </motion.span>
      ))}
    </div>
  );
}

function FloatingHeartCursor() {
  const [particles, setParticles] = useState<BurstParticle[]>([]);
  const last = useRef(0);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const now = performance.now();
      if (now - last.current < 55) return;
      last.current = now;
      const id = now;
      setParticles((current) => [
        ...current.slice(-16),
        {
          id,
          kind: "heart",
          x: event.clientX,
          y: event.clientY,
          color: ["#fb7185", "#ec4899", "#a855f7"][Math.floor(Math.random() * 3)],
          size: 10 + Math.random() * 8,
          dx: -18 + Math.random() * 36,
          dy: -34 - Math.random() * 18
        }
      ]);
      window.setTimeout(() => setParticles((current) => current.filter((particle) => particle.id !== id)), 1300);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return <FloatingEffects particles={particles} messages={[]} />;
}

function CelebrationCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let frame = 0;
    let raf = 0;
    const fireworks: Array<{ x: number; y: number; vx: number; vy: number; color: string; life: number; size: number }> = [];
    const confetti = Array.from({ length: 170 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -Math.random() * window.innerHeight,
      vx: -0.8 + Math.random() * 1.6,
      vy: 1.8 + Math.random() * 3.1,
      spin: Math.random() * Math.PI,
      color: ["#fb7185", "#f9a8d4", "#c084fc", "#facc15", "#ffffff"][Math.floor(Math.random() * 5)],
      size: 5 + Math.random() * 8
    }));

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    const burst = (x: number, y: number) => {
      const colors = ["#fb7185", "#f9a8d4", "#c084fc", "#ffffff", "#facc15"];
      for (let i = 0; i < 54; i += 1) {
        const angle = (Math.PI * 2 * i) / 54;
        const speed = 1.8 + Math.random() * 6.4;
        fireworks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 86 + Math.random() * 48,
          size: 2 + Math.random() * 4
        });
      }
    };

    const tick = () => {
      frame += 1;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const piece of confetti) {
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.spin += 0.08;
        if (piece.y > window.innerHeight + 20) {
          piece.y = -20;
          piece.x = Math.random() * window.innerWidth;
        }
        context.save();
        context.translate(piece.x, piece.y);
        context.rotate(piece.spin);
        context.fillStyle = piece.color;
        context.globalAlpha = 0.92;
        context.fillRect(-piece.size / 2, -piece.size / 3, piece.size, piece.size * 0.62);
        context.restore();
      }

      if (frame % 32 === 1) {
        burst(window.innerWidth * (0.16 + Math.random() * 0.68), window.innerHeight * (0.13 + Math.random() * 0.36));
      }
      for (let index = fireworks.length - 1; index >= 0; index -= 1) {
        const particle = fireworks[index];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.035;
        particle.life -= 1;
        if (particle.life <= 0) {
          fireworks.splice(index, 1);
          continue;
        }
        context.globalAlpha = Math.max(particle.life / 100, 0);
        context.fillStyle = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-40" aria-hidden="true" />;
}

function MusicToggle({ isMuted, onToggle }: { isMuted: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="fixed right-4 top-4 z-30 grid size-12 place-items-center rounded-full border border-white/75 bg-white/65 text-[#6a2443] shadow-xl shadow-rose-200/40 backdrop-blur transition hover:bg-white"
      aria-label={isMuted ? "Turn music on" : "Mute music"}
      title={isMuted ? "Turn music on" : "Mute music"}
    >
      {isMuted ? <Music className="size-5" aria-hidden="true" /> : <Music2 className="size-5" aria-hidden="true" />}
    </button>
  );
}

type YouTubePlayer = {
  playVideo: () => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (volume: number) => void;
  destroy: () => void;
};

type YouTubePlayerConstructor = new (
  elementId: string,
  config: {
    videoId: string;
    playerVars: Record<string, string | number>;
    events: {
      onReady: () => void;
    };
  }
) => YouTubePlayer;

function useYouTubeMusic(enabled: boolean) {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const enabledRef = useRef(enabled);
  const readyRef = useRef(false);
  const pendingStartRef = useRef(false);
  const volumeRef = useRef(18);
  const fadeTimerRef = useRef<number | null>(null);
  const swellTimerRef = useRef<number | null>(null);

  const clearFade = useCallback(() => {
    if (fadeTimerRef.current) {
      window.clearInterval(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  }, []);

  const fadeTo = useCallback(
    (target: number, duration = 900) => {
      clearFade();
      const player = playerRef.current;
      if (!player || !readyRef.current) return;

      const start = volumeRef.current;
      const steps = 24;
      let step = 0;
      fadeTimerRef.current = window.setInterval(() => {
        step += 1;
        const progress = Math.min(step / steps, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const nextVolume = Math.round(start + (target - start) * eased);
        volumeRef.current = nextVolume;
        player.setVolume(nextVolume);
        if (progress >= 1) {
          clearFade();
        }
      }, duration / steps);
    },
    [clearFade]
  );

  const syncMute = useCallback(() => {
    const player = playerRef.current;
    if (!player || !readyRef.current) return;

    if (enabledRef.current) {
      player.unMute();
      fadeTo(Math.max(volumeRef.current, 18), 600);
    } else {
      player.mute();
      player.setVolume(0);
    }
  }, [fadeTo]);

  const ensurePlayer = useCallback(() => {
    if (typeof window === "undefined") return;
    if (playerRef.current) return;

    const createPlayer = () => {
      if (playerRef.current || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player("youtube-music-player", {
        videoId: youtubeSongId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          iv_load_policy: 3,
          loop: 1,
          modestbranding: 1,
          playlist: youtubeSongId,
          playsinline: 1,
          rel: 0
        },
        events: {
          onReady: () => {
            readyRef.current = true;
            syncMute();
            if (pendingStartRef.current) {
              pendingStartRef.current = false;
              playerRef.current?.playVideo();
            }
          }
        }
      });
    };

    if (window.YT?.Player) {
      createPlayer();
      return;
    }

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      createPlayer();
    };
  }, [syncMute]);

  useEffect(() => {
    enabledRef.current = enabled;
    syncMute();
  }, [enabled, syncMute]);

  useEffect(() => {
    ensurePlayer();

    return () => {
      clearFade();
      if (swellTimerRef.current) {
        window.clearTimeout(swellTimerRef.current);
      }
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [clearFade, ensurePlayer]);

  const start = useCallback(() => {
    ensurePlayer();
    pendingStartRef.current = true;
    const player = playerRef.current;
    if (!player || !readyRef.current) return;

    pendingStartRef.current = false;
    if (enabledRef.current) {
      player.unMute();
      fadeTo(22, 650);
    }
    player.playVideo();
  }, [ensurePlayer, fadeTo]);

  const swell = useCallback(() => {
    start();
    fadeTo(55, 650);
    if (swellTimerRef.current) {
      window.clearTimeout(swellTimerRef.current);
    }
    swellTimerRef.current = window.setTimeout(() => fadeTo(24, 1600), 1700);
  }, [fadeTo, start]);

  return { start, swell };
}

function useBoingSynth(enabled: boolean) {
  const contextRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const enabledRef = useRef(enabled);

  const ensureAudio = useCallback(() => {
    if (typeof window === "undefined") return null;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    if (!contextRef.current) {
      const context = new AudioCtor();
      const gain = context.createGain();
      gain.gain.value = 0.0001;
      gain.connect(context.destination);
      contextRef.current = context;
      gainRef.current = gain;
    }
    void contextRef.current.resume();
    return contextRef.current;
  }, []);

  useEffect(() => {
    enabledRef.current = enabled;
    const gain = gainRef.current;
    const context = contextRef.current;
    if (!gain || !context) return;
    gain.gain.cancelScheduledValues(context.currentTime);
    gain.gain.linearRampToValueAtTime(enabled ? 0.9 : 0.0001, context.currentTime + 0.2);
  }, [enabled]);

  const boing = useCallback(() => {
    const context = ensureAudio();
    const gain = gainRef.current;
    if (!context || !gain || !enabledRef.current) return;
    const osc = context.createOscillator();
    const noteGain = context.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, context.currentTime);
    osc.frequency.exponentialRampToValueAtTime(580, context.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(180, context.currentTime + 0.18);
    noteGain.gain.setValueAtTime(0.0001, context.currentTime);
    noteGain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22);
    osc.connect(noteGain);
    noteGain.connect(gain);
    osc.start();
    osc.stop(context.currentTime + 0.24);
  }, [ensureAudio]);

  useEffect(() => {
    return () => {
      void contextRef.current?.close();
    };
  }, []);

  return boing;
}

declare global {
  interface Window {
    YT?: {
      Player: YouTubePlayerConstructor;
    };
    onYouTubeIframeAPIReady?: () => void;
    webkitAudioContext?: typeof AudioContext;
  }
}
