import { PrismaClient, TaskStatus, Priority, ActivityType, ProjectStatus, WorkspaceRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Find the first user to use as seed owner
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("⚠ No user found. Sign up first, then re-run seed.");
    return;
  }

  console.log(`Seeding data for user: ${user.name} (${user.email})`);

  // Clean existing domain data
  await prisma.activity.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();

  // ─── Workspace ───
  const workspace = await prisma.workspace.create({
    data: {
      name: "Worklyn HQ",
      slug: "worklyn-hq",
    },
  });

  // ─── Workspace Members ───
  await prisma.workspaceMember.create({
    data: { userId: user.id, workspaceId: workspace.id, role: WorkspaceRole.OWNER },
  });

  // ─── Projects ───
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: "Q3 Market Strategy",
        description: "Strategic planning and execution for Q3 market campaigns",
        status: ProjectStatus.ACTIVE,
        progress: 65,
        dueDate: new Date("2026-10-30"),
        imageUrl: "/featured-project-hero.png",
        workspaceId: workspace.id,
        createdById: user.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Design System v2",
        description: "Rebuild the component library with new brand guidelines",
        status: ProjectStatus.ACTIVE,
        progress: 40,
        dueDate: new Date("2026-11-15"),
        workspaceId: workspace.id,
        createdById: user.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Backend API v2",
        description: "RESTful API refactor with improved performance",
        status: ProjectStatus.ACTIVE,
        progress: 82,
        dueDate: new Date("2026-09-30"),
        workspaceId: workspace.id,
        createdById: user.id,
      },
    }),
    prisma.project.create({
      data: {
        name: "Mobile App Launch",
        description: "Cross-platform mobile application",
        status: ProjectStatus.COMPLETED,
        progress: 100,
        dueDate: new Date("2026-08-15"),
        workspaceId: workspace.id,
        createdById: user.id,
      },
    }),
  ]);

  // ─── Tasks ───
  const now = new Date();
  const day = (offset: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    return d;
  };
  const daysAgo = (offset: number) => day(-offset);

  const taskData = [
    // Q3 Market Strategy tasks
    { title: "Market research report", status: TaskStatus.DONE, priority: Priority.HIGH, dueDate: daysAgo(5), projectId: projects[0].id },
    { title: "Competitor analysis deck", status: TaskStatus.DONE, priority: Priority.MEDIUM, dueDate: daysAgo(3), projectId: projects[0].id },
    { title: "Campaign brief draft", status: TaskStatus.IN_PROGRESS, priority: Priority.HIGH, dueDate: day(2), projectId: projects[0].id },
    { title: "Social media calendar Q3", status: TaskStatus.IN_PROGRESS, priority: Priority.MEDIUM, dueDate: day(5), projectId: projects[0].id },
    { title: "Budget allocation review", status: TaskStatus.TODO, priority: Priority.URGENT, dueDate: day(1), projectId: projects[0].id },
    { title: "Influencer outreach list", status: TaskStatus.TODO, priority: Priority.LOW, dueDate: day(10), projectId: projects[0].id },

    // Design System tasks
    { title: "UI Audit Report", status: TaskStatus.IN_REVIEW, priority: Priority.URGENT, dueDate: day(1), projectId: projects[1].id },
    { title: "Color palette finalization", status: TaskStatus.DONE, priority: Priority.HIGH, dueDate: daysAgo(7), projectId: projects[1].id },
    { title: "Typography scale system", status: TaskStatus.DONE, priority: Priority.MEDIUM, dueDate: daysAgo(4), projectId: projects[1].id },
    { title: "Button component variants", status: TaskStatus.IN_PROGRESS, priority: Priority.HIGH, dueDate: day(3), projectId: projects[1].id },
    { title: "Form input components", status: TaskStatus.TODO, priority: Priority.MEDIUM, dueDate: day(7), projectId: projects[1].id },
    { title: "User Testing Phase 1", status: TaskStatus.TODO, priority: Priority.HIGH, dueDate: day(4), projectId: projects[1].id },

    // Backend API tasks
    { title: "API Documentation", status: TaskStatus.IN_PROGRESS, priority: Priority.HIGH, dueDate: day(6), projectId: projects[2].id },
    { title: "Auth middleware refactor", status: TaskStatus.DONE, priority: Priority.URGENT, dueDate: daysAgo(10), projectId: projects[2].id },
    { title: "Rate limiting implementation", status: TaskStatus.DONE, priority: Priority.HIGH, dueDate: daysAgo(8), projectId: projects[2].id },
    { title: "Database query optimization", status: TaskStatus.DONE, priority: Priority.MEDIUM, dueDate: daysAgo(6), projectId: projects[2].id },
    { title: "Webhook endpoints", status: TaskStatus.IN_REVIEW, priority: Priority.MEDIUM, dueDate: day(2), projectId: projects[2].id },
    { title: "Sprint Retrospective", status: TaskStatus.TODO, priority: Priority.LOW, dueDate: day(8), projectId: projects[2].id },

    // Mobile App (completed project)
    { title: "Mobile login flow", status: TaskStatus.DONE, priority: Priority.HIGH, dueDate: daysAgo(15), projectId: projects[3].id },
    { title: "Push notifications", status: TaskStatus.DONE, priority: Priority.MEDIUM, dueDate: daysAgo(12), projectId: projects[3].id },
  ];

  for (const t of taskData) {
    await prisma.task.create({
      data: { ...t, assigneeId: user.id },
    });
  }

  // ─── Activities ───
  const activityData = [
    { type: ActivityType.TASK_COMPLETED, description: "completed \"Mobile Login\" component", createdAt: daysAgo(0), projectId: projects[3].id },
    { type: ActivityType.PROJECT_CREATED, description: "created project \"Q3 Strategy\"", createdAt: new Date(now.getTime() - 45 * 60000), projectId: projects[0].id },
    { type: ActivityType.COMMENT, description: "commented on Asset #442: \"The contrast ratio needs to be at least 4.5:1 for accessibility.\"", createdAt: new Date(now.getTime() - 3 * 3600000), projectId: projects[1].id },
    { type: ActivityType.SYSTEM, description: "Weekly Summary report generated automatically", createdAt: new Date(now.getTime() - 5 * 3600000) },
    { type: ActivityType.DEPLOY, description: "deployed v2.4.1 to production", createdAt: daysAgo(1), projectId: projects[2].id },
    { type: ActivityType.TASK_COMPLETED, description: "moved \"Auth Flow\" to review", createdAt: daysAgo(1), projectId: projects[2].id },
    { type: ActivityType.COMMENT, description: "left feedback on the design system spacing tokens", createdAt: daysAgo(2), projectId: projects[1].id },
    { type: ActivityType.TASK_COMPLETED, description: "completed \"Rate limiting implementation\"", createdAt: daysAgo(3), projectId: projects[2].id },
  ];

  for (const a of activityData) {
    await prisma.activity.create({
      data: {
        type: a.type,
        description: a.description,
        createdAt: a.createdAt,
        userId: user.id,
        projectId: a.projectId,
        workspaceId: workspace.id,
      },
    });
  }

  const taskCount = await prisma.task.count();
  const projectCount = await prisma.project.count();
  const activityCount = await prisma.activity.count();
  console.log(`✓ Seeded ${projectCount} projects, ${taskCount} tasks, ${activityCount} activities`);
  console.log(`✓ Workspace: "${workspace.name}" (slug: ${workspace.slug})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
