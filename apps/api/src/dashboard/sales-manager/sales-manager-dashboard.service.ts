import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import { SalesManagerWidgetsService } from './sales-manager-widgets.service.js';
import { SalesManagerDailyTasksService } from './sales-manager-daily-tasks.service.js';
import { SalesManagerTeamLeaderboardService } from './sales-manager-team-leaderboard.service.js';

@Injectable()
export class SalesManagerDashboardService {
  constructor(
    private prisma: PrismaService,
    private salesManagerWidgets: SalesManagerWidgetsService,
    private salesManagerDailyTasks: SalesManagerDailyTasksService,
    private salesManagerTeamLeaderboard: SalesManagerTeamLeaderboardService,
  ) {}

  async getSalesManagerDashboard(managerId: string) {
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      include: { role: true },
    });
    const isSupervisory =
      manager?.role?.code === 'ADMIN' ||
      manager?.role?.code === 'DIRECTOR' ||
      manager?.role?.code === 'BUSINESS_MANAGER';

    let subs = await this.prisma.user.findMany({
      where: { managerId, status: 'ACTIVE', deletedAt: null },
      select: { id: true, name: true, username: true, image: true },
    });

    if (isSupervisory || subs.length === 0) {
      const seRole = await this.prisma.role.findFirst({
        where: { code: 'SALES_EXECUTIVE' },
      });
      if (seRole) {
        const allExecs = await this.prisma.user.findMany({
          where: { roleId: seRole.id, status: 'ACTIVE', deletedAt: null },
          select: { id: true, name: true, username: true, image: true },
        });
        if (allExecs.length > 0) {
          subs = allExecs;
        }
      }
    }

    const userIds = Array.from(new Set([managerId, ...subs.map((s) => s.id)]));

    const [widgetsAndPipeline, dailyTasks, teamLeaderboard] = await Promise.all(
      [
        this.salesManagerWidgets.getWidgetsAndPipeline(userIds),
        this.salesManagerDailyTasks.getDailyTasks(userIds),
        this.salesManagerTeamLeaderboard.getTeamLeaderboard(subs),
      ],
    );

    return {
      widgets: widgetsAndPipeline.widgets,
      pipeline: widgetsAndPipeline.pipeline,
      teamLeaderboard,
      todaySiteVisitList: dailyTasks.todaySiteVisitList,
      backlogSiteVisitList: dailyTasks.backlogSiteVisitList,
      todayFollowUpList: dailyTasks.todayFollowUpList,
      missedFollowUpBacklog: dailyTasks.missedFollowUpBacklog,
    };
  }
}
