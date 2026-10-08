import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  serverExternalPackages: ["@remotion/renderer", "fluent-ffmpeg"]
};
export default nextConfig;
