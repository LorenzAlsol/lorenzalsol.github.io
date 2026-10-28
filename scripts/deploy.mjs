// Builds the site and publishes dist/ to the gh-pages branch of this repo.
// GitHub Pages serves that branch. No extra dependencies; needs git and a pushed `origin`.
import { execSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const run = (cmd, cwd) => execSync(cmd, { cwd, stdio: 'inherit' });
const read = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim();

const remote = read('git remote get-url origin');
const name = read('git config user.name');
const email = read('git config user.email');
const rev = read('git rev-parse --short HEAD');

run('npm run build');

const tmp = mkdtempSync(join(tmpdir(), 'folklore-deploy-'));
try {
  cpSync('dist', tmp, { recursive: true });
  writeFileSync(join(tmp, '.nojekyll'), '');
  run('git init -q -b gh-pages', tmp);
  run(`git config user.name "${name}"`, tmp);
  run(`git config user.email "${email}"`, tmp);
  run('git add -A', tmp);
  run(`git commit -q -m "Deploy ${rev}"`, tmp);
  run(`git push --force "${remote}" gh-pages`, tmp);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
console.log('Deployed. GitHub Pages updates in about a minute.');
