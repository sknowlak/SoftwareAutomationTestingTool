/**
 * Setup Script for Betaboss Testing Tool
 *
 * This script:
 * 1. Checks if dependencies are installed
 * 2. Installs dependencies if needed
 * 3. Starts the development server
 * 4. Opens the browser to localhost
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import http from 'http';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = 5173; // Default Vite port
const LOCK_FILE = path.join(__dirname, 'node_modules/.setup-complete');
const MAX_RETRIES = 10;
const RETRY_INTERVAL = 1000; // 1 second

// Check if setup has already been completed
function isSetupComplete() {
  return fs.existsSync(LOCK_FILE);
}

// Mark setup as complete
function markSetupComplete() {
  // Create the directory if it doesn't exist
  const dir = path.dirname(LOCK_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Create the lock file
  fs.writeFileSync(LOCK_FILE, new Date().toISOString());
  console.log('✅ Setup marked as complete');
}

// Check if dependencies are installed
function areDependenciesInstalled() {
  return fs.existsSync(path.join(__dirname, 'node_modules')) &&
         fs.existsSync(path.join(__dirname, 'node_modules/react'));
}

// Install dependencies
function installDependencies() {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error installing dependencies:', error.message);
    return false;
  }
}

// Check if the server is running
function checkServer(retries = 0) {
  return new Promise((resolve, reject) => {
    if (retries >= MAX_RETRIES) {
      return reject(new Error('Max retries reached'));
    }

    http.get(`http://localhost:${PORT}`, (res) => {
      if (res.statusCode === 200) {
        resolve(true);
      } else {
        setTimeout(() => {
          checkServer(retries + 1).then(resolve).catch(reject);
        }, RETRY_INTERVAL);
      }
    }).on('error', (err) => {
      setTimeout(() => {
        checkServer(retries + 1).then(resolve).catch(reject);
      }, RETRY_INTERVAL);
    });
  });
}

// Open browser
function openBrowser() {
  console.log('🌐 Opening browser...');

  const command = process.platform === 'win32' ? 'start' :
                 process.platform === 'darwin' ? 'open' : 'xdg-open';

  try {
    execSync(`${command} http://localhost:${PORT}`);
    console.log('✅ Browser opened successfully');
    return true;
  } catch (error) {
    console.error('❌ Error opening browser:', error.message);
    return false;
  }
}

// Start the development server
function startServer() {
  console.log('🚀 Starting development server...');

  try {
    const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const args = ['run', process.platform === 'win32' ? 'dev:win' : 'dev'];

    // Use execSync for simplicity
    console.log(`Executing: ${command} ${args.join(' ')}`);
    execSync(`${command} ${args.join(' ')}`, {
      stdio: 'inherit',
      cwd: __dirname
    });

    return true;
  } catch (err) {
    console.error('❌ Error starting server:', err.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('🔧 Setting up Betaboss Testing Tool...');

  try {
    // Check if setup is already complete
    if (isSetupComplete()) {
      console.log('✅ Setup already completed');
    } else {
      // Check if dependencies are installed
      if (!areDependenciesInstalled()) {
        const success = installDependencies();
        if (!success) {
          console.error('❌ Failed to install dependencies');
          process.exit(1);
        }
      } else {
        console.log('✅ Dependencies already installed');
      }

      // Mark setup as complete
      markSetupComplete();
    }

    // Start the server
    const serverStarted = startServer();

    if (serverStarted) {
      console.log('✅ Server started successfully');

      // Open the browser
      openBrowser();
    } else {
      console.error('❌ Failed to start server');
    }
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
    process.exit(1);
  }
}

// Run the main function
main();
