module.exports = {
  apps: [
    {
      name: 'tatu-yotoqxona',
      script: 'src/index.js',
      cwd: '/var/www/tatu-yotoqxona/backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/var/log/tatu-yotoqxona/error.log',
      out_file: '/var/log/tatu-yotoqxona/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
