#!/usr/bin/env node

/**
 * Vercel MCP Authentication Setup Script
 * Handles CLI-based authentication for Vercel MCP integration
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VercelAuthManager {
  constructor() {
    this.configDir = path.join(os.homedir(), '.vercel');
    this.configFile = path.join(this.configDir, 'auth.json');
    this.tokenFile = path.join(this.configDir, 'token');
  }

  /**
   * Check if Vercel CLI is installed
   */
  async checkVercelCLI() {
    try {
      execSync('vercel --version', { stdio: 'pipe' });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Install Vercel CLI if not present
   */
  async installVercelCLI() {
    console.log('📦 Installing Vercel CLI...');
    try {
      execSync('npm install -g vercel', { stdio: 'inherit' });
      console.log('✅ Vercel CLI installed successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to install Vercel CLI:', error.message);
      return false;
    }
  }

  /**
   * Check if user is already authenticated
   */
  async isAuthenticated() {
    try {
      // Check for token file
      await fs.access(this.tokenFile);
      const token = await fs.readFile(this.tokenFile, 'utf8');
      
      if (token.trim()) {
        // Verify token is valid
        try {
          execSync('vercel whoami', { stdio: 'pipe' });
          return { authenticated: true, token: token.trim() };
        } catch (error) {
          console.log('⚠️  Token exists but is invalid, re-authenticating...');
          return { authenticated: false };
        }
      }
    } catch (error) {
      // Token file doesn't exist
    }

    return { authenticated: false };
  }

  /**
   * Authenticate via Vercel CLI login
   */
  async authenticateViaCLI() {
    console.log('🔐 Starting Vercel CLI authentication...');
    console.log('📱 This will open your browser to complete authentication');
    
    return new Promise((resolve, reject) => {
      const vercelLogin = spawn('vercel', ['login'], {
        stdio: 'inherit',
        shell: true
      });

      vercelLogin.on('close', async (code) => {
        if (code === 0) {
          try {
            // Get the authenticated user info
            const whoami = execSync('vercel whoami', { encoding: 'utf8' });
            console.log(`✅ Authenticated as: ${whoami.trim()}`);
            
            // Extract token from config
            const token = await this.extractTokenFromConfig();
            resolve({ success: true, token, user: whoami.trim() });
          } catch (error) {
            reject(new Error('Failed to verify authentication'));
          }
        } else {
          reject(new Error('Authentication failed'));
        }
      });

      vercelLogin.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Extract token from Vercel config
   */
  async extractTokenFromConfig() {
    try {
      // Try to read from token file first
      const token = await fs.readFile(this.tokenFile, 'utf8');
      return token.trim();
    } catch (error) {
      // Fallback: try to extract from auth.json
      try {
        const authData = await fs.readFile(this.configFile, 'utf8');
        const auth = JSON.parse(authData);
        return auth.token;
      } catch (error) {
        // Last resort: try to get token from vercel whoami command
        try {
          const whoamiOutput = execSync('vercel whoami', { encoding: 'utf8' });
          console.log('✅ User authenticated:', whoamiOutput.trim());
          
          // Try to find token in config directory
          const configFiles = await fs.readdir(this.configDir);
          for (const file of configFiles) {
            if (file.includes('token') || file.includes('auth')) {
              try {
                const content = await fs.readFile(path.join(this.configDir, file), 'utf8');
                if (content.trim() && content.length > 20) {
                  return content.trim();
                }
              } catch (e) {
                continue;
              }
            }
          }
          
          // If we can't find a token file, we'll need to use the CLI directly
          console.log('⚠️  Could not extract token, will use CLI authentication');
          return 'CLI_AUTHENTICATED';
        } catch (error) {
          throw new Error('Could not extract token from Vercel config');
        }
      }
    }
  }

  /**
   * Get team information
   */
  async getTeamInfo() {
    try {
      const teamsOutput = execSync('vercel teams list', { encoding: 'utf8' });
      const lines = teamsOutput.split('\n').filter(line => line.trim());
      
      const teams = [];
      for (const line of lines) {
        if (line.includes('@')) {
          const parts = line.split(/\s+/);
          if (parts.length >= 2) {
            teams.push({
              name: parts[0],
              id: parts[1],
              type: parts[0].includes('@') ? 'personal' : 'team'
            });
          }
        }
      }
      
      return teams;
    } catch (error) {
      console.log('⚠️  Could not fetch team information');
      return [];
    }
  }

  /**
   * Setup environment variables
   */
  async setupEnvironmentVariables(token, teamId = null) {
    const envFile = path.join(__dirname, '..', '.env.local');
    
    let envContent = `# Vercel MCP Configuration
VERCEL_TOKEN=${token}
`;

    if (teamId) {
      envContent += `VERCEL_TEAM_ID=${teamId}\n`;
    }

    try {
      await fs.writeFile(envFile, envContent);
      console.log(`✅ Environment variables written to ${envFile}`);
    } catch (error) {
      console.error('❌ Failed to write environment file:', error.message);
    }
  }

  /**
   * Create MCP configuration for Cursor
   */
  async createMCPConfig(token, teamId = null) {
    const mcpConfig = {
      mcpServers: {
        "vercel-petrescue": {
          command: "node",
          args: [path.join(__dirname, "..", "advanced-deploy.js")],
          env: {
            VERCEL_TOKEN: token,
            ...(teamId && { VERCEL_TEAM_ID: teamId })
          }
        }
      }
    };

    const configPath = path.join(os.homedir(), '.cursor', 'mcp.json');
    
    try {
      // Ensure .cursor directory exists
      await fs.mkdir(path.dirname(configPath), { recursive: true });
      
      // Write MCP configuration
      await fs.writeFile(configPath, JSON.stringify(mcpConfig, null, 2));
      console.log(`✅ MCP configuration written to ${configPath}`);
      
      return configPath;
    } catch (error) {
      console.error('❌ Failed to create MCP configuration:', error.message);
      throw error;
    }
  }

  /**
   * Main setup process
   */
  async setup() {
    console.log('🚀 Vercel MCP Authentication Setup');
    console.log('=====================================\n');

    // Check if Vercel CLI is installed
    const cliInstalled = await this.checkVercelCLI();
    if (!cliInstalled) {
      console.log('❌ Vercel CLI not found');
      const installed = await this.installVercelCLI();
      if (!installed) {
        console.error('❌ Setup failed: Could not install Vercel CLI');
        process.exit(1);
      }
    } else {
      console.log('✅ Vercel CLI is installed');
    }

    // Check authentication status
    const authStatus = await this.isAuthenticated();
    let token, user;

    if (authStatus.authenticated) {
      console.log('✅ Already authenticated');
      token = authStatus.token;
      user = execSync('vercel whoami', { encoding: 'utf8' }).trim();
    } else {
      // Authenticate
      try {
        const authResult = await this.authenticateViaCLI();
        token = authResult.token;
        user = authResult.user;
      } catch (error) {
        console.error('❌ Authentication failed:', error.message);
        process.exit(1);
      }
    }

    // Get team information
    console.log('\n📋 Fetching team information...');
    const teams = await this.getTeamInfo();
    
    let selectedTeam = null;
    if (teams.length > 1) {
      console.log('\nAvailable teams:');
      teams.forEach((team, index) => {
        console.log(`  ${index + 1}. ${team.name} (${team.id})`);
      });
      
      // For now, use the first team (can be enhanced with interactive selection)
      selectedTeam = teams[0];
      console.log(`\n✅ Using team: ${selectedTeam.name} (${selectedTeam.id})`);
    } else if (teams.length === 1) {
      selectedTeam = teams[0];
      console.log(`✅ Using team: ${selectedTeam.name} (${selectedTeam.id})`);
    }

    // Setup environment variables
    console.log('\n🔧 Setting up environment variables...');
    await this.setupEnvironmentVariables(token, selectedTeam?.id);

    // Create MCP configuration
    console.log('\n⚙️  Creating MCP configuration for Cursor...');
    const configPath = await this.createMCPConfig(token, selectedTeam?.id);

    console.log('\n🎉 Setup completed successfully!');
    console.log('=====================================');
    console.log(`👤 Authenticated as: ${user}`);
    if (selectedTeam) {
      console.log(`👥 Team: ${selectedTeam.name} (${selectedTeam.id})`);
    }
    console.log(`🔑 Token: ${token.substring(0, 10)}...`);
    console.log(`📁 MCP Config: ${configPath}`);
    console.log('\n📝 Next steps:');
    console.log('1. Restart Cursor to load the new MCP configuration');
    console.log('2. Use @vercel commands in Cursor Composer');
    console.log('3. Test with: node advanced-deploy.js list');
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const authManager = new VercelAuthManager();
  
  authManager.setup()
    .then(() => {
      console.log('\n✅ Authentication setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Setup failed:', error.message);
      process.exit(1);
    });
}

export { VercelAuthManager };
