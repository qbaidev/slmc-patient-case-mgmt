import { Injectable, NotFoundException } from "@nestjs/common"
import { desc, eq, ilike, or } from "drizzle-orm"
import { randomUUID } from "crypto"
import { knowledgeArticles } from "@repo/db/schema"
import { db } from "@/common/database/database.client"

@Injectable()
export class KnowledgeArticlesService {
	async findAll(search?: string, category?: string, visibility?: string) {
		let rows = await db.select().from(knowledgeArticles).orderBy(desc(knowledgeArticles.createdAt))
		if (category) rows = rows.filter(a => a.category === category)
		if (visibility) rows = rows.filter(a => a.visibility === visibility || a.visibility === "both")
		if (search) rows = rows.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase()) || (a.tags ?? "").toLowerCase().includes(search.toLowerCase()))
		return rows
	}
	async findOne(id: string) {
		const [article] = await db.select().from(knowledgeArticles).where(eq(knowledgeArticles.id, id))
		if (!article) throw new NotFoundException(`Article ${id} not found`)
		return article
	}
	async create(data: { title: string; content: string; category?: string; tags?: string; visibility?: string; authorId?: string }) {
		const [article] = await db.insert(knowledgeArticles).values({
			id: randomUUID(), title: data.title, content: data.content,
			category: data.category ?? "general", tags: data.tags ?? "",
			visibility: (data.visibility as "internal" | "patient_facing" | "both") ?? "internal",
			status: "draft", authorId: data.authorId ?? null,
		}).returning()
		return article
	}
	async update(id: string, data: Partial<{ title: string; content: string; category: string; tags: string; visibility: string; status: string }>) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const [article] = await db.update(knowledgeArticles).set(data as any).where(eq(knowledgeArticles.id, id)).returning()
		if (!article) throw new NotFoundException(`Article ${id} not found`)
		return article
	}
	async incrementView(id: string) {
		const [a] = await db.select().from(knowledgeArticles).where(eq(knowledgeArticles.id, id))
		if (a) await db.update(knowledgeArticles).set({ viewCount: (a.viewCount ?? 0) + 1 } as never).where(eq(knowledgeArticles.id, id))
	}
}
