import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/config";
import AdminDashboard from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();

  const [reviews, settings] = await Promise.all([
    prisma.review.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
    getSettings(),
  ]);

  return <AdminDashboard initialReviews={reviews} settings={settings} />;
}
