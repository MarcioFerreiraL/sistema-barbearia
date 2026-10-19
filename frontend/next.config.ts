import type { NextConfig } from "next";

// A demo pública é um site estático (sem servidor): o backend roda no navegador.
const demo = process.env.NEXT_PUBLIC_DEMO === "1";

const nextConfig: NextConfig = {
  ...(demo ? { output: "export" as const } : {}),
};

export default nextConfig;
