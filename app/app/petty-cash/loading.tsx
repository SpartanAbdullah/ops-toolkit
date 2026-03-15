import { PageLoadingSkeleton } from "@/components/app/page-loading-skeleton";

export default function PettyCashLoading() {
  return <PageLoadingSkeleton stats={4} showFilterCard panels={2} rows={4} />;
}
