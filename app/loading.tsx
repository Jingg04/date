export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fff3f8] text-[#6d2942]">
      <div className="flex items-center gap-3 rounded-full border border-white/70 bg-white/60 px-5 py-3 shadow-xl shadow-pink-200/40 backdrop-blur">
        <span className="size-3 animate-pulse rounded-full bg-rose-400" />
        <span className="font-medium">Preparing something sweet...</span>
      </div>
    </main>
  );
}
