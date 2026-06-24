import { ImageResponse } from "next/og";

export const alt = "サークルリンク — サークルメンバー募集";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          background: "#fffdf8",
          fontFamily: "sans-serif",
        }}
      >
        {/* brand mark: amber squircle with two interlocking rings */}
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: 36,
            background: "#fbbf24",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex" }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, border: "12px solid #fff" }} />
            <div
              style={{ width: 56, height: 56, borderRadius: 999, border: "12px solid #fff", marginLeft: -22 }}
            />
          </div>
        </div>

        <div style={{ display: "flex", marginTop: 40, fontSize: 88, fontWeight: 800 }}>
          <span style={{ color: "#3a2f25" }}>Circle</span>
          <span style={{ color: "#f59e0b" }}>Link</span>
        </div>
        <div style={{ marginTop: 12, fontSize: 30, color: "#8b7e6f" }}>
          Find your circle. Start chatting.
        </div>
      </div>
    ),
    { ...size },
  );
}
