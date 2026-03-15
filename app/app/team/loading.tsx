import { PageLoadingSkeleton } from "@/components/app/page-loading-skeleton";

export default function TeamLoading() {
  return <PageLoadingSkeleton stats={3} showFilterCard={false} panels={2} rows={4} />;
}
