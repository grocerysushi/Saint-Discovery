// Runs inside the Codex sandbox; do not start a workflow without its proxy.
const value = process.env.HTTPS_PROXY || process.env.https_proxy;
const proxy = value && new URL(value);
if (!proxy || !['http:', 'https:'].includes(proxy.protocol) ||
    !['127.0.0.1', 'localhost', '[::1]'].includes(proxy.hostname) ||
    process.env.NODE_USE_ENV_PROXY !== '1' || process.versions.node !== '22.23.4') {
  throw new Error('Required Codex loopback proxy or pinned Node runtime unavailable');
}
console.error('Saint Discovery: sandbox proxy active; Node v' + process.versions.node);
