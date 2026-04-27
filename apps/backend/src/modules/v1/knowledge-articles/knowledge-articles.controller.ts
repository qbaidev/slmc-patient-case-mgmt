import { Controller, Get, Post, Put, Param, Body, Query } from "@nestjs/common"
import { AllowAnonymous } from "@thallesp/nestjs-better-auth"
import { KnowledgeArticlesService } from "./knowledge-articles.service"

@AllowAnonymous()
@Controller({ path: "knowledge-articles", version: "1" })
export class KnowledgeArticlesController {
	constructor(private readonly svc: KnowledgeArticlesService) {}
	@Get() findAll(@Query("search") search?: string, @Query("category") category?: string, @Query("visibility") visibility?: string) { return this.svc.findAll(search, category, visibility) }
	@Get(":id") findOne(@Param("id") id: string) { return this.svc.findOne(id) }
	@Post() create(@Body() body: { title: string; content: string; category?: string; tags?: string; visibility?: string; authorId?: string }) { return this.svc.create(body) }
	@Put(":id") update(@Param("id") id: string, @Body() body: Partial<{ title: string; content: string; category: string; tags: string; visibility: string; status: string }>) { return this.svc.update(id, body) }
	@Post(":id/view") incrementView(@Param("id") id: string) { return this.svc.incrementView(id) }
}
