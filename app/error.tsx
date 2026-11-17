"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="py-24 text-center">
      <p className="text-lg">Kuch ghalat ho gaya.</p>
      <button onClick={reset} className="mt-4 rounded bg-rose-600 px-6 py-2 text-white">Dobara koshish karein</button>
    </div>
  );
}
