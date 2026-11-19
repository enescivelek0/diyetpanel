"use client";

import { resetDemo } from "@/lib/store";

export default function ResetButton() {
  return (
    <button
      onClick={() => {
        if (confirm("Tüm demo verileri silinip örnek veriler yeniden yüklensin mi?")) resetDemo();
      }}
      className="ml-1 font-semibold text-white underline underline-offset-2"
    >
      Demoyu sıfırla
    </button>
  );
}
