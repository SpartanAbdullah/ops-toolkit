import { PageLoadingSkeleton } from "@/components/app/page-loading-skeleton";

export default function WorkspaceLoading() {
  return <PageLoadingSkeleton stats={2} rows={3} />;
}
