import { Injectable, NotFoundException } from "@nestjs/common"
import { desc, eq } from "drizzle-orm"
import { randomUUID } from "crypto"
import { majorIncidents } from "@repo/db/schema"
import { db } from "@/common/database/database.client"

@Injectable()
export class MajorIncidentsService {
	async findAll() { return db.select().from(majorIncidents).orderBy(desc(majorIncidents.createdAt)) }
	async findOne(id: string) {
		const [inc] = await db.select().from(majorIncidents).where(eq(majorIncidents.id, id))
		if (!inc) throw new NotFoundException(`Major Incident ${id} not found`)
		return inc
	}
	async create(data: { title: string; description?: string; severity?: string; commanderId?: string; affectedDepartment?: string }) {
		const [inc] = await db.insert(majorIncidents).values({
			id: randomUUID(), title: data.title, description: data.description ?? "",
			severity: (data.severity as "low" | "medium" | "high" | "critical") ?? "medium",
			commanderId: data.commanderId ?? null, affectedDepartment: data.affectedDepartment ?? "",
			status: "active",
		}).returning()
		return inc
	}
	async update(id: string, data: Partial<{ title: string; description: string; status: string; severity: string; affectedDepartment: string }>) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const [inc] = await db.update(majorIncidents).set(data as any).where(eq(majorIncidents.id, id)).returning()
		if (!inc) throw new NotFoundException(`Major Incident ${id} not found`)
		return inc
	}
}
