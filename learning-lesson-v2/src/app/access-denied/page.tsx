import type { Metadata } from "next";
import { PageUnavailable } from "@/components/page-unavailable";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AccessDeniedPage() {
  return <PageUnavailable reason="access-denied" />;
}
