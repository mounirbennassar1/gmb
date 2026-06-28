"use client";

import { useState } from "react";

type Service = { label: string; desc: string };

type Props = {
  writeReviewUrl: string | null;
  services: Service[];
  heading: string;
  sub: string;
};

const GOLD = "#cf9f37";
const EMPTY = "#e3dccb";
const GREEN = "#0e4a39";

const RATING_LABELS: Record<number, string> = {
  0: "اضغط على النجوم لتقييم تجربتك",
  1: "تجربة سيّئة",
  2: "مقبولة",
  3: "جيّدة",
  4: "جيّدة جداً",
  5: "ممتازة",
};

function Star({ fill, size = 38 }: { fill: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M12 17.3l-5.4 3.1 1.4-6.1L3 9.9l6.2-.5L12 3.6l2.8 5.8 6.2.5-4.9 4.4 1.4 6.1z"
        fill={fill}
      />
    </svg>
  );
}

export default function RatingForm({ writeReviewUrl, services, heading, sub }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [service, setService] = useState("");
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const active = hover || rating;
  const isHigh = rating >= 4;
  const showGoogle = isHigh && !!writeReviewUrl;
  const selected = services.find((s) => s.label === service);

  async function submit() {
    setError(null);
    if (rating < 1) {
      setError("الرجاء اختيار عدد النجوم");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          rating,
          comment: comment.trim(),
          serviceType: service,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "تعذّر إرسال التقييم");
      setDoneId(data.id as string);
      setDone(true);
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
    setService("");
    setName("");
    setComment("");
    setDone(false);
    setDoneId(null);
    setError(null);
    setCopied(false);
  }

  // ── Thank-you screen ─────────────────────────────────────────────
  if (done) {
    const thanksTitle = isHigh ? "شكراً لتقييمك الرائع" : "شكراً لملاحظتك";
    const thanksBody = isHigh
      ? "يسعدنا أنّ تجربتك كانت مميّزة — شارك كلمتك الطيّبة مع الآخرين على خرائط Google."
      : "نأسف أنّ التجربة لم تكن بالمستوى الذي تستحقه. لقد وصلت ملاحظتك إلى فريقنا وسنعمل على تحسينها.";

    return (
      <div style={{ textAlign: "center", padding: "6px 4px" }}>
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: "50%",
            margin: "0 auto 15px",
            background: "rgba(201,162,74,.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "maScaleIn .42s cubic-bezier(.2,1,.3,1)",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="30"
            height="30"
            fill="none"
            stroke="#bf9a3f"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2
          style={{
            fontFamily: "var(--font-messiri), sans-serif",
            fontWeight: 600,
            fontSize: 21,
            color: "#1c2b25",
            margin: "0 0 7px",
          }}
        >
          {thanksTitle}
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "#7a8b83",
            lineHeight: 1.75,
            margin: "0 auto 18px",
            maxWidth: 300,
          }}
        >
          {thanksBody}
        </p>

        {showGoogle && (
          <>
            {/* Google can't pre-fill the rating/text — guide the user through the
                last manual step and copy their comment for one-tap pasting. */}
            <div
              style={{
                background: "#f7f4ec",
                border: "1px solid rgba(14,74,57,.08)",
                borderRadius: 12,
                padding: "10px 14px",
                margin: "0 auto 14px",
                maxWidth: 322,
                fontSize: 12.5,
                lineHeight: 1.8,
                color: "#6b7c74",
              }}
            >
              بقيت خطوة على Google: اختر{" "}
              <b style={{ color: "#1c2b25" }}>{"٠١٢٣٤٥"[rating]} نجوم</b>
              {comment.trim() ? (
                <>
                  {" "}ثمّ الصق تعليقك (<b style={{ color: "#bf9a3f" }}>سننسخه لك</b>) وانشر.
                </>
              ) : (
                <> وشاركنا رأيك.</>
              )}
            </div>
            <button
              onClick={goToGoogle}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-plex-arabic), sans-serif",
                fontSize: 14.5,
                fontWeight: 600,
                color: "#f3ecdd",
                background: GREEN,
                borderRadius: 13,
                padding: "12px 22px",
                boxShadow: "0 15px 28px -15px rgba(14,74,57,.85)",
              }}
            >
              <span>أضف تقييمك على خرائط Google</span>
              <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </button>
            {copied && (
              <p style={{ marginTop: 10, fontSize: 12.5, color: "#3f7d5f" }}>
                ✓ نسخنا تعليقك — الصقه في مربّع المراجعة على Google
              </p>
            )}
          </>
        )}

        <div style={{ marginTop: 16 }}>
          <button
            onClick={reset}
            style={{
              background: "none",
              border: "none",
              color: "#9aa8a1",
              fontFamily: "var(--font-plex-arabic), sans-serif",
              fontSize: 13,
              cursor: "pointer",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            تعديل التقييم
          </button>
        </div>
      </div>
    );
  }

  // ── Rating / review form ─────────────────────────────────────────
  return (
    <div style={{ textAlign: "center" }}>
      <h2
        style={{
          fontFamily: "var(--font-messiri), sans-serif",
          fontWeight: 600,
          fontSize: 22,
          color: "#1c2b25",
          margin: "2px 0 4px",
        }}
      >
        {heading}
      </h2>
      <p style={{ fontSize: 13.5, color: "#7a8b83", margin: "0 0 18px" }}>{sub}</p>

      {/* Stars */}
      <div
        onMouseLeave={() => setHover(0)}
        style={{ display: "flex", justifyContent: "center", gap: 7, marginBottom: 9 }}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            aria-label={`${n} من 5`}
            style={{ background: "none", border: "none", padding: 2, cursor: "pointer", lineHeight: 0 }}
          >
            <Star fill={n <= active ? GOLD : EMPTY} />
          </button>
        ))}
      </div>
      <div
        style={{
          fontFamily: "var(--font-messiri), sans-serif",
          fontSize: 14,
          color: "#bf9a3f",
          height: 21,
          marginBottom: 4,
        }}
      >
        {RATING_LABELS[active] ?? RATING_LABELS[0]}
      </div>

      <div style={{ height: 14 }} />

      {/* Service chips */}
      {services.length > 0 && (
        <>
          <div
            className="ma-scroll"
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
              padding: "2px 2px 4px",
              marginBottom: 8,
              WebkitMaskImage:
                "linear-gradient(90deg, transparent 0, #000 18px, #000 calc(100% - 18px), transparent 100%)",
              maskImage:
                "linear-gradient(90deg, transparent 0, #000 18px, #000 calc(100% - 18px), transparent 100%)",
            }}
          >
            {services.map((it) => {
              const activeChip = it.label === service;
              return (
                <button
                  key={it.label}
                  onClick={() => setService(activeChip ? "" : it.label)}
                  style={{
                    fontFamily: "var(--font-plex-arabic), sans-serif",
                    fontSize: 13,
                    padding: "8px 15px",
                    borderRadius: 999,
                    cursor: "pointer",
                    transition: "all .2s",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    background: activeChip ? GREEN : "#f3f0e8",
                    color: activeChip ? "#f1e9d8" : "#5d6f67",
                    border: activeChip ? `1px solid ${GREEN}` : "1px solid rgba(14,74,57,.10)",
                    boxShadow: activeChip ? "0 7px 16px -9px rgba(14,74,57,.75)" : "none",
                  }}
                >
                  {it.label}
                </button>
              );
            })}
          </div>
          <div style={{ minHeight: 36, marginBottom: 10, padding: "0 4px", textAlign: "center" }}>
            <span style={{ fontSize: 12.5, lineHeight: 1.65, color: "#8a9890" }}>
              {selected?.desc ?? ""}
            </span>
          </div>
        </>
      )}

      {/* Name + comment */}
      <input
        className="ma-field"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="الاسم (اختياري)"
        style={{
          width: "100%",
          fontFamily: "var(--font-plex-arabic), sans-serif",
          fontSize: 14.5,
          color: "#23332d",
          background: "#faf8f2",
          border: "1px solid rgba(14,74,57,.14)",
          borderRadius: 13,
          padding: "12px 14px",
          marginBottom: 10,
          outline: "none",
        }}
      />
      <textarea
        className="ma-field"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="اكتب عن تجربتك بإيجاز…"
        rows={3}
        style={{
          width: "100%",
          fontFamily: "var(--font-plex-arabic), sans-serif",
          fontSize: 14.5,
          lineHeight: 1.65,
          color: "#23332d",
          background: "#faf8f2",
          border: "1px solid rgba(14,74,57,.14)",
          borderRadius: 13,
          padding: "12px 14px",
          marginBottom: 14,
          outline: "none",
          resize: "none",
          minHeight: 84,
        }}
      />

      {error && (
        <p
          style={{
            background: "rgba(220,38,38,.07)",
            color: "#b4341f",
            borderRadius: 11,
            padding: "9px 12px",
            fontSize: 13,
            margin: "0 0 12px",
          }}
        >
          {error}
        </p>
      )}

      <button
        className="ma-submit"
        onClick={submit}
        disabled={submitting}
        style={{
          width: "100%",
          fontFamily: "var(--font-plex-arabic), sans-serif",
          fontSize: 15.5,
          fontWeight: 600,
          letterSpacing: ".02em",
          color: "#f3ecdd",
          background: GREEN,
          border: "none",
          borderRadius: 14,
          padding: 14,
          cursor: submitting ? "not-allowed" : "pointer",
          opacity: submitting ? 0.7 : 1,
          boxShadow: "0 15px 28px -15px rgba(14,74,57,.85)",
          transition: "all .2s",
        }}
      >
        {submitting ? "جارٍ الإرسال…" : "إرسال التقييم"}
      </button>
    </div>
  );
}
