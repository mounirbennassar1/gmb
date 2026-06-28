"use client";

import { useState } from "react";

type Props = {
  writeReviewUrl: string | null;
  serviceTypes: string[];
};

const RATING_LABELS = ["", "سيئ جداً", "سيئ", "مقبول", "جيد", "ممتاز"];

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-11 w-11 transition-transform duration-100" aria-hidden="true">
      <path
        d="M12 2.6l2.86 5.8 6.4.93-4.63 4.51 1.09 6.38L12 17.7l-5.72 3.01 1.09-6.38L2.74 9.83l6.4-.93L12 2.6z"
        fill={filled ? "#f59e0b" : "none"}
        stroke={filled ? "#f59e0b" : "#cbd5e1"}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.5 1.2-4 1.2-3 0-5.6-2-6.5-4.8H1.5v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.5 14.5a7.2 7.2 0 0 1 0-4.6V6.8H1.5a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 12 0 12 12 0 0 0 1.5 6.8l4 3.1C6.4 6.8 9 4.8 12 4.8z" />
    </svg>
  );
}

export default function RatingForm({ writeReviewUrl, serviceTypes }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [comment, setComment] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const active = hover || rating;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (rating < 1) {
      setError("الرجاء اختيار عدد النجوم");
      return;
    }
    if (name.trim().length < 2) {
      setError("الرجاء إدخال الاسم");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, comment, phone, serviceType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذّر إرسال التقييم");
      setDoneId(data.id as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر إرسال التقييم");
    } finally {
      setSubmitting(false);
    }
  }

  async function goToGoogle() {
    if (doneId) {
      fetch(`/api/reviews/${doneId}/clicked`, { method: "POST" }).catch(() => {});
    }
    if (comment.trim()) {
      try {
        await navigator.clipboard.writeText(comment.trim());
        setCopied(true);
      } catch {
        /* clipboard may be blocked — not critical */
      }
    }
    if (writeReviewUrl) window.open(writeReviewUrl, "_blank", "noopener");
  }

  function reset() {
    setRating(0);
    setHover(0);
    setName("");
    setServiceType("");
    setComment("");
    setPhone("");
    setDoneId(null);
    setError(null);
    setCopied(false);
  }

  // ── Success screen ───────────────────────────────────────────────
  if (doneId) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg viewBox="0 0 24 24" className="h-9 w-9 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">شكراً لك على تقييمك!</h2>

        {writeReviewUrl ? (
          <>
            <p className="mx-auto mt-3 max-w-md text-slate-600">
              الخطوة الأخيرة 👇 انشر تقييمك على خرائط Google ليظهر للجميع ويصل إلى من يبحث عن العيادة.
            </p>
            <button
              onClick={goToGoogle}
              className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 text-lg font-bold text-slate-700 shadow-md ring-1 ring-slate-200 transition hover:shadow-lg hover:ring-slate-300"
            >
              <GoogleG />
              انشر تقييمك على Google
            </button>
            {comment.trim() && (
              <p className="mt-3 text-sm text-slate-500">
                {copied
                  ? "✓ نسخنا تعليقك — يمكنك لصقه مباشرة في Google"
                  : "سننسخ تعليقك تلقائياً لتلصقه بسهولة في Google"}
              </p>
            )}
          </>
        ) : (
          <p className="mx-auto mt-3 max-w-md text-slate-600">
            تم استلام تقييمك بنجاح، نقدّر لك وقتك ومشاركتك.
          </p>
        )}

        <button
          onClick={reset}
          className="mt-6 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          إضافة تقييم آخر
        </button>
      </div>
    );
  }

  // ── Rating form ──────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <p className="mb-3 font-semibold text-slate-700">كيف تقيّم تجربتك معنا؟</p>
        <div className="flex flex-row-reverse items-center justify-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="p-1 hover:scale-110"
              aria-label={`${n} من 5`}
            >
              <StarIcon filled={n <= active} />
            </button>
          ))}
        </div>
        <div className="mt-2 h-6 text-sm font-bold text-amber-500">
          {active ? RATING_LABELS[active] : ""}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          الاسم <span className="text-rose-500">*</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسمك الكريم"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {serviceTypes.length > 0 && (
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            الخدمة التي تلقّيتها
          </label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">— اختياري —</option>
            {serviceTypes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          تعليقك
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="أخبرنا عن تجربتك في العيادة…"
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          رقم الجوال <span className="font-normal text-slate-400">(اختياري)</span>
        </label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          placeholder="05xxxxxxxx"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-center text-sm font-semibold text-rose-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-emerald-600 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "جارٍ الإرسال…" : "إرسال التقييم"}
      </button>
    </form>
  );
}
