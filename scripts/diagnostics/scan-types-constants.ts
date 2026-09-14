import fs from 'fs';
import path from 'path';
interface ScanResult {
    file: string;
    interfaces: string[];
    types: string[];
    constants: string[];
}

function scanDir(dir: string, baseDir: string, results: ScanResult[]) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (['node_modules', '.next', '.expo', 'dist', 'build', '.git'].includes(entry.name)) {
                continue;
            }
            scanDir(fullPath, baseDir, results);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

            const interfaces: string[] = [];
            const types: string[] = [];
            const constants: string[] = [];
            // Regexes
            const interfaceRegex = /(?:export\s+)?interface\s+([A-Za-z0-9_]+)/g;
            const typeRegex = /(?:export\s+)?type\s+([A-Za-z0-9_]+)\s*=/g;
            const constRegex = /export\s+const\s+([A-Za-z0-9_]+)/g;
            let m;
            while ((m = interfaceRegex.exec(content)) !== null) {
                interfaces.push(m[1]);
            }
            while ((m = typeRegex.exec(content)) !== null) {
                types.push(m[1]);
            }
            while ((m = constRegex.exec(content)) !== null) {
                // filter out React components that start with uppercase if they are not constants
                constants.push(m[1]);
            }
            if (interfaces.length > 0 || types.length > 0 || constants.length > 0) {
                results.push({
                    file: relPath,
                    interfaces,
                    types,
                    constants,
                });
            }
        }
    }
}

const rootDir = process.cwd();
const webResults: ScanResult[] = [];
const mobileResults: ScanResult[] = [];
scanDir(path.join(rootDir, 'apps/web'), rootDir, webResults);
scanDir(path.join(rootDir, 'apps/mobile'), rootDir, mobileResults);
console.log('=== WEB APP SCAN RESULTS ===');
console.log(JSON.stringify(webResults, null, 2));
console.log('\n=== MOBILE APP SCAN RESULTS ===');
console.log(JSON.stringify(mobileResults, null, 2));
