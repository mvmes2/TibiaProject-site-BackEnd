module.exports = {
  apps: [
    {
      name: 'tibiaproject-backend',
      cwd: '/home/ubuntu/website-backend/TibiaProject-site-BackEnd',
      script: 'server.js',
      node_args: '-r newrelic',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 20,
      min_uptime: '10s',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
