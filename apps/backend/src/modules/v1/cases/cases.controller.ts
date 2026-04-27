import { Controller, Get, Post, Put, Param, Body, Query } from "@nestjs/common"
import { AllowAnonymous } from "@thallesp/nestjs-better-auth"
import { CasesService } from "./cases.service"

@AllowAnonymous()
@Controller({ path: "cases", version: "1" })
export class CasesController {
	constructor(private readonly svc: CasesService) {}
	@Get() findAll(@Query("status") status?: string, @Query("priority") priority?: string, @Query("department") department?: string, @Query("search") search?: string) { return this.svc.findAll(status, priority, department, search) }
	@Get("stats") getStats() { return this.svc.getStats() }
	@Get(":id") findOne(@Param("id") id: string) { return this.svc.findOne(id) }
	@Get(":id/updates") getUpdates(@Param("id") id: string) { return this.svc.getUpdates(id) }
	@Post() create(@Body() body: { patientId?: string; title: string; description?: string; caseType?: string; priority?: string; channelOrigin?: string; department?: string; assignedToId?: string; createdBy?: string }) { return this.svc.create(body) }
	@Post(":id/updates") addUpdate(@Param("id") id: string, @Body() body: { authorId?: string; content: string; visibility?: string; updateType?: string }) { return this.svc.addUpdate(id, body) }
	@Put(":id") update(@Param("id") id: string, @Body() body: Partial<{ title: string; description: string; status: string; priority: string; department: string; assignedToId: string; majorIncidentId: string; satisfactionRating: number; satisfactionComment: string }>) { return this.svc.update(id, body) }
}
