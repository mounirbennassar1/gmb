import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "عيادات د. مها دحلان للجلدية والتجميل بجدة";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded link-preview image (WhatsApp, X, etc.): the clinic logo on the
// brand-green background. Generated at build time from public/logo.png.
export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #155740 0%, #0e4a39 52%, #0a3a2c 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 230,
            height: 230,
            borderRadius: 48,
            background: "#fbf9f3",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 26px 70px rgba(0,0,0,.4)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={192} height={192} style={{ objectFit: "contain" }} alt="" />
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 70,
            fontWeight: 700,
            letterSpacing: 14,
            color: "#f3ecdd",
          }}
        >
          MAHA DAHLAN
        </div>
        <div style={{ marginTop: 18, fontSize: 32, letterSpacing: 3, color: "#cdb277" }}>
          Dermatology &amp; Aesthetics · Jeddah
        </div>
      </div>
    ),
    { ...size }
  );
}
