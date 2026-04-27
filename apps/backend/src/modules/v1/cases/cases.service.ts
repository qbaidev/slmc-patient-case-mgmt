import { Injectable, NotFoundException } from "@nestjs/common"
import { desc, eq, or, ilike, and } from "drizzle-orm"
import { randomUUID } from "crypto"
import { cases, caseUpdates } from "@repo/db/schema"
import { db } from "@/common/database/database.client"

@Injectable()
export class CasesService {
	async findAll(status?: string, priority?: string, department?: string, search?: string) {
		let query = db.select().from(cases).orderBy(desc(cases.createdAt))
		const filters = []
		if (status) filters.push(eq(cases.status, status as "new" | "in_progress" | "pending_patient" | "escalated" | "resolved" | "closed"))
		if (priority) filters.push(eq(cases.priority, priority as "low" | "medium" | "high" | "critical"))
		if (department) filters.push(eq(cases.department, department))
		if (search) filters.push(or(ilike(cases.title, `%${search}%`), ilike(cases.caseNo, `%${search}%`))!)
		if (filters.length > 0) {
			return db.select().from(cases).where(and(...filters)).orderBy(desc(cases.createdAt))
		}
		return query
	}

	async findOne(id: string) {
		const [c] = await db.select().from(cases).where(or(eq(cases.id, id), eq(cases.caseNo, id))!)
		if (!c) throw new NotFoundException(`Case ${id} not found`)
		return c
	}

	async create(data: { patientId?: string; title: string; description?: string; caseType?: string; priority?: string; channelOrigin?: string; department?: string; assignedToId?: string; createdBy?: string }) {
		const caseNo = `CASE-${Date.now().toString().slice(-6)}`
		const slaHours: Record<string, number> = { critical: 4, high: 8, medium: 24, low: 72 }
		const hrs = slaHours[data.priority ?? "medium"] ?? 24
		const slaDeadline = new Date(Date.now() + hrs * 3600000)
		const [c] = await db.insert(cases).values({
			id: randomUUID(), caseNo,
			patientId: data.patientId ?? null,
			title: data.title, description: data.description ?? "",
			caseType: (data.caseType as "general_inquiry" | "complaint" | "billing" | "medical_concern" | "pharmacy" | "scheduling" | "emergency" | "feedback") ?? "general_inquiry",
			priority: (data.priority as "low" | "medium" | "high" | "critical") ?? "medium",
			status: "new",
			channelOrigin: (data.channelOrigin as "portal" | "email" | "phone" | "in_person" | "referral") ?? "portal",
			department: data.department ?? "",
			assignedToId: data.assignedToId ?? null,
			slaDeadline, createdBy: data.createdBy ?? null,
		}).returning()
		return c
	}

	async update(id: string, data: Partial<{ title: string; description: string; status: string; priority: string; department: string; assignedToId: string; majorIncidentId: string; satisfactionRating: number; satisfactionComment: string; aiSentiment: string }>) {
		const updateData: Record<string, unknown> = {}
		if (data.title !== undefined) updateData.title = data.title
		if (data.description !== undefined) updateData.description = data.description
		if (data.status !== undefined) {
			updateData.status = data.status
			if (data.status === "resolved") updateData.resolvedAt = new Date()
			if (data.status === "closed") updateData.closedAt = new Date()
		}
		if (data.priority !== undefined) updateData.priority = data.priority
		if (data.department !== undefined) updateData.department = data.department
		if (data.assignedToId !== undefined) updateData.assignedToId = data.assignedToId
		if (data.majorIncidentId !== undefined) updateData.majorIncidentId = data.majorIncidentId
		if (data.satisfactionRating !== undefined) updateData.satisfactionRating = data.satisfactionRating
		if (data.satisfactionComment !== undefined) updateData.satisfactionComment = data.satisfactionComment
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const [c] = await db.update(cases).set(updateData as any).where(eq(cases.id, id)).returning()
		if (!c) throw new NotFoundException(`Case ${id} not found`)
		return c
	}

	async getUpdates(caseId: string) {
		return db.select().from(caseUpdates).where(eq(caseUpdates.caseId, caseId)).orderBy(caseUpdates.createdAt)
	}

	async addUpdate(caseId: string, data: { authorId?: string; content: string; visibility?: string; updateType?: string }) {
		const [update] = await db.insert(caseUpdates).values({
			id: randomUUID(), caseId,
			authorId: data.authorId ?? null,
			content: data.content,
			visibility: (data.visibility as "internal" | "patient_facing") ?? "internal",
			updateType: (data.updateType as "note" | "status_change" | "assignment" | "escalation" | "patient_message" | "system") ?? "note",
		}).returning()
		return update
	}

	async getStats() {
		const all = await db.select().from(cases)
		const byStatus: Record<string, number> = {}
		const byPriority: Record<string, number> = {}
		const byDept: Record<string, number> = {}
		const now = new Date()
		let slaBreached = 0
		for (const c of all) {
			const st = c.status ?? "new"; byStatus[st] = (byStatus[st] ?? 0) + 1
			const pr = c.priority ?? "medium"; byPriority[pr] = (byPriority[pr] ?? 0) + 1
			if (c.department) { byDept[c.department] = (byDept[c.department] ?? 0) + 1 }
			if (c.slaDeadline && new Date(c.slaDeadline) < now && !(["resolved","closed"].includes(c.status ?? ""))) slaBreached++
		}
		return { total: all.length, byStatus, byPriority, byDept, slaBreached, open: (byStatus["new"] ?? 0) + (byStatus["in_progress"] ?? 0) + (byStatus["pending_patient"] ?? 0) + (byStatus["escalated"] ?? 0) }
	}
}
