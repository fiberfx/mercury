// Package the already-verified native release, without compiling or downloading anything.
import { createHash } from 'node:crypto';
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, readlinkSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const here = dirname(fileURLToPath(import.meta.url));
const [mode, input, output] = process.argv.slice(2);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const payload = ['bin/mx', 'bin/hyperscript-lsap', 'COMMIT', 'THIRD_PARTY_NOTICES.txt', 'RUST-STANDARD-LIBRARY.html', 'sha256.sum', 'SOURCE_INPUTS.sha256', 'DYNAMIC_DEPENDENCIES.txt'];
function fail(reason) { throw new Error(`npm release: ${reason}`); }
function manifest(platform = true) {
  const p = JSON.parse(readFileSync(join(here, platform ? 'platform/package.json' : 'package.json')));
  if (p.version !== '0.1.0' || p.scripts || p.dependencies) fail('unexpected version, lifecycle scripts or mandatory dependencies');
  if (platform) {
    if (p.name !== '@fiberfx/mx-linux-x64' || p.bin || JSON.stringify(p.os) !== '["linux"]' || JSON.stringify(p.cpu) !== '["x64"]' || JSON.stringify(p.libc) !== '["glibc"]' || p.optionalDependencies) fail('invalid qualified native package');
  } else if (p.name !== '@fiberfx/mx' || p.bin?.mx !== 'cli.cjs' || p.os || p.cpu || p.libc || JSON.stringify(p.optionalDependencies) !== '{"@fiberfx/mx-linux-x64":"0.1.0"}') fail('invalid root launcher package');
  return p;
}
function verify(directory) {
  if (existsSync(join(directory, 'package.json')) && JSON.stringify(JSON.parse(readFileSync(join(directory, 'package.json')))) !== JSON.stringify(manifest())) fail('packed manifest differs');
  for (const path of payload) {
    const file = join(directory, path);
    if (!lstatSync(file).isFile() || lstatSync(file).isSymbolicLink()) fail(`${path} must be a regular file`);
    if (path.startsWith('bin/')) {
      const bytes = readFileSync(file);
      if (bytes.subarray(0, 4).toString('hex') !== '7f454c46' || bytes[4] !== 2 || bytes[5] !== 1 || bytes.readUInt16LE(18) !== 62)
        fail(`${path} is not Linux x86_64 ELF`);
      if (!(lstatSync(file).mode & 0o111)) fail(`${path} is not executable`);
    }
  }
  if (!/^[0-9a-f]{40}\n$/.test(readFileSync(join(directory, 'COMMIT'), 'utf8'))) fail('invalid COMMIT');
  execFileSync('sha256sum', ['-c', 'sha256.sum'], { cwd: directory, stdio: 'inherit' });
  const lines = readFileSync(join(directory, 'sha256.sum'), 'utf8').trim().split('\n');
  if (lines.length !== 2 || !lines[0].endsWith('  bin/mx') || !lines[1].endsWith('  bin/hyperscript-lsap')) fail('binary checksum inventory differs');
}
if (mode === 'inputs' && input && output) {
  const root = resolve(input), rows = [];
  function walk(rel) {
    const path = join(root, rel), info = lstatSync(path);
    if (info.isSymbolicLink()) rows.push(`${hash(`symlink:${readlinkSync(path)}`)}  ${rel}`);
    else if (info.isDirectory()) {
      if (['target', '.git', '.mx'].includes(rel.split('/').at(-1))) fail(`generated directory in source export: ${rel}`);
      for (const name of readdirSync(path).sort()) walk(`${rel}/${name}`);
    } else if (info.isFile()) rows.push(`${hash(readFileSync(path))}  ${rel}`);
    else fail(`unsupported source entry: ${rel}`);
  }
  for (const path of ['COMMIT', 'SOURCE_DATE_EPOCH', 'fiberfx', 'scripts/mercury', 'sites/mercury/examples/first-page']) walk(path);
  writeFileSync(output, rows.sort().join('\n') + '\n');
} else if (mode === 'pack' && input && output) {
  const source = resolve(input), out = resolve(output);
  verify(source); mkdirSync(out, { recursive: true });
  const epoch = process.env.SOURCE_DATE_EPOCH;
  if (!/^\d+$/.test(epoch ?? '')) fail('SOURCE_DATE_EPOCH is required');
  for (const platform of [true, false]) {
    const temporary = mkdtempSync(join(tmpdir(), 'mx-npm-package-'));
    try {
      const destination = join(temporary, 'package'); mkdirSync(destination);
      const files = platform ? payload : ['COMMIT', 'THIRD_PARTY_NOTICES.txt', 'RUST-STANDARD-LIBRARY.html'];
      for (const path of files) {
        mkdirSync(dirname(join(destination, path)), { recursive: true });
        cpSync(join(source, path), join(destination, path));
        if (hash(readFileSync(join(source, path))) !== hash(readFileSync(join(destination, path)))) fail(`parity failed: ${path}`);
      }
      if (!platform) cpSync(join(here, 'cli.cjs'), join(destination, 'cli.cjs'));
      writeFileSync(join(destination, 'package.json'), JSON.stringify(manifest(platform), null, 2) + '\n');
      const archive = join(out, platform ? 'fiberfx-mx-linux-x64-0.1.0.tgz' : 'fiberfx-mx-0.1.0.tgz');
      execFileSync('tar', ['--sort=name', `--mtime=@${epoch}`, '--owner=0', '--group=0', '--numeric-owner', '-C', temporary, '-czf', archive, 'package']);
      if (lstatSync(archive).size > 67108864) fail('npm archive exceeds 64 MiB');
      console.log(archive);
    } finally { rmSync(temporary, { recursive: true, force: true }); }
  }
} else if (mode === 'parity' && input && output) {
  const temporary = mkdtempSync(join(tmpdir(), 'mx-npm-parity-'));
  try {
    const native = join(temporary, 'native'), npm = join(temporary, 'npm');
    mkdirSync(native); mkdirSync(npm);
    for (const [archive, dir, prefix] of [[input, native, ''], [output, npm, 'package/']]) {
      const names = execFileSync('tar', ['-tzf', resolve(archive)], { encoding: 'utf8' }).trim().split('\n');
      const allowed = new Set(payload.map(p => prefix + p).concat(prefix ? ['package/', 'package/bin/', 'package/package.json'] : ['bin/']));
      for (const name of names) if (!allowed.has(name)) fail(`unexpected archive entry: ${name}`);
      execFileSync('tar', ['-xzf', resolve(archive), '-C', dir]);
    }
    verify(native); verify(join(npm, 'package'));
    for (const path of payload) if (hash(readFileSync(join(native, path))) !== hash(readFileSync(join(npm, 'package', path)))) fail(`archive/npm parity failed: ${path}`);
    console.log(`archive/npm parity: ${payload.length} files identical`);
  } finally { rmSync(temporary, { recursive: true, force: true }); }
} else if (mode === 'check'  && input && !output) {
  manifest(); verify(resolve(input));
} else fail('usage: package.mjs inputs <source> <inventory> | pack <native-stage> <output-directory> | parity <native.tar.gz> <npm.tgz> | check <native-stage>');
