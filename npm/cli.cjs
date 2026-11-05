#!/usr/bin/env node
'use strict';
const { spawnSync } = require('node:child_process');
const { constants } = require('node:os');
// Add a target only after its native package has been built, verified and published.
const QUALIFIED = { 'linux-x64-glibc': '@fiberfx/mx-linux-x64' };
function select(platform, arch, glibc) {
  const family = platform === 'linux' ? (glibc ? 'glibc' : 'musl') : 'native';
  const name = QUALIFIED[`${platform}-${arch}-${family}`];
  if (!name) throw Error(`unsupported platform ${platform}/${arch}/${family}; this release provides Linux x64/glibc only`);
  if (platform === 'linux') {
    const [major, minor] = glibc.split('.').map(Number);
    if (!Number.isInteger(major) || !Number.isInteger(minor) || major < 2 || (major === 2 && minor < 39)) throw Error(`glibc ${glibc} is too old or unknown; mx requires glibc >=2.39`);
  }
  return name;
}
function invoke(args, { platform = process.platform, arch = process.arch,
  glibc = process.report?.getReport().header.glibcVersionRuntime,
  resolve = require.resolve, spawn = spawnSync } = {}) {
  const name = select(platform, arch, glibc);
  let binary;
  try { binary = resolve(`${name}/bin/mx`); }
  catch { throw Error(`missing optional package ${name}@0.1.0; reinstall @fiberfx/mx with optional dependencies enabled on a supported platform. No binary will be downloaded by this launcher`); }
  const result = spawn(binary, args, { stdio: 'inherit', cwd: process.cwd(), env: process.env, shell: false });
  if (result.error) throw Error(`cannot execute ${binary}: ${result.error.message}`);
  return { status: result.status, signal: result.signal };
}
if (require.main === module) {
  try {
    const result = invoke(process.argv.slice(2));
    if (result.signal) {
      try { process.kill(process.pid, result.signal); }
      catch { /* Some hosts cannot re-raise the child's signal. Preserve its conventional exit code. */ }
      process.exitCode = 128 + (constants.signals[result.signal] || 1);
    } else process.exitCode = result.status ?? 1;
  } catch (error) { console.error(`mx: ${error.message}`); process.exitCode = 1; }
}
module.exports = { select, invoke };
