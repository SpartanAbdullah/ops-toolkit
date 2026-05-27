import type { OperationalModule, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type PeriodLockClient = Pick<Prisma.TransactionClient, "operationalPeriodLock"> | Pick<typeof prisma, "operationalPeriodLock">;

export function getOperationalPeriodMonth(value: Date) {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), 1, 0, 0, 0));
}

export function formatOperationalPeriod(value: Date) {
  return new Intl.DateTimeFormat("en-AE", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(getOperationalPeriodMonth(value));
}

export async function findOperationalPeriodLock(
  client: PeriodLockClient,
  teamId: string,
  module: OperationalModule,
  value: Date,
) {
  return client.operationalPeriodLock.findUnique({
    where: {
      teamId_module_periodMonth: {
        teamId,
        module,
        periodMonth: getOperationalPeriodMonth(value),
      },
    },
    select: {
      id: true,
      lockedAt: true,
      periodMonth: true,
    },
  });
}

export async function isOperationalPeriodLocked(teamId: string, module: OperationalModule, value: Date) {
  return Boolean(await findOperationalPeriodLock(prisma, teamId, module, value));
}
