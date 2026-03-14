import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at top left, rgba(14,165,233,0.18), transparent 28%), radial-gradient(circle at 85% 10%, rgba(139,92,246,0.16), transparent 30%), linear-gradient(135deg, #fbfaf8 0%, #f8fafc 100%)",
          color: "#0f172a",
          padding: "52px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            borderRadius: "42px",
            border: "1px solid rgba(255,255,255,0.85)",
            background: "rgba(255,255,255,0.88)",
            boxShadow: "0 28px 70px -42px rgba(15,23,42,0.35)",
            padding: "56px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                display: "flex",
                width: "74px",
                height: "74px",
                borderRadius: "24px",
                background: "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 55%, #10b981 100%)",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "38px", fontWeight: 700 }}>Ops Toolkit</div>
              <div style={{ fontSize: "22px", color: "#475569" }}>Focused operations tools for real daily work</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
            <div style={{ fontSize: "72px", lineHeight: 1.02, fontWeight: 700 }}>
              Replace spreadsheets, chat threads, and manual ops work with clearer tools.
            </div>
            <div style={{ fontSize: "30px", lineHeight: 1.4, color: "#475569" }}>
              Public utilities, protected workspace modules, and lightweight team workflows for warehouses, HR, admin, and operations teams.
            </div>
          </div>
          <div style={{ display: "flex", gap: "18px" }}>
            {["UAE overtime", "Petty cash", "SKU barcodes", "Team workspace"].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "999px",
                  border: "1px solid rgba(148,163,184,0.3)",
                  background: "rgba(255,255,255,0.92)",
                  padding: "14px 22px",
                  fontSize: "22px",
                  color: "#334155",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}