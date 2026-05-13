import { PageLoadingSkeleton } from "@/components/app/page-loading-skeleton";

export default function OvertimeLoading() {
  return <PageLoadingSkeleton stats={4} rows={5} />;
}
