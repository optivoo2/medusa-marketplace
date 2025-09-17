// Instrumentation and observability for PetRescue Brasil
// Refer to the docs for installation instructions: https://docs.medusajs.com/learn/debugging-and-testing/instrumentation

import { registerOtel } from "@medusajs/medusa"

// Use OTLP exporter for production (compatible with most observability platforms)
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"

// Initialize OTLP exporter
const exporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318/v1/traces",
  headers: {
    "Content-Type": "application/json",
  },
})

export function register() {
  // Only enable instrumentation in production or when explicitly requested
  if (process.env.NODE_ENV === "production" || process.env.ENABLE_INSTRUMENTATION === "true") {
    registerOtel({
      serviceName: process.env.OTEL_SERVICE_NAME || "petrescue-brasil-backend",
      exporter,
      instrument: {
        http: true,
        workflows: true,
        query: true,
        redis: true,
        postgres: true,
      },
    })
  }
}