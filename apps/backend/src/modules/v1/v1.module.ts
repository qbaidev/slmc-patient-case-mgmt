import { Module } from "@nestjs/common"
import { ExamplesModule } from "./examples/examples.module"
import { HealthModule } from "./health/health.module"
import { TicketsModule } from "./tickets/tickets.module"
import { PatientsModule } from "./patients/patients.module"
import { CasesModule } from "./cases/cases.module"
import { MajorIncidentsModule } from "./major-incidents/major-incidents.module"
import { KnowledgeArticlesModule } from "./knowledge-articles/knowledge-articles.module"

@Module({
	imports: [ExamplesModule, HealthModule, TicketsModule, PatientsModule, CasesModule, MajorIncidentsModule, KnowledgeArticlesModule],
})
export class V1Module {}
