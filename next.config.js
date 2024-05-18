/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },
  images: {
    domains: [
      "m.media-amazon.com",
      "media6.ppl-media.com",
      "www.snitch.co.in",
      "n4.sdlcdn.com",
      "n1.sdlcdn.com",
    ],
  },
};

module.exports = nextConfig;
