"use client";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="mt-6 rounded bg-gray-900 px-4 py-2 text-white print:hidden">
      Print
    </button>
  );
}
