import { MedusaService } from "@medusajs/framework/utils"
import Report from "../models/report"

export default class ReportService extends MedusaService({
  Report,
}) {
  async createReport(data: any) {
    const [report] = await this.createReports([data])
    return report
  }

  async listReports(filters: any = {}, config: any = {}) {
    return await this.listReports(filters, config)
  }

  async updateReport(id: string, data: any) {
    const [report] = await this.updateReports([{ id, ...data }])
    return report
  }
}


