"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_schedule_1 = __importDefault(require("node-schedule"));
const send_1 = require("./send");
send_1.sendMail();
function main() {
    node_schedule_1.default.scheduleJob('0 0 14 * * 5', () => {
        console.log(`run: ${new Date().toLocaleString()}`);
    });
}
main();
