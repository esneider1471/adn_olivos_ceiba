import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fija la raíz de Turbopack a este proyecto (evita el warning por los
  // lockfiles de los otros proyectos del workspace).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
