/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'be43f77103.clvaw-cdnwnd.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Required so Next.js can use native Node.js modules (sqlite3, pdfkit) in route handlers
  serverExternalPackages: ['sqlite3', 'pdfkit', '@libsql/client', '@libsql/linux-x64-musl'],
};

export default nextConfig;
