// Build info endpoint - returns current build number and deployment info
import { readFileSync } from 'fs';
import { join } from 'path';

let buildInfoCache = null;
let cacheTime = 0;
const CACHE_DURATION = 5000; // 5 seconds cache

function getBuildInfo() {
  const now = Date.now();
  
  // Return cached version if still valid
  if (buildInfoCache && (now - cacheTime) < CACHE_DURATION) {
    return buildInfoCache;
  }
  
  try {
    // Try to read from build-info.json
    const buildInfoPath = join(process.cwd(), 'build-info.json');
    const buildInfo = JSON.parse(readFileSync(buildInfoPath, 'utf8'));
    
    // Cache it
    buildInfoCache = buildInfo;
    cacheTime = now;
    
    return buildInfo;
  } catch (error) {
    // Fallback if file doesn't exist
    return {
      buildNumber: 0,
      buildDate: new Date().toISOString(),
      buildTime: new Date().toLocaleTimeString('ro-RO'),
      gitCommit: 'unknown',
      deployedAt: null,
      error: 'Build info file not found'
    };
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'GET') {
    try {
      const buildInfo = getBuildInfo();
      return res.status(200).json(buildInfo);
    } catch (error) {
      console.error('Error getting build info:', error);
      return res.status(500).json({ 
        error: 'Failed to get build info',
        buildNumber: 0,
        buildDate: new Date().toISOString()
      });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

