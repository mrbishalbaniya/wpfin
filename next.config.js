/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    WORDPRESS_API_URL: process.env.WORDPRESS_API_URL || 'http://localhost/wp-json/wp/v2',
    JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret-key',
  },
}

module.exports = nextConfig