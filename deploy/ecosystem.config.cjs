/**
 * PM2 (serveur LWS) : garde le site en marche et le relance après un plantage ou un redémarrage.
 * Démarrage : pm2 start deploy/ecosystem.config.cjs && pm2 save
 */
module.exports = {
  apps: [
    {
      name: 'archi-design',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: __dirname + '/..',
      instances: 1,
      max_memory_restart: '1G',
      env: { NODE_ENV: 'production' },
    },
  ],
}
