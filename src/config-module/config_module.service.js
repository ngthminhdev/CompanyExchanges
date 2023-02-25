"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ConfigServiceProvider = void 0;
var common_1 = require("@nestjs/common");
var ConfigServiceProvider = /** @class */ (function () {
    function ConfigServiceProvider() {
    }
    ConfigServiceProvider.prototype.createTypeOrmOptions = function () {
        return {
            type: 'postgres',
            host: process.env.CONFIG_POSTGRES_HOST,
            port: parseInt(process.env.CONFIG_POSTGRES_PORT),
            username: process.env.CONFIG_POSTGRES_USERNAME,
            password: process.env.CONFIG_POSTGRES_PASSWORD,
            database: process.env.CONFIG_POSTGRES_DB_NAME,
            autoLoadEntities: true,
            synchronize: true
        };
    };
    ConfigServiceProvider = __decorate([
        (0, common_1.Injectable)()
    ], ConfigServiceProvider);
    return ConfigServiceProvider;
}());
exports.ConfigServiceProvider = ConfigServiceProvider;
