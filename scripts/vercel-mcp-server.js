#!/usr/bin/env node

/**
 * Vercel MCP Server with CLI Authentication
 * This server uses the Vercel CLI for authentication instead of tokens
 */

import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { execSync } from 'child_process';
import { PetRescueDeployer } from '../advanced-deploy.js';

// Verify Vercel CLI authentication
function verifyVercelAuth() {
  try {
    const user = execSync('vercel whoami', { encoding: 'utf8' }).trim();
    return { authenticated: true, user };
  } catch (error) {
    throw new Error('Vercel CLI not authenticated. Run "vercel login" first.');
  }
}

// Get team information
function getTeamInfo() {
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

// Create MCP handler
const mcpHandler = createMcpHandler(
  (server) => {
    // Verify authentication on startup
    const auth = verifyVercelAuth();
    console.log(`✅ Authenticated as: ${auth.user}`);
    
    const deployer = new PetRescueDeployer();
    const teams = getTeamInfo();
    const defaultTeam = teams.length > 0 ? teams[0] : null;

    server.tool(
      "deploy_storefront",
      "Deploy PetRescue Brasil storefront to Vercel using CLI authentication",
      {
        teamId: z.string().optional().describe("Vercel team ID (optional, uses default if not provided)"),
      },
      async ({ teamId }) => {
        try {
          // Use provided team ID or default
          const selectedTeamId = teamId || defaultTeam?.id;
          
          if (selectedTeamId) {
            process.env.VERCEL_TEAM_ID = selectedTeamId;
          }

          const deployment = await deployer.deployStorefront();
          
          return {
            content: [
              {
                type: "text",
                text: `✅ Storefront deployed successfully!\n\n🔗 URL: ${deployment.url}\n📊 Inspect: ${deployment.inspectorUrl}\n⏰ Created: ${new Date(deployment.createdAt).toISOString()}\n👤 User: ${auth.user}${selectedTeamId ? `\n👥 Team: ${selectedTeamId}` : ''}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Deployment failed: ${error.message}`,
              },
            ],
          };
        }
      }
    );

    server.tool(
      "get_deployment_status",
      "Get the status of a Vercel deployment using CLI authentication",
      {
        deploymentId: z.string().describe("Deployment ID or URL"),
        teamId: z.string().optional().describe("Vercel team ID (optional)"),
      },
      async ({ deploymentId, teamId }) => {
        try {
          const selectedTeamId = teamId || defaultTeam?.id;
          
          if (selectedTeamId) {
            process.env.VERCEL_TEAM_ID = selectedTeamId;
          }

          const status = await deployer.getDeploymentStatus(deploymentId);
          
          return {
            content: [
              {
                type: "text",
                text: `📊 Deployment Status:\n\n🆔 ID: ${status.id}\n🔗 URL: ${status.url}\n📈 State: ${status.state}\n✅ Ready: ${status.readyState}\n⏰ Created: ${new Date(status.createdAt).toISOString()}\n👤 User: ${auth.user}${selectedTeamId ? `\n👥 Team: ${selectedTeamId}` : ''}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Failed to get deployment status: ${error.message}`,
              },
            ],
          };
        }
      }
    );

    server.tool(
      "list_deployments",
      "List recent Vercel deployments using CLI authentication",
      {
        teamId: z.string().optional().describe("Vercel team ID (optional)"),
      },
      async ({ teamId }) => {
        try {
          const selectedTeamId = teamId || defaultTeam?.id;
          
          if (selectedTeamId) {
            process.env.VERCEL_TEAM_ID = selectedTeamId;
          }

          const deployments = await deployer.listDeployments();
          
          const deploymentList = deployments.map(d => 
            `🆔 ${d.id}\n🔗 ${d.url}\n📈 ${d.state}\n⏰ ${new Date(d.createdAt).toISOString()}\n`
          ).join('\n');
          
          return {
            content: [
              {
                type: "text",
                text: `📋 Recent Deployments:\n\n${deploymentList}\n👤 User: ${auth.user}${selectedTeamId ? `\n👥 Team: ${selectedTeamId}` : ''}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Failed to list deployments: ${error.message}`,
              },
            ],
          };
        }
      }
    );

    server.tool(
      "list_teams",
      "List available Vercel teams using CLI authentication",
      {},
      async () => {
        try {
          const teams = getTeamInfo();
          
          const teamList = teams.map(team => 
            `👥 ${team.name} (${team.id}) - ${team.type}`
          ).join('\n');
          
          return {
            content: [
              {
                type: "text",
                text: `📋 Available Teams:\n\n${teamList}\n👤 Authenticated as: ${auth.user}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Failed to list teams: ${error.message}`,
              },
            ],
          };
        }
      }
    );

    server.tool(
      "vercel_auth_status",
      "Check Vercel CLI authentication status",
      {},
      async () => {
        try {
          const auth = verifyVercelAuth();
          const teams = getTeamInfo();
          
          return {
            content: [
              {
                type: "text",
                text: `✅ Vercel CLI Authentication Status:\n\n👤 User: ${auth.user}\n👥 Teams: ${teams.length}\n🔧 CLI Version: ${execSync('vercel --version', { encoding: 'utf8' }).trim()}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Authentication check failed: ${error.message}`,
              },
            ],
          };
        }
      }
    );
  },
  {
    capabilities: {
      tools: {
        deploy_storefront: {
          description: "Deploy PetRescue Brasil storefront to Vercel using CLI authentication",
        },
        get_deployment_status: {
          description: "Get the status of a Vercel deployment using CLI authentication",
        },
        list_deployments: {
          description: "List recent Vercel deployments using CLI authentication",
        },
        list_teams: {
          description: "List available Vercel teams using CLI authentication",
        },
        vercel_auth_status: {
          description: "Check Vercel CLI authentication status",
        },
      },
    },
  }
);

// Export the handler
export { mcpHandler };

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Starting Vercel MCP Server with CLI Authentication...');
  
  try {
    const auth = verifyVercelAuth();
    console.log(`✅ Authenticated as: ${auth.user}`);
    
    const teams = getTeamInfo();
    console.log(`👥 Found ${teams.length} team(s)`);
    
    console.log('🎉 Vercel MCP Server ready!');
    console.log('📝 Available tools:');
    console.log('  - deploy_storefront');
    console.log('  - get_deployment_status');
    console.log('  - list_deployments');
    console.log('  - list_teams');
    console.log('  - vercel_auth_status');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}


