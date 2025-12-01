// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'erp-front',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/erp-front',
      watch: false,
    },
  ],
}
