import { Module } from "@nestjs/common";
import { MacroController } from "./macro.controller";
import { MacroService } from "./macro.service";
import { MssqlService } from "../mssql/mssql.service";



@Module({
    controllers: [MacroController],
    providers: [MacroService, MssqlService],
})
export class MacroModule {}