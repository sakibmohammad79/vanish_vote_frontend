"use client";
import dynamic from "next/dynamic";

// Dynamically import PollPage with SSR disabled
const PollPage = dynamic(() => import("@/Components/PollPage"), {
  ssr: false, // Prevents hydration issues
});

export default PollPage;
