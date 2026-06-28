import { prisma } from "@/lib/prisma";
import { getSettings, buildWriteReviewUrl, SERVICE_DESC, CLINIC_TAGLINE } from "@/lib/config";
import RatingForm from "./RatingForm";

export const dynamic = "force-dynamic";

const GOLD = "#d8b65f";
const STAR_EMPTY = "rgba(216,182,95,.28)";

const toArabicDigits = (s: string | number) =>
  String(s).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

function avgWord(avg: number): string {
  if (avg >= 4.5) return "ممتاز";
  if (avg >= 3.5) return "جيّد جداً";
  if (avg >= 2.5) return "جيّد";
  return "مقبول";
}

function HeroStars({ value }: { value: number }) {
  const rounded = Math.round(value);
  return (
    <div style={{ direction: "ltr", display: "flex", gap: 3, justifyContent: "flex-end" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path
            d="M12 17.3l-5.4 3.1 1.4-6.1L3 9.9l6.2-.5L12 3.6l2.8 5.8 6.2.5-4.9 4.4 1.4 6.1z"
            fill={n <= rounded ? GOLD : STAR_EMPTY}
          />
        </svg>
      ))}
    </div>
  );
}

export default async function Home() {
  const settings = await getSettings();
  const writeReviewUrl = buildWriteReviewUrl(settings);

  const [count, agg] = await Promise.all([
    prisma.review.count({ where: { status: "approved" } }),
    prisma.review.aggregate({ where: { status: "approved" }, _avg: { rating: true } }),
  ]);
  const avg = agg._avg.rating ?? 0;
  const hasReviews = count > 0;

  const services = settings.serviceTypes.map((label) => ({
    label,
    desc: SERVICE_DESC[label] ?? "",
  }));

  const year = new Date().getFullYear();

  return (
    <div
      style={{
        direction: "rtl",
        minHeight: "100vh",
        background:
          "radial-gradient(130% 75% at 50% -12%, #efece1 0%, #f4f1ea 52%, #f1eee5 100%)",
        fontFamily: "var(--font-plex-arabic), sans-serif",
        color: "#22302b",
        padding: "26px 16px 46px",
      }}
    >
      <div style={{ maxWidth: 464, margin: "0 auto" }}>
        {/* ── HERO ───────────────────────────────────────────────── */}
        <div
          style={{
            position: "relative",
            background:
              "radial-gradient(125% 130% at 82% -12%, #155740 0%, #0e4a39 46%, #0a3a2c 100%)",
            borderRadius: 28,
            padding: "32px 26px 30px",
            boxShadow: "0 26px 56px -28px rgba(10,58,45,.6)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 11,
              border: "1px solid rgba(201,162,74,.26)",
              borderRadius: 19,
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", textAlign: "center" }}>
            {/* Logo card */}
            <div
              style={{
                width: 78,
                height: 78,
                margin: "0 auto 15px",
                borderRadius: 18,
                background: "#fbf9f3",
                boxShadow:
                  "0 10px 22px -12px rgba(0,0,0,.45), inset 0 0 0 1px rgba(201,162,74,.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 8,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt={settings.clinicNameEn}
                width={62}
                height={62}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>

            <div
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontWeight: 600,
                fontSize: 22,
                letterSpacing: ".28em",
                color: "#f3ecdd",
                paddingRight: ".28em",
              }}
            >
              {settings.clinicNameEn}
            </div>
            <div
              style={{
                fontFamily: "var(--font-messiri), sans-serif",
                fontSize: 13.5,
                color: "#cdb277",
                marginTop: 7,
                letterSpacing: ".02em",
              }}
            >
              {CLINIC_TAGLINE}
            </div>

            <div
              style={{
                width: 44,
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, rgba(201,162,74,.75), transparent)",
                margin: "19px auto",
              }}
            />

            {/* Rating summary */}
            {hasReviews ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
                <div
                  style={{
                    fontFamily: "var(--font-cormorant), serif",
                    fontWeight: 600,
                    fontSize: 54,
                    lineHeight: 1,
                    color: "#f4eddd",
                  }}
                >
                  {avg.toFixed(1)}
                </div>
                <div style={{ textAlign: "right" }}>
                  <HeroStars value={avg} />
                  <div
                    style={{
                      fontFamily: "var(--font-messiri), sans-serif",
                      color: "#e8dcc0",
                      fontSize: 12.5,
                      marginTop: 6,
                    }}
                  >
                    {avgWord(avg)} ·{" "}
                    <span style={{ color: "#b29c6f" }}>
                      بناءً على {toArabicDigits(count)} تقييم
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div style={{ direction: "ltr", display: "flex", justifyContent: "center", gap: 4, marginBottom: 8 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <svg key={n} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                      <path
                        d="M12 17.3l-5.4 3.1 1.4-6.1L3 9.9l6.2-.5L12 3.6l2.8 5.8 6.2.5-4.9 4.4 1.4 6.1z"
                        fill={STAR_EMPTY}
                      />
                    </svg>
                  ))}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-messiri), sans-serif",
                    color: "#cdb277",
                    fontSize: 13,
                  }}
                >
                  نسعد بسماع رأيك في تجربتك
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RATE & REVIEW BOX ──────────────────────────────────── */}
        <div
          style={{
            position: "relative",
            marginTop: -30,
            background: "#ffffff",
            borderRadius: 24,
            padding: "26px 22px 24px",
            boxShadow: "0 20px 46px -24px rgba(14,74,57,.32)",
            border: "1px solid rgba(14,74,57,.07)",
          }}
        >
          <RatingForm
            writeReviewUrl={writeReviewUrl}
            services={services}
            heading={settings.headline}
            sub={settings.subheadline}
          />
        </div>

        <div style={{ textAlign: "center", marginTop: 28 }}>
          <div
            style={{
              fontFamily: "var(--font-cormorant), serif",
              letterSpacing: ".22em",
              fontSize: 12,
              color: "#9aa8a1",
            }}
          >
            © {year} · {settings.clinicNameEn}
          </div>
        </div>
      </div>
    </div>
  );
}
