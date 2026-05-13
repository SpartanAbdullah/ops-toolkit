import { PageLoadingSkeleton } from "@/components/app/page-loading-skeleton";

export default function TeamLoading() {
  return <PageLoadingSkeleton stats={3} rows={4} />;
}
