"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LeaderboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/history");
  }, [router]);

  return (
    <div className="mx-auto max-w-4xl p-12 text-center font-mono text-sm text-[#8e8e93]">
      Redirecting to personal Mission History…
    </div>
  );
}
