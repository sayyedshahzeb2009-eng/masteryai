import type { NextConfig } from 'next';

const isGithubPages = process.env.GITHUB_ACTIONS === 'true';
const repoName = 'masteryai';

const nextConfig: NextConfig = {
  // GitHub Pages serves this project under /masteryai/.
  output: 'export',
  trailingSlash: true,
  basePath: isGithubPages ? `/${repoName}` : '',
  assetPrefix: isGithubPages ? `/${repoName}/` : '',
  images: { unoptimized: true },
};

export default nextConfig;
