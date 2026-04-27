import { Controller, Get, Post, Put, Param, Body } from "@nestjs/common"
import { AllowAnonymous } from "@thallesp/nestjs-better-auth"
import { MajorIncidentsService } from "./major-incidents.service"

@AllowAnonymous()
@Controller({ path: "major-incidents", version: "1" })
export class MajorIncidentsController {
	constructor(private readonly svc: MajorIncidentsService) {}
	@Get() findAll() { return this.svc.findAll() }
	@Get(":id") findOne(@Param("id") id: string) { return this.svc.findOne(id) }
	@Post() create(@Body() body: { title: string; description?: string; severity?: string; commanderId?: string; affectedDepartment?: string }) { return this.svc.create(body) }
	@Put(":id") update(@Param("id") id: string, @Body() body: Partial<{ title: string; status: string; severity: string }>) { return this.svc.update(id, body) }
}
