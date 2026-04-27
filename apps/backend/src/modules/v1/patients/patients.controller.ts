import { Controller, Get, Post, Put, Param, Body, Query } from "@nestjs/common"
import { AllowAnonymous } from "@thallesp/nestjs-better-auth"
import { PatientsService } from "./patients.service"

@AllowAnonymous()
@Controller({ path: "patients", version: "1" })
export class PatientsController {
	constructor(private readonly svc: PatientsService) {}
	@Get() findAll(@Query("search") search?: string) { return this.svc.findAll(search) }
	@Get(":id") findOne(@Param("id") id: string) { return this.svc.findOne(id) }
	@Get(":id/entitlements") getEntitlements(@Param("id") id: string) { return this.svc.getEntitlements(id) }
	@Post() create(@Body() body: { patientNo?: string; fullName: string; dateOfBirth?: string; gender?: string; contactEmail?: string; contactPhone?: string; address?: string; hmoProvider?: string; insurancePolicy?: string; bloodType?: string; allergies?: string }) { return this.svc.create(body) }
	@Post(":id/entitlements") addEntitlement(@Param("id") id: string, @Body() body: { type: string; provider: string; policyNumber?: string; coverageDetails?: string; validFrom?: string; validUntil?: string }) { return this.svc.addEntitlement(id, body) }
	@Put(":id") update(@Param("id") id: string, @Body() body: Partial<{ fullName: string; contactEmail: string; contactPhone: string; address: string; hmoProvider: string; isActive: boolean }>) { return this.svc.update(id, body) }
}
