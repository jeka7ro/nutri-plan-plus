// Script to update build number - run this before deploy
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const buildInfoPath = join(process.cwd(), 'build-info.json');

try {
  // Read current build info
  let buildInfo;
  try {
    const content = readFileSync(buildInfoPath, 'utf8');
    buildInfo = JSON.parse(content);
  } catch (error) {
    // If file doesn't exist, create default
    buildInfo = {
      buildNumber: 0,
      buildDate: new Date().toISOString(),
      buildTime: new Date().toLocaleTimeString('ro-RO'),
      gitCommit: 'unknown',
      deployedAt: null
    };
  }
  
  // Get git commit hash
  let gitCommit = 'unknown';
  try {
    gitCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.warn('Could not get git commit hash');
  }
  
  // Increment build number
  buildInfo.buildNumber = (buildInfo.buildNumber || 0) + 1;
  
  // Update build date and time
  const now = new Date();
  buildInfo.buildDate = now.toISOString();
  buildInfo.buildTime = now.toLocaleTimeString('ro-RO', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    timeZone: 'Europe/Bucharest'
  });
  buildInfo.gitCommit = gitCommit;
  buildInfo.deployedAt = now.toISOString();
  
  // Write back to file
  writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2), 'utf8');
  
  console.log(`✅ Build number updated to ${buildInfo.buildNumber}`);
  console.log(`📅 Build date: ${buildInfo.buildDate}`);
  console.log(`🕐 Build time: ${buildInfo.buildTime}`);
  console.log(`🔗 Git commit: ${gitCommit}`);
  
} catch (error) {
  console.error('❌ Error updating build info:', error);
  process.exit(1);
}

