import { PageLoadingSkeleton } from "@/components/app/page-loading-skeleton";

export default function ReportsLoading() {
  return <PageLoadingSkeleton stats={4} rows={4} />;
}
