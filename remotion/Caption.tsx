import React from "react";
export function Caption({ text }: { text: string }) {
  return <div style={{
    position: "absolute", bottom: 155, left: 60, right: 60,
    padding: "16px 24px", fontSize: 36, fontWeight: 800,
    textAlign: "center", background: "rgba(0,0,0,.72)", borderRadius: 18
  }}>{text}</div>;
}
