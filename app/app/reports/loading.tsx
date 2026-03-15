import { PageLoadingSkeleton } from "@/components/app/page-loading-skeleton";

export default function ReportsLoading() {
  return <PageLoadingSkeleton stats={4} showFilterCard={false} panels={3} rows={3} />;
}
