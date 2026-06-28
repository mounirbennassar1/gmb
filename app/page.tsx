import { prisma } from "@/lib/prisma";
import { getSettings, buildWriteReviewUrl } from "@/lib/config";
import RatingForm from "./RatingForm";

export const dynamic = "force-dynamic";

function StaticStars({ value, className = "h-4 w-4" }: { value: number; className?: string }) {
  return (
    <span className="inline-flex flex-row-reverse">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 24 24" className={className} aria-hidden="true">
          <path
            d="M12 2.6l2.86 5.8 6.4.93-4.63 4.51 1.09 6.38L12 17.7l-5.72 3.01 1.09-6.38L2.74 9.83l6.4-.93L12 2.6z"
            fill={n <= Math.round(value) ? "#f59e0b" : "#e2e8f0"}
          />
        </svg>
      ))}
    </span>
  );
}

export default async function Home() {
  const settings = await getSettings();
  const writeReviewUrl = buildWriteReviewUrl(settings);

  const [approved, count, agg] = await Promise.all([
    prisma.review.findMany({
      where: { status: "approved" },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.review.count({ where: { status: "approved" } }),
    prisma.review.aggregate({ where: { status: "approved" }, _avg: { rating: true } }),
  ]);
  const avg = agg._avg.rating ?? 0;
  const dateFmt = new Intl.DateTimeFormat("ar", { dateStyle: "medium" });

  return (
    <main className="relative">
      {/* decorative top band */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-emerald-600 to-teal-500" />

      <div className="relative mx-auto max-w-xl px-4 pb-16 pt-10 sm:pt-14">
        {/* header */}
        <header className="mb-7 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur">
            <svg viewBox="0 0 24 24" className="h-9 w-9 text-white" fill="currentColor">
              <path d="M13 3h-2v8H3v2h8v8h2v-8h8v-2h-8V3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">{settings.clinicNameAr}</h1>
          {settings.clinicNameEn && (
            <p className="mt-1 text-sm text-emerald-50/80">{settings.clinicNameEn}</p>
          )}
        </header>

        {/* rating summary */}
        {count > 0 && (
          <div className="mb-5 flex items-center justify-center gap-3 rounded-2xl bg-white/95 px-5 py-3 shadow-lg ring-1 ring-white/40 backdrop-blur">
            <span className="text-3xl font-extrabold text-slate-800">{avg.toFixed(1)}</span>
            <div className="text-right">
              <StaticStars value={avg} className="h-5 w-5" />
              <p className="text-xs text-slate-500">بناءً على {count} تقييم</p>
            </div>
          </div>
        )}

        {/* intro */}
        <div className="mb-5 text-center">
          <h2 className="text-xl font-bold text-slate-800">{settings.headline}</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{settings.subheadline}</p>
        </div>

        {/* form card */}
        <section className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-300/40 ring-1 ring-slate-100 sm:p-8">
          <RatingForm writeReviewUrl={writeReviewUrl} serviceTypes={settings.serviceTypes} />
        </section>

        {/* approved reviews */}
        {approved.length > 0 && (
          <section className="mt-10">
            <h3 className="mb-4 text-center text-lg font-bold text-slate-700">آراء زوّارنا</h3>
            <div className="space-y-3">
              {approved.map((r) => (
                <article
                  key={r.id}
                  className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                        {r.name.trim().charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{r.name}</p>
                        {r.serviceType && (
                          <p className="text-xs text-slate-400">{r.serviceType}</p>
                        )}
                      </div>
                    </div>
                    <StaticStars value={r.rating} />
                  </div>
                  {r.comment && (
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{r.comment}</p>
                  )}
                  {r.reply && (
                    <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                      <span className="font-bold text-emerald-700">رد العيادة: </span>
                      {r.reply}
                    </div>
                  )}
                  <p className="mt-2 text-left text-xs text-slate-400">
                    {dateFmt.format(r.createdAt)}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-10 text-center text-xs text-slate-400">
          © {settings.clinicNameAr}
        </footer>
      </div>
    </main>
  );
}
