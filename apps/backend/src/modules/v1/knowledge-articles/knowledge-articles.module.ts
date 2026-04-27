import { Module } from "@nestjs/common"
import { KnowledgeArticlesController } from "./knowledge-articles.controller"
import { KnowledgeArticlesService } from "./knowledge-articles.service"
@Module({ controllers: [KnowledgeArticlesController], providers: [KnowledgeArticlesService], exports: [KnowledgeArticlesService] })
export class KnowledgeArticlesModule {}
