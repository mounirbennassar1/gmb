"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/lib/config";

type ReviewRow = {
  id: string;
  name: string;
  rating: number;
  comment: string | null;
  phone: string | null;
  email: string | null;
  serviceType: string | null;
  source: string;
  status: string;
  clickedGoogle: boolean;
  reply: string | null;
  createdAt: Date;
};

type Props = {
  initialReviews: ReviewRow[];
  settings: SiteSettings;
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  new: { label: "جديد", cls: "bg-amber-100 text-amber-700" },
  approved: { label: "منشور", cls: "bg-emerald-100 text-emerald-700" },
  archived: { label: "مؤرشف", cls: "bg-slate-200 text-slate-600" },
};

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "new", label: "جديد" },
  { key: "approved", label: "منشور" },
  { key: "archived", label: "مؤرشف" },
];

const dateFmt = new Intl.DateTimeFormat("ar", { dateStyle: "medium", timeStyle: "short" });

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex flex-row-reverse">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path
            d="M12 2.6l2.86 5.8 6.4.93-4.63 4.51 1.09 6.38L12 17.7l-5.72 3.01 1.09-6.38L2.74 9.83l6.4-.93L12 2.6z"
            fill={n <= value ? "#f59e0b" : "#e2e8f0"}
          />
        </svg>
      ))}
    </span>
  );
}

export default function AdminDashboard({ initialReviews, settings }: Props) {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewRow[]>(initialReviews);
  const [tab, setTab] = useState<"reviews" | "settings">("reviews");
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const stats = useMemo(() => {
    const total = reviews.length;
    const avg = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    return {
      total,
      avg,
      new: reviews.filter((r) => r.status === "new").length,
      approved: reviews.filter((r) => r.status === "approved").length,
      clicked: reviews.filter((r) => r.clickedGoogle).length,
    };
  }, [reviews]);

  const visible = useMemo(
    () => (filter === "all" ? reviews : reviews.filter((r) => r.status === filter)),
    [reviews, filter],
  );

  async function patch(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok && data.review) {
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...data.review } : r)));
      }
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) setReviews((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  function openReply(r: ReviewRow) {
    setReplyId(r.id);
    setReplyText(r.reply ?? "");
  }

  async function saveReply(id: string) {
    await patch(id, { reply: replyText });
    setReplyId(null);
    setReplyText("");
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {/* top bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-bold text-slate-800">لوحة إدارة التقييمات</h1>
          <button
            onClick={logout}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            تسجيل الخروج
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* tabs */}
        <div className="mb-6 inline-flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-100">
          {(["reviews", "settings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-5 py-2 text-sm font-bold transition ${
                tab === t ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t === "reviews" ? "التقييمات" : "الإعدادات"}
            </button>
          ))}
        </div>

        {tab === "reviews" ? (
          <>
            {/* stats */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <StatCard label="إجمالي التقييمات" value={String(stats.total)} />
              <StatCard label="متوسط التقييم" value={stats.avg.toFixed(1)} accent />
              <StatCard label="بانتظار المراجعة" value={String(stats.new)} />
              <StatCard label="منشور" value={String(stats.approved)} />
              <StatCard label="توجّهوا إلى Google" value={String(stats.clicked)} />
            </div>

            {/* filters */}
            <div className="mb-4 flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    filter === f.key
                      ? "bg-slate-800 text-white"
                      : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* list */}
            {visible.length === 0 ? (
              <p className="rounded-2xl bg-white py-16 text-center text-slate-400 ring-1 ring-slate-100">
                لا توجد تقييمات في هذا التصنيف بعد.
              </p>
            ) : (
              <div className="space-y-3">
                {visible.map((r) => {
                  const meta = STATUS_META[r.status] ?? STATUS_META.new;
                  return (
                    <article key={r.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{r.name}</span>
                            <Stars value={r.rating} />
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${meta.cls}`}>
                              {meta.label}
                            </span>
                            {r.clickedGoogle && (
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                                Google ✓
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-400">
                            {dateFmt.format(new Date(r.createdAt))}
                            {r.serviceType ? ` • ${r.serviceType}` : ""}
                            {r.phone ? ` • ${r.phone}` : ""}
                            {r.email ? ` • ${r.email}` : ""}
                          </p>
                        </div>
                      </div>

                      {r.comment && <p className="mt-3 text-sm text-slate-600">{r.comment}</p>}

                      {r.reply && replyId !== r.id && (
                        <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-slate-600">
                          <span className="font-bold text-emerald-700">ردّك: </span>
                          {r.reply}
                        </div>
                      )}

                      {replyId === r.id && (
                        <div className="mt-3">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={2}
                            placeholder="اكتب رداً يظهر أسفل التقييم…"
                            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:bg-white"
                          />
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => saveReply(r.id)}
                              disabled={busyId === r.id}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                            >
                              حفظ الرد
                            </button>
                            <button
                              onClick={() => setReplyId(null)}
                              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                            >
                              إلغاء
                            </button>
                          </div>
                        </div>
                      )}

                      {/* actions */}
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                        {r.status !== "approved" && (
                          <ActionButton onClick={() => patch(r.id, { status: "approved" })} disabled={busyId === r.id}>
                            نشر
                          </ActionButton>
                        )}
                        {r.status !== "archived" && (
                          <ActionButton onClick={() => patch(r.id, { status: "archived" })} disabled={busyId === r.id}>
                            أرشفة
                          </ActionButton>
                        )}
                        {r.status === "archived" && (
                          <ActionButton onClick={() => patch(r.id, { status: "new" })} disabled={busyId === r.id}>
                            إرجاع
                          </ActionButton>
                        )}
                        <ActionButton onClick={() => openReply(r)} disabled={busyId === r.id}>
                          {r.reply ? "تعديل الرد" : "رد"}
                        </ActionButton>
                        {confirmId === r.id ? (
                          <button
                            onClick={() => remove(r.id)}
                            disabled={busyId === r.id}
                            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
                          >
                            تأكيد الحذف
                          </button>
                        ) : (
                          <button
                            onClick={() => setConfirmId(r.id)}
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                          >
                            حذف
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <SettingsForm settings={settings} />
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-100">
      <p className={`text-2xl font-extrabold ${accent ? "text-amber-500" : "text-slate-800"}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [form, setForm] = useState({
    clinicNameAr: settings.clinicNameAr,
    clinicNameEn: settings.clinicNameEn,
    headline: settings.headline,
    subheadline: settings.subheadline,
    googlePlaceId: settings.googlePlaceId,
    googleWriteReviewUrl: settings.googleWriteReviewUrl,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="max-w-2xl space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <Field label="اسم العيادة (عربي)" value={form.clinicNameAr} onChange={(v) => set("clinicNameAr", v)} />
      <Field label="اسم العيادة (إنجليزي)" value={form.clinicNameEn} onChange={(v) => set("clinicNameEn", v)} />
      <Field label="العنوان الرئيسي" value={form.headline} onChange={(v) => set("headline", v)} />
      <Field label="العنوان الفرعي" value={form.subheadline} onChange={(v) => set("subheadline", v)} />

      <div className="rounded-xl bg-blue-50 p-4">
        <p className="mb-3 text-sm font-bold text-blue-800">ربط Google</p>
        <p className="mb-3 text-xs leading-relaxed text-blue-700">
          أدخل <b>Place ID</b> الخاص بالعيادة على خرائط Google، وسيتم توجيه الزائر إلى صفحة كتابة المراجعة الرسمية.
          يمكنك إيجاد المُعرّف من: developers.google.com/maps/documentation/places/web-service/place-id
        </p>
        <Field label="Google Place ID" value={form.googlePlaceId} onChange={(v) => set("googlePlaceId", v)} ltr />
        <div className="h-3" />
        <Field
          label="أو رابط كتابة مراجعة كامل (اختياري)"
          value={form.googleWriteReviewUrl}
          onChange={(v) => set("googleWriteReviewUrl", v)}
          ltr
          placeholder="https://search.google.com/local/writereview?placeid=..."
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "جارٍ الحفظ…" : "حفظ الإعدادات"}
        </button>
        {saved && <span className="text-sm font-semibold text-emerald-600">✓ تم الحفظ</span>}
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  ltr,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  ltr?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={ltr ? "ltr" : undefined}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
      />
    </label>
  );
}
