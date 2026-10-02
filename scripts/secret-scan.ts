/**
 * Lightweight tracked-file secret scan.
 * Reports only rule name and location; matched values are never printed.
 */

import fs from 'fs';
import { execFileSync } from 'child_process';

type Finding = { file: string; line: number; rule: string };

const config = JSON.parse(fs.readFileSync('.secret-scanner.json', 'utf8')) as {
  allowlistedValues: string[];
};

let files: string[] = [];
try {
  files = execFileSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    { encoding: 'utf8' }
  )
    .split('\0')
    .filter(Boolean);
} catch {
  // Fallback if not inside a git repository
  function walkDir(dir: string): string[] {
    const list: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (['node_modules', 'dist', '.git', 'data', '.npm'].includes(entry.name)) continue;
      const res = `${dir}/${entry.name}`;
      if (entry.isDirectory()) {
        list.push(...walkDir(res));
      } else {
        list.push(res.replace(/^\.\//, ''));
      }
    }
    return list;
  }
  files = walkDir('.');
}

const rules = [
  {
    name: 'private-key-material',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/
  },
  {
    name: 'credential-in-connection-url',
    pattern: /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^:\s/@]+:([^@\s/]+)@/i
  },
  {
    name: 'known-provider-token',
    pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30,})\b/
  },
  {
    name: 'sensitive-setting-literal',
    pattern: /\b(?:JWT_SECRET|POSTGRES_PASSWORD|DATABASE_PASSWORD|API_KEY|ACCESS_TOKEN|PRIVATE_KEY)\s*[:=]\s*["']?([^\s,"'}]{12,})/i
  }
];

const findings: Finding[] = [];

for (const file of files) {
  let content: string;
  try {
    content = fs.readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  if (content.includes('\0')) continue;

  content.split(/\r?\n/).forEach((line, index) => {
    if (config.allowlistedValues.some((value) => line.includes(value))) return;
    for (const rule of rules) {
      const match = line.match(rule.pattern);
      if (!match) continue;
      const candidate = match[1] || match[0];
      if (
        candidate === '' ||
        candidate.startsWith('${') ||
        candidate.startsWith('<') ||
        candidate.includes('process.env')
      ) {
        continue;
      }
      findings.push({ file, line: index + 1, rule: rule.name });
    }
  });
}

if (findings.length > 0) {
  console.error(`Secret scan failed with ${findings.length} potential finding(s). Values are redacted.`);
  for (const finding of findings) {
    console.error(`${finding.file}:${finding.line} [${finding.rule}] [REDACTED]`);
  }
  process.exit(1);
}

console.log(`Secret scan passed for ${files.length} tracked files; no matched values were printed.`);
