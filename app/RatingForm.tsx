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
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | "google" | "internal">(null);

  const active = hover || rating;
  const isHigh = rating >= 4;
  const selected = services.find((s) => s.label === service);

  async function saveReview() {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        rating,
        comment: comment.trim(),
        phone: phone.trim(),
        serviceType: service,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "تعذّر الإرسال");
    return data.id as string;
  }

  // Happy path: open Google immediately (synchronously, so it isn't popup-
  // blocked), then record the funnel hit in the background. No writing here —
  // the visitor writes their review once, on Google.
  function goToGoogle() {
    if (writeReviewUrl) window.open(writeReviewUrl, "_blank", "noopener");
    setDone("google");
    saveReview()
      .then((id) => fetch(`/api/reviews/${id}/clicked`, { method: "POST" }).catch(() => {}))
      .catch(() => {});
  }

  // Save without funnelling to Google — used for low ratings (private feedback,
  // optional note) and for high ratings when no Google link is configured.
  async function saveAndThank() {
    setError(null);
    setSubmitting(true);
    try {
      await saveReview();
      setDone("internal");
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر الإرسال");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setRating(0);
    setHover(0);
    setService("");
    setName("");
    setComment("");
    setPhone("");
    setSubmitting(false);
    setError(null);
    setDone(null);
  }

  // ── Done states ──────────────────────────────────────────────
  if (done) {
    const title = done === "google" ? "اكتب تقييمك الآن على Google" : "شكراً لملاحظتك";
    const body =
      done === "google"
        ? "فتحنا لك صفحة Google — اكتب كلمتك الطيّبة هناك مباشرة. يسعدنا أنّ تجربتك كانت مميّزة 🌟"
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
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#bf9a3f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h2 style={{ fontFamily: "var(--font-messiri), sans-serif", fontWeight: 600, fontSize: 21, color: "#1c2b25", margin: "0 0 7px" }}>
          {title}
        </h2>
        <p style={{ fontSize: 14, color: "#7a8b83", lineHeight: 1.75, margin: "0 auto 14px", maxWidth: 300 }}>
          {body}
        </p>
        {done === "google" && writeReviewUrl && (
          <a
            href={writeReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-block", fontFamily: "var(--font-plex-arabic), sans-serif", fontSize: 13, color: "#bf9a3f", textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            لم تُفتح الصفحة؟ افتح Google
          </a>
        )}
        <div style={{ marginTop: 16 }}>
          <button onClick={reset} style={{ background: "none", border: "none", color: "#9aa8a1", fontFamily: "var(--font-plex-arabic), sans-serif", fontSize: 13, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  // ── Rating-first flow ────────────────────────────────────────
  return (
    <div style={{ textAlign: "center" }}>
      <h2 style={{ fontFamily: "var(--font-messiri), sans-serif", fontWeight: 600, fontSize: 22, color: "#1c2b25", margin: "2px 0 4px" }}>
        {heading}
      </h2>
      <p style={{ fontSize: 13.5, color: "#7a8b83", margin: "0 0 18px" }}>{sub}</p>

      {/* Stars */}
      <div onMouseLeave={() => setHover(0)} style={{ display: "flex", justifyContent: "center", gap: 7, marginBottom: 9 }}>
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
      <div style={{ fontFamily: "var(--font-messiri), sans-serif", fontSize: 14, color: "#bf9a3f", height: 21, marginBottom: 4 }}>
        {RATING_LABELS[active] ?? RATING_LABELS[0]}
      </div>

      {/* Everything below appears only after the visitor picks a rating */}
      {rating > 0 && (
        <>
          <div style={{ height: 12 }} />

          {/* Optional service chips (quick taps, shared by both paths) */}
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

          {isHigh ? (
            // ── HAPPY PATH: straight to Google, no writing on our site ──
            writeReviewUrl ? (
              <div>
                <p style={{ fontSize: 13.5, color: "#5d6f67", lineHeight: 1.75, margin: "0 auto 14px", maxWidth: 308 }}>
                  يسعدنا أنّ تجربتك كانت رائعة! اكتب تقييمك على Google مباشرةً — <b style={{ color: "#1c2b25" }}>خطوة واحدة</b>.
                </p>
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
              </div>
            ) : (
              <button className="ma-submit" onClick={saveAndThank} disabled={submitting} style={submitStyle}>
                {submitting ? "جارٍ الإرسال…" : "إرسال التقييم"}
              </button>
            )
          ) : (
            // ── UNHAPPY PATH: private feedback, never sent to Google ──
            <div>
              <p style={{ fontSize: 13.5, color: "#5d6f67", lineHeight: 1.75, margin: "0 0 12px" }}>
                نأسف لذلك — أخبرنا بما يمكننا تحسينه (اختياري). تصل ملاحظتك إلى فريقنا مباشرةً ولن تُنشر.
              </p>
              <textarea
                className="ma-field"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="ما الذي لم يعجبك؟ (اختياري)"
                rows={3}
                style={{ ...fieldStyle, lineHeight: 1.65, resize: "none", minHeight: 84 }}
              />
              <input className="ma-field" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="رقم الجوال للتواصل (اختياري)" style={fieldStyle} />
              <button className="ma-submit" onClick={saveAndThank} disabled={submitting} style={submitStyle}>
                {submitting ? "جارٍ الإرسال…" : "إرسال"}
              </button>
            </div>
          )}

          {error && (
            <p style={{ background: "rgba(220,38,38,.07)", color: "#b4341f", borderRadius: 11, padding: "9px 12px", fontSize: 13, margin: "12px 0 0" }}>
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}

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
