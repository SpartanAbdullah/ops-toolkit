import { AppShell } from "@/components/app/app-shell";
import { getRoleLabel } from "@/lib/app/team";
import { getAppContext, getUnreadNotificationCount } from "@/lib/app/session";
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Workspace",
  description: "Overtime and petty cash workspace.",
});

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const [context, unreadNotifications] = await Promise.all([getAppContext(), getUnreadNotificationCount()]);
  const userName = context.profile?.fullName || context.authUser.user_metadata.full_name || context.user.email;

  return (
    <AppShell
      userName={userName}
      email={context.user.email}
      roleLabel={getRoleLabel(context.resolvedRole)}
      activeTeamName={context.activeTeam?.name ?? null}
      unreadNotifications={unreadNotifications}
    >
      {children}
    </AppShell>
  );
}
