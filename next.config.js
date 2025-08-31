// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = { // Mantenha esta definição
  webpack: (config, { isServer }) => {
    // Apenas empacote firebase-admin no lado do servidor
    if (!isServer) {
      config.externals = {
        ...config.externals, // Mantenha quaisquer outros externals existentes
        'firebase-admin': 'commonjs firebase-admin',
        'net': 'commonjs net', 
        'tls': 'commonjs tls', 
      };
    }

    return config;
  },
  // Suas outras configurações, se houver (ex: images)
  images: {
    domains: ['localhost'], 
  },
};

module.exports = nextConfig; // Exporte a constante nextConfig aqui