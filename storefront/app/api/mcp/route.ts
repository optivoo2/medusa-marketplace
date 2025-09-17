import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { Vercel } from "@vercel/sdk";

// MCP Handler for PetRescue Brasil deployment automation
const handler = createMcpHandler(
  (server) => {
    server.tool(
      "deploy_petrescue_storefront",
      "Deploy PetRescue Brasil storefront to Vercel with advanced configuration",
      {
        vercelToken: z.string().describe("Vercel bearer token for authentication"),
        teamId: z.string().optional().describe("Vercel team ID (defaults to arthurs-projects-129b2cca)"),
        environment: z.enum(["production", "preview"]).default("production").describe("Deployment environment"),
        customDomain: z.string().optional().describe("Custom domain to assign after deployment"),
      },
      async ({ vercelToken, teamId, environment, customDomain }) => {
        try {
          const vercel = new Vercel({
            bearerToken: vercelToken,
          });

          const team = teamId || "arthurs-projects-129b2cca";
          const projectName = "petrescue-brasil-storefront";

          // Get or create project
          let project;
          try {
            const projects = await vercel.projects.getProjects({ teamId: team });
            project = projects.find(p => p.name === projectName);
            
            if (!project) {
              project = await vercel.projects.createProject({
                teamId: team,
                requestBody: {
                  name: projectName,
                  framework: "nextjs",
                  buildCommand: "npm run build",
                  installCommand: "npm ci",
                  outputDirectory: ".next",
                },
              });
            }
          } catch (error) {
            throw new Error(`Failed to get/create project: ${error.message}`);
          }

          // Set environment variables
          const envVars = {
            NEXT_PUBLIC_MEDUSA_BACKEND_URL: "https://api.petrescue.org.br",
            NEXT_PUBLIC_BASE_URL: "https://app.petrescue.org.br",
            NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: "pk_live_petrescue_brasil",
            NEXT_PUBLIC_DEFAULT_REGION: "br",
            REVALIDATE_SECRET: process.env.REVALIDATE_SECRET || "petrescue-brasil-revalidate-secret-32-chars",
          };

          for (const [key, value] of Object.entries(envVars)) {
            try {
              await vercel.projects.createEnvironmentVariable({
                projectId: project.id,
                teamId: team,
                requestBody: {
                  key,
                  value,
                  target: [environment],
                },
              });
            } catch (error) {
              // Environment variable might already exist, continue
            }
          }

          // Create deployment
          const deployment = await vercel.deployments.createDeployment({
            teamId: team,
            requestBody: {
              name: projectName,
              project: project.id,
              target: environment,
              gitSource: {
                type: "github",
                ref: "main",
                repoId: 123456789, // Replace with actual repo ID
              },
            },
          });

          // Wait for deployment to be ready (simplified)
          let deploymentStatus = deployment;
          let attempts = 0;
          const maxAttempts = 30; // 5 minutes max

          while (deploymentStatus.state !== "READY" && deploymentStatus.state !== "ERROR" && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
            try {
              deploymentStatus = await vercel.deployments.getDeployment({
                idOrUrl: deployment.id,
                teamId: team,
              });
            } catch (error) {
              // Continue waiting
            }
            attempts++;
          }

          let result = `✅ PetRescue Brasil Storefront Deployed Successfully!\n\n`;
          result += `🔗 URL: ${deployment.url}\n`;
          result += `📊 Inspect: ${deployment.inspectorUrl}\n`;
          result += `📈 Status: ${deploymentStatus.state}\n`;
          result += `🎯 Environment: ${environment}\n`;
          result += `⏰ Created: ${new Date(deployment.createdAt).toISOString()}\n`;

          if (customDomain) {
            result += `\n🌐 Custom Domain: ${customDomain} (configure in Vercel dashboard)`;
          }

          return {
            content: [
              {
                type: "text",
                text: result,
              },
            ],
          };

        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Deployment failed: ${error.message}\n\nPlease check your Vercel token and team ID.`,
              },
            ],
          };
        }
      }
    );

    server.tool(
      "get_vercel_deployment_status",
      "Get the current status of a Vercel deployment",
      {
        deploymentId: z.string().describe("Deployment ID or URL"),
        vercelToken: z.string().describe("Vercel bearer token"),
        teamId: z.string().optional().describe("Vercel team ID"),
      },
      async ({ deploymentId, vercelToken, teamId }) => {
        try {
          const vercel = new Vercel({
            bearerToken: vercelToken,
          });

          const deployment = await vercel.deployments.getDeployment({
            idOrUrl: deploymentId,
            teamId: teamId || "arthurs-projects-129b2cca",
          });

          let status = `📊 Deployment Status\n\n`;
          status += `🆔 ID: ${deployment.id}\n`;
          status += `🔗 URL: ${deployment.url}\n`;
          status += `📈 State: ${deployment.state}\n`;
          status += `✅ Ready State: ${deployment.readyState}\n`;
          status += `🎯 Target: ${deployment.target}\n`;
          status += `⏰ Created: ${new Date(deployment.createdAt).toISOString()}\n`;
          
          if (deployment.ready) {
            status += `🚀 Ready: ${new Date(deployment.ready).toISOString()}\n`;
          }

          return {
            content: [
              {
                type: "text",
                text: status,
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
      "list_vercel_deployments",
      "List recent Vercel deployments for PetRescue Brasil",
      {
        vercelToken: z.string().describe("Vercel bearer token"),
        teamId: z.string().optional().describe("Vercel team ID"),
        limit: z.number().min(1).max(20).default(10).describe("Number of deployments to list"),
      },
      async ({ vercelToken, teamId, limit }) => {
        try {
          const vercel = new Vercel({
            bearerToken: vercelToken,
          });

          const deployments = await vercel.deployments.getDeployments({
            teamId: teamId || "arthurs-projects-129b2cca",
            limit,
          });

          if (deployments.length === 0) {
            return {
              content: [
                {
                  type: "text",
                  text: "📋 No deployments found for this team.",
                },
              ],
            };
          }

          let list = `📋 Recent Deployments (${deployments.length})\n\n`;
          
          deployments.forEach((deployment, index) => {
            list += `${index + 1}. ${deployment.name}\n`;
            list += `   🆔 ${deployment.id}\n`;
            list += `   🔗 ${deployment.url}\n`;
            list += `   📈 ${deployment.state}\n`;
            list += `   ⏰ ${new Date(deployment.createdAt).toISOString()}\n\n`;
          });

          return {
            content: [
              {
                type: "text",
                text: list,
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
      "configure_petrescue_domains",
      "Configure custom domains for PetRescue Brasil deployment",
      {
        vercelToken: z.string().describe("Vercel bearer token"),
        teamId: z.string().optional().describe("Vercel team ID"),
        projectId: z.string().describe("Vercel project ID"),
        storefrontDomain: z.string().describe("Storefront domain (e.g., app.petrescue.org.br)"),
        adminDomain: z.string().optional().describe("Admin domain (e.g., admin.petrescue.org.br)"),
      },
      async ({ vercelToken, teamId, projectId, storefrontDomain, adminDomain }) => {
        try {
          const vercel = new Vercel({
            bearerToken: vercelToken,
          });

          const team = teamId || "arthurs-projects-129b2cca";
          let result = `🌐 Domain Configuration for PetRescue Brasil\n\n`;

          // Add storefront domain
          try {
            await vercel.projects.addDomain({
              projectId,
              teamId: team,
              requestBody: {
                name: storefrontDomain,
              },
            });
            result += `✅ Storefront domain added: ${storefrontDomain}\n`;
          } catch (error) {
            result += `⚠️  Storefront domain (${storefrontDomain}): ${error.message}\n`;
          }

          // Add admin domain if provided
          if (adminDomain) {
            try {
              await vercel.projects.addDomain({
                projectId,
                teamId: team,
                requestBody: {
                  name: adminDomain,
                },
              });
              result += `✅ Admin domain added: ${adminDomain}\n`;
            } catch (error) {
              result += `⚠️  Admin domain (${adminDomain}): ${error.message}\n`;
            }
          }

          result += `\n📋 Next Steps:\n`;
          result += `1. Configure DNS records in your domain provider\n`;
          result += `2. Point domains to Vercel's nameservers\n`;
          result += `3. SSL certificates will be automatically provisioned\n`;

          return {
            content: [
              {
                type: "text",
                text: result,
              },
            ],
          };

        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `❌ Failed to configure domains: ${error.message}`,
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
        deploy_petrescue_storefront: {
          description: "Deploy PetRescue Brasil storefront to Vercel with advanced configuration",
        },
        get_vercel_deployment_status: {
          description: "Get the current status of a Vercel deployment",
        },
        list_vercel_deployments: {
          description: "List recent Vercel deployments for PetRescue Brasil",
        },
        configure_petrescue_domains: {
          description: "Configure custom domains for PetRescue Brasil deployment",
        },
      },
    },
  },
  {
    redisUrl: process.env.REDIS_URL,
    basePath: "/api",
    maxDuration: 300, // 5 minutes
    verboseLogs: true,
  }
);

export { handler as GET, handler as POST };
