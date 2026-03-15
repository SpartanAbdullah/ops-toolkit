import { PageLoadingSkeleton } from "@/components/app/page-loading-skeleton";

export default function WorkspaceLoading() {
  return <PageLoadingSkeleton stats={4} showFilterCard={false} panels={2} rows={3} />;
}
