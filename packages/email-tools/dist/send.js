"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const nodemailer_1 = require("nodemailer");
const moment_1 = __importDefault(require("moment"));
const ejs_1 = __importDefault(require("ejs"));
const axios_1 = __importDefault(require("axios"));
const DAY_START = '20200727';
const url = 'https://api.github.com/repos/always-on-the-road/one-question-per-day/issues';
async function getData(_url) {
    const since = moment_1.default().subtract(7, 'days').format('YYYY-MM-DD[T]HH:mm:ss[Z]');
    try {
        const { data } = await axios_1.default.get(_url, {
            params: {
                since,
            },
        });
        return data.map((item) => {
            const { title, html_url, user } = item;
            const { login, html_url: user_url } = user;
            return {
                title,
                html_url,
                user: {
                    login,
                    html_url: user_url,
                },
            };
        });
    }
    catch (err) {
        console.log('数据获取失败');
    }
    return [];
}
async function renderHtml(tpl) {
    const dayNum = moment_1.default().diff(DAY_START, 'days');
    const weeksNum = moment_1.default().diff(DAY_START, 'weeks');
    const dateStart = moment_1.default().subtract(7, 'days').format('YYYY-MM-DD');
    const dateEnd = moment_1.default().format('YYYY-MM-DD');
    return ejs_1.default.render(tpl, {
        day: dayNum,
        week: weeksNum,
        day_start: dateStart,
        day_end: dateEnd,
        list: await getData(url),
    });
}
async function sendMail() {
    const testAccount = await nodemailer_1.createTestAccount();
    let config = {
        user: testAccount.user,
        pass: testAccount.pass,
    };
    try {
        config = await JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(__dirname, '.config.json'), 'utf-8'));
    }
    catch (error) {
        console.log('sendMail -> error', error);
    }
    const transporter = nodemailer_1.createTransport({
        host: 'smtp.163.com',
        port: 465,
        secure: true,
        secureConnection: true,
        auth: config,
    });
    const questionTpl = fs_1.default.readFileSync(path_1.default.join(__dirname, '../template/question.html'), 'utf-8');
    transporter.sendMail({
        from: '"one question per day" <lishuaishuai_it@163.com>',
        to: 'lishuaishuai_it@163.com',
        subject: '每天一个小问题，周汇总来啦',
        html: await renderHtml(questionTpl),
        attachments: [],
    });
}
exports.sendMail = sendMail;
