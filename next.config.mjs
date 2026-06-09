/** @type {import('next').NextConfig} */
// Static export — the whole app is prebuilt from /data, no server at runtime. Maximally forkable and
// cheap to host. Emoji flags mean we never need the image optimizer.
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
