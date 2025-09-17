#!/usr/bin/env node

/**
 * Advanced PetRescue Brasil Deployment Script
 * Uses Vercel SDK for programmatic deployment control
 */

import { Vercel } from "@vercel/sdk";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

// Configuration
const CONFIG = {
  // Vercel configuration
  vercel: {
    bearerToken: process.env.VERCEL_TOKEN,
    teamId: process.env.VERCEL_TEAM_ID || "arthurs-projects-129b2cca",
    projectName: "petrescue-brasil-storefront",
  },
  
  // Deployment settings
  deployment: {
    target: "production",
    buildCommand: "npm run build",
    installCommand: "npm ci",
    outputDirectory: ".next",
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: "https://api.petrescue.org.br",
    NEXT_PUBLIC_BASE_URL: "https://app.petrescue.org.br",
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: "pk_live_petrescue_brasil",
    NEXT_PUBLIC_DEFAULT_REGION: "br",
    REVALIDATE_SECRET: process.env.REVALIDATE_SECRET || "petrescue-brasil-revalidate-secret-32-chars",
  }
};

class PetRescueDeployer {
  constructor() {
    this.vercel = new Vercel({
      bearerToken: CONFIG.vercel.bearerToken,
    });
  }

  async deployStorefront() {
    console.log("🚀 Starting PetRescue Brasil Storefront Deployment...");
    
    try {
      // Check if we have a bearer token
      if (!CONFIG.vercel.bearerToken) {
        throw new Error("VERCEL_TOKEN environment variable is required");
      }

      // Get project information
      console.log("📋 Getting project information...");
      const projects = await this.vercel.projects.getProjects({
        teamId: CONFIG.vercel.teamId,
      });

      let project = projects.find(p => p.name === CONFIG.vercel.projectName);
      
      if (!project) {
        console.log("📦 Creating new project...");
        project = await this.vercel.projects.createProject({
          teamId: CONFIG.vercel.teamId,
          requestBody: {
            name: CONFIG.vercel.projectName,
            framework: "nextjs",
            buildCommand: CONFIG.deployment.buildCommand,
            installCommand: CONFIG.deployment.installCommand,
            outputDirectory: CONFIG.deployment.outputDirectory,
          },
        });
      }

      console.log(`✅ Project: ${project.name} (${project.id})`);

      // Set environment variables
      console.log("🔧 Setting environment variables...");
      for (const [key, value] of Object.entries(CONFIG.env)) {
        try {
          await this.vercel.projects.createEnvironmentVariable({
            projectId: project.id,
            teamId: CONFIG.vercel.teamId,
            requestBody: {
              key,
              value,
              target: ["production"],
            },
          });
          console.log(`  ✅ ${key}`);
        } catch (error) {
          console.log(`  ⚠️  ${key} (may already exist)`);
        }
      }

      // Create deployment
      console.log("🚀 Creating deployment...");
      const deployment = await this.vercel.deployments.createDeployment({
        teamId: CONFIG.vercel.teamId,
        requestBody: {
          name: CONFIG.vercel.projectName,
          project: project.id,
          target: CONFIG.deployment.target,
          gitSource: {
            type: "github",
            ref: "main",
            repoId: 123456789, // Replace with actual repo ID
          },
        },
      });

      console.log(`✅ Deployment created: ${deployment.url}`);
      console.log(`🔗 Inspect: ${deployment.inspectorUrl}`);

      // Wait for deployment to complete
      console.log("⏳ Waiting for deployment to complete...");
      await this.waitForDeployment(deployment.id);

      console.log("🎉 Deployment completed successfully!");
      console.log(`🌐 Storefront URL: ${deployment.url}`);
      
      return deployment;

    } catch (error) {
      console.error("❌ Deployment failed:", error.message);
      throw error;
    }
  }

  async waitForDeployment(deploymentId, maxWaitTime = 300000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const deployment = await this.vercel.deployments.getDeployment({
          idOrUrl: deploymentId,
          teamId: CONFIG.vercel.teamId,
        });

        console.log(`  Status: ${deployment.state}`);

        if (deployment.state === "READY") {
          return deployment;
        } else if (deployment.state === "ERROR") {
          throw new Error("Deployment failed");
        }

        // Wait 10 seconds before checking again
        await new Promise(resolve => setTimeout(resolve, 10000));
      } catch (error) {
        console.error("Error checking deployment status:", error.message);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    throw new Error("Deployment timeout");
  }

  async getDeploymentStatus(deploymentId) {
    try {
      const deployment = await this.vercel.deployments.getDeployment({
        idOrUrl: deploymentId,
        teamId: CONFIG.vercel.teamId,
      });

      return {
        id: deployment.id,
        url: deployment.url,
        state: deployment.state,
        readyState: deployment.readyState,
        createdAt: deployment.createdAt,
        ready: deployment.ready,
      };
    } catch (error) {
      throw new Error(`Failed to get deployment status: ${error.message}`);
    }
  }

  async listDeployments() {
    try {
      const deployments = await this.vercel.deployments.getDeployments({
        teamId: CONFIG.vercel.teamId,
        limit: 10,
      });

      return deployments.map(d => ({
        id: d.id,
        name: d.name,
        url: d.url,
        state: d.state,
        createdAt: d.createdAt,
      }));
    } catch (error) {
      throw new Error(`Failed to list deployments: ${error.message}`);
    }
  }
}

// MCP Handler for deployment automation
const mcpHandler = createMcpHandler(
  (server) => {
    const deployer = new PetRescueDeployer();

    server.tool(
      "deploy_storefront",
      "Deploy PetRescue Brasil storefront to Vercel",
      {
        vercelToken: z.string().describe("Vercel bearer token"),
        teamId: z.string().optional().describe("Vercel team ID"),
      },
      async ({ vercelToken, teamId }) => {
        try {
          // Set the token
          process.env.VERCEL_TOKEN = vercelToken;
          if (teamId) {
            CONFIG.vercel.teamId = teamId;
          }

          const deployment = await deployer.deployStorefront();
          
          return {
            content: [
              {
                type: "text",
                text: `✅ Storefront deployed successfully!\n\n🔗 URL: ${deployment.url}\n📊 Inspect: ${deployment.inspectorUrl}\n⏰ Created: ${new Date(deployment.createdAt).toISOString()}`,
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
      "Get the status of a Vercel deployment",
      {
        deploymentId: z.string().describe("Deployment ID or URL"),
        vercelToken: z.string().describe("Vercel bearer token"),
        teamId: z.string().optional().describe("Vercel team ID"),
      },
      async ({ deploymentId, vercelToken, teamId }) => {
        try {
          process.env.VERCEL_TOKEN = vercelToken;
          if (teamId) {
            CONFIG.vercel.teamId = teamId;
          }

          const status = await deployer.getDeploymentStatus(deploymentId);
          
          return {
            content: [
              {
                type: "text",
                text: `📊 Deployment Status:\n\n🆔 ID: ${status.id}\n🔗 URL: ${status.url}\n📈 State: ${status.state}\n✅ Ready: ${status.readyState}\n⏰ Created: ${new Date(status.createdAt).toISOString()}`,
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
      "List recent Vercel deployments",
      {
        vercelToken: z.string().describe("Vercel bearer token"),
        teamId: z.string().optional().describe("Vercel team ID"),
      },
      async ({ vercelToken, teamId }) => {
        try {
          process.env.VERCEL_TOKEN = vercelToken;
          if (teamId) {
            CONFIG.vercel.teamId = teamId;
          }

          const deployments = await deployer.listDeployments();
          
          const deploymentList = deployments.map(d => 
            `🆔 ${d.id}\n🔗 ${d.url}\n📈 ${d.state}\n⏰ ${new Date(d.createdAt).toISOString()}\n`
          ).join('\n');
          
          return {
            content: [
              {
                type: "text",
                text: `📋 Recent Deployments:\n\n${deploymentList}`,
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
  },
  {
    capabilities: {
      tools: {
        deploy_storefront: {
          description: "Deploy PetRescue Brasil storefront to Vercel",
        },
        get_deployment_status: {
          description: "Get the status of a Vercel deployment",
        },
        list_deployments: {
          description: "List recent Vercel deployments",
        },
      },
    },
  }
);

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const deployer = new PetRescueDeployer();

  switch (command) {
    case "deploy":
      deployer.deployStorefront()
        .then(() => process.exit(0))
        .catch((error) => {
          console.error("Deployment failed:", error);
          process.exit(1);
        });
      break;
    
    case "status":
      const deploymentId = process.argv[3];
      if (!deploymentId) {
        console.error("Deployment ID required");
        process.exit(1);
      }
      deployer.getDeploymentStatus(deploymentId)
        .then(status => {
          console.log("Deployment Status:", status);
          process.exit(0);
        })
        .catch((error) => {
          console.error("Failed to get status:", error);
          process.exit(1);
        });
      break;
    
    case "list":
      deployer.listDeployments()
        .then(deployments => {
          console.log("Recent Deployments:", deployments);
          process.exit(0);
        })
        .catch((error) => {
          console.error("Failed to list deployments:", error);
          process.exit(1);
        });
      break;
    
    default:
      console.log("Usage: node advanced-deploy.js [deploy|status|list]");
      console.log("  deploy - Deploy storefront to Vercel");
      console.log("  status <deployment-id> - Get deployment status");
      console.log("  list - List recent deployments");
      process.exit(1);
  }
}

export { mcpHandler, PetRescueDeployer };
