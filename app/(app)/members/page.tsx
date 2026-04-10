import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export default async function MembersRedirect() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin");

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: { select: { slug: true } } },
    orderBy: { joinedAt: "asc" },
  });

  if (!membership) redirect("/workspace/new");
  redirect(`/w/${membership.workspace.slug}/members`);
}
