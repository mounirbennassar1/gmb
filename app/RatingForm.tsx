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

const fieldStyle: React.CSSProperties = {
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
};

const submitStyle: React.CSSProperties = {
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
  cursor: "pointer",
  boxShadow: "0 15px 28px -15px rgba(14,74,57,.85)",
  transition: "all .2s",
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
  const [done, setDone] = useState<null | "google" | "internal">(null);
  const [copied, setCopied] = useState(false);

  const active = hover || rating;
  const isHigh = rating >= 4;
  const selected = services.find((s) => s.label === service);

  async function saveReview() {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), rating, comment: comment.trim(), serviceType: service }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "تعذّر الإرسال");
    return data.id as string;
  }

  async function submit() {
    setError(null);
    if (rating < 1) {
      setError("الرجاء اختيار عدد النجوم");
      return;
    }
    setSubmitting(true);
    try {
      const id = await saveReview();
      if (isHigh && writeReviewUrl) {
        setDone("google");
        fetch(`/api/reviews/${id}/clicked`, { method: "POST" }).catch(() => {});
      } else {
        setDone("internal");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر الإرسال");
    } finally {
      setSubmitting(false);
    }
  }

  // Copy the written review so it can be pasted on Google, then open Google.
  async function goToGoogle() {
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
    setSubmitting(false);
    setError(null);
    setDone(null);
    setCopied(false);
  }

  // ── Success screen ───────────────────────────────────────────
  if (done) {
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
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#bf9a3f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        {done === "google" ? (
          <>
            <h2 style={{ fontFamily: "var(--font-messiri), sans-serif", fontWeight: 600, fontSize: 21, color: "#1c2b25", margin: "0 0 7px" }}>
              شكراً لتقييمك الرائع
            </h2>
            <p style={{ fontSize: 14, color: "#7a8b83", lineHeight: 1.75, margin: "0 auto 14px", maxWidth: 300 }}>
              يسعدنا أنّ تجربتك كانت مميّزة. انشر تقييمك على Google ليصل إلى غيرك.
            </p>
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
              على صفحة Google اختر <b style={{ color: "#1c2b25" }}>{"٠١٢٣٤٥"[rating]} نجوم</b>
              {comment.trim() ? (
                <>
                  {" "}ثمّ الصق تعليقك (<b style={{ color: "#bf9a3f" }}>سننسخه لك</b>) وانشر.
                </>
              ) : (
                <> واكتب كلمتك.</>
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
                fontSize: 15,
                fontWeight: 600,
                color: "#f3ecdd",
                background: GREEN,
                borderRadius: 13,
                padding: "13px 24px",
                boxShadow: "0 15px 28px -15px rgba(14,74,57,.85)",
              }}
            >
              <span>أضف تقييمك على خرائط Google</span>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </button>
            {copied && (
              <p style={{ marginTop: 10, fontSize: 12.5, color: "#3f7d5f" }}>
                ✓ نسخنا تعليقك، الصقه في مربّع المراجعة على Google
              </p>
            )}
          </>
        ) : (
          <>
            <h2 style={{ fontFamily: "var(--font-messiri), sans-serif", fontWeight: 600, fontSize: 21, color: "#1c2b25", margin: "0 0 7px" }}>
              شكراً لملاحظتك
            </h2>
            <p style={{ fontSize: 14, color: "#7a8b83", lineHeight: 1.75, margin: "0 auto 14px", maxWidth: 300 }}>
              نأسف أنّ التجربة لم تكن بالمستوى الذي تستحقه. لقد وصلت ملاحظتك إلى فريقنا وسنعمل على تحسينها.
            </p>
          </>
        )}

        <div style={{ marginTop: 16 }}>
          <button onClick={reset} style={{ background: "none", border: "none", color: "#9aa8a1", fontFamily: "var(--font-plex-arabic), sans-serif", fontSize: 13, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  // ── Rating + review form ─────────────────────────────────────
  return (
    <div style={{ textAlign: "center" }}>
      <h2 style={{ fontFamily: "var(--font-messiri), sans-serif", fontWeight: 600, fontSize: 22, color: "#1c2b25", margin: "2px 0 4px" }}>
        {heading}
      </h2>
      <p style={{ fontSize: 13.5, color: "#7a8b83", margin: "0 0 18px" }}>{sub}</p>

      {/* Stars — forced LTR so they read 1 → 5 left-to-right */}
      <div onMouseLeave={() => setHover(0)} style={{ direction: "ltr", display: "flex", justifyContent: "center", gap: 7, marginBottom: 9 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            aria-label={`${n} of 5`}
            style={{ background: "none", border: "none", padding: 2, cursor: "pointer", lineHeight: 0 }}
          >
            <Star fill={n <= active ? GOLD : EMPTY} />
          </button>
        ))}
      </div>
      <div style={{ fontFamily: "var(--font-messiri), sans-serif", fontSize: 14, color: "#bf9a3f", height: 21, marginBottom: 4 }}>
        {RATING_LABELS[active] ?? RATING_LABELS[0]}
      </div>

      {rating > 0 && (
        <>
          <div style={{ height: 14 }} />

          {/* Service chips (optional) */}
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
                  marginBottom: 6,
                  WebkitMaskImage: "linear-gradient(90deg, transparent 0, #000 18px, #000 calc(100% - 18px), transparent 100%)",
                  maskImage: "linear-gradient(90deg, transparent 0, #000 18px, #000 calc(100% - 18px), transparent 100%)",
                }}
              >
                {services.map((it) => {
                  const on = it.label === service;
                  return (
                    <button
                      key={it.label}
                      onClick={() => setService(on ? "" : it.label)}
                      style={{
                        fontFamily: "var(--font-plex-arabic), sans-serif",
                        fontSize: 13,
                        padding: "8px 15px",
                        borderRadius: 999,
                        cursor: "pointer",
                        transition: "all .2s",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        background: on ? GREEN : "#f3f0e8",
                        color: on ? "#f1e9d8" : "#5d6f67",
                        border: on ? `1px solid ${GREEN}` : "1px solid rgba(14,74,57,.10)",
                        boxShadow: on ? "0 7px 16px -9px rgba(14,74,57,.75)" : "none",
                      }}
                    >
                      {it.label}
                    </button>
                  );
                })}
              </div>
              <div style={{ minHeight: 28, marginBottom: 10, padding: "0 4px" }}>
                <span style={{ fontSize: 12.5, lineHeight: 1.6, color: "#8a9890" }}>{selected?.desc ?? ""}</span>
              </div>
            </>
          )}

          {/* Review text editor */}
          <textarea
            className="ma-field"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={isHigh ? "اكتب تقييمك بإيجاز…" : "اكتب ما الذي يمكننا تحسينه…"}
            rows={3}
            style={{ ...fieldStyle, lineHeight: 1.65, resize: "none", minHeight: 88 }}
          />
          <input
            className="ma-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="الاسم (اختياري)"
            style={fieldStyle}
          />

          {error && (
            <p style={{ background: "rgba(220,38,38,.07)", color: "#b4341f", borderRadius: 11, padding: "9px 12px", fontSize: 13, margin: "0 0 12px" }}>
              {error}
            </p>
          )}

          <button className="ma-submit" onClick={submit} disabled={submitting} style={submitStyle}>
            {submitting ? "جارٍ الإرسال…" : "إرسال التقييم"}
          </button>

          {isHigh && writeReviewUrl && (
            <p style={{ marginTop: 8, fontSize: 12, color: "#9aa8a1" }}>
              بعد الإرسال يمكنك نشره على Google بضغطة واحدة.
            </p>
          )}
        </>
      )}
    </div>
  );
}
