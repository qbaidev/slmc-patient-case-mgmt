import { Module } from "@nestjs/common"
import { MajorIncidentsController } from "./major-incidents.controller"
import { MajorIncidentsService } from "./major-incidents.service"
@Module({ controllers: [MajorIncidentsController], providers: [MajorIncidentsService], exports: [MajorIncidentsService] })
export class MajorIncidentsModule {}
