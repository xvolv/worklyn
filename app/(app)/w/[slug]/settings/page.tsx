import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SettingsPanel from "@/components/dashboard/SettingsPanel";

export default async function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/signin");

  const { slug } = await params;
  const workspace = await prisma.workspace.findUnique({
    where: { slug }
  });

  if (!workspace) redirect("/");

  return <SettingsPanel user={session.user as any} workspaceData={workspace} />;
}
