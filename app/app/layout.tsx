import { AppShell } from "@/components/app/app-shell";
import { getRoleLabel } from "@/lib/app/team";
import { getAppContext, getRecentNotifications, getUnreadNotificationCount } from "@/lib/app/session";
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Workspace",
  description: "Overtime and petty cash workspace.",
});

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const [context, unreadNotifications, recentNotifications] = await Promise.all([
    getAppContext(),
    getUnreadNotificationCount(),
    getRecentNotifications(15),
  ]);
  const userName = context.profile?.fullName || context.authUser.user_metadata.full_name || context.user.email;

  return (
    <AppShell
      userName={userName}
      email={context.user.email}
      roleLabel={getRoleLabel(context.resolvedRole)}
      activeTeamName={context.activeTeam?.name ?? null}
      unreadNotifications={unreadNotifications}
      notifications={recentNotifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        readAt: n.readAt,
        createdAt: n.createdAt,
      }))}
    >
      {children}
    </AppShell>
  );
}
