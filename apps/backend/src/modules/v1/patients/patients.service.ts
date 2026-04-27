import { Injectable, NotFoundException } from "@nestjs/common"
import { desc, eq, ilike, or } from "drizzle-orm"
import { randomUUID } from "crypto"
import { patients, entitlements } from "@repo/db/schema"
import { db } from "@/common/database/database.client"

@Injectable()
export class PatientsService {
	async findAll(search?: string) {
		if (search) {
			return db.select().from(patients)
				.where(or(ilike(patients.fullName, `%${search}%`), ilike(patients.patientNo, `%${search}%`), ilike(patients.contactEmail, `%${search}%`)))
				.orderBy(desc(patients.createdAt))
		}
		return db.select().from(patients).orderBy(desc(patients.createdAt))
	}

	async findOne(id: string) {
		const [patient] = await db.select().from(patients).where(eq(patients.id, id))
		if (!patient) throw new NotFoundException(`Patient ${id} not found`)
		return patient
	}

	async create(data: { patientNo?: string; fullName: string; dateOfBirth?: string; gender?: string; contactEmail?: string; contactPhone?: string; address?: string; hmoProvider?: string; insurancePolicy?: string; bloodType?: string; allergies?: string }) {
		const patientNo = data.patientNo ?? `P-${Date.now().toString().slice(-6)}`
		const [patient] = await db.insert(patients).values({
			id: randomUUID(), patientNo, fullName: data.fullName,
			dateOfBirth: data.dateOfBirth ?? "", gender: (data.gender as "male" | "female" | "other" | "") ?? "",
			contactEmail: data.contactEmail ?? "", contactPhone: data.contactPhone ?? "",
			address: data.address ?? "", hmoProvider: data.hmoProvider ?? "",
			insurancePolicy: data.insurancePolicy ?? "", bloodType: data.bloodType ?? "",
			allergies: data.allergies ?? "",
		}).returning()
		return patient
	}

	async update(id: string, data: Partial<{ fullName: string; contactEmail: string; contactPhone: string; address: string; hmoProvider: string; insurancePolicy: string; bloodType: string; allergies: string; isActive: boolean }>) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const [patient] = await db.update(patients).set(data as any).where(eq(patients.id, id)).returning()
		if (!patient) throw new NotFoundException(`Patient ${id} not found`)
		return patient
	}

	async getEntitlements(patientId: string) {
		return db.select().from(entitlements).where(eq(entitlements.patientId, patientId)).orderBy(desc(entitlements.createdAt))
	}

	async addEntitlement(patientId: string, data: { type: string; provider: string; policyNumber?: string; coverageDetails?: string; validFrom?: string; validUntil?: string }) {
		const [ent] = await db.insert(entitlements).values({
			id: randomUUID(), patientId,
			type: (data.type as "hmo" | "insurance" | "care_plan") ?? "hmo",
			provider: data.provider, policyNumber: data.policyNumber ?? "",
			coverageDetails: data.coverageDetails ?? "", validFrom: data.validFrom ?? "",
			validUntil: data.validUntil ?? "", status: "active",
		}).returning()
		return ent
	}
}
