declare module "next-pwa" {
  import { NextConfig } from "next";
  
  interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    buildExcludes?: RegExp[];
    publicExcludes?: string[];
    sw?: string;
    swcMinify?: boolean;
    workboxOptions?: Record<string, unknown>;
  }
  
  function withPWA(config?: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  
  export default withPWA;
}

