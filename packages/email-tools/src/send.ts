/**
 * @file 发送
 * @author lishuaishuai
 * @date 2020-09-25 13:28:20
 * @description
 */

import fs from 'fs';
import path from 'path';
import { createTransport, createTestAccount, TransportOptions } from 'nodemailer';
import moment from 'moment';
import ejs from 'ejs';
import axios from 'axios';

const DAY_START = '20200727'; // 起始日期
const url = 'https://api.github.com/repos/always-on-the-road/one-question-per-day/issues';

interface dataItem {
  title: string;
  html_url: string;
  user: {
    login: string;
    html_url: string;
  };
}

/**
 * 获取 github 数据
 * @param _url 地址
 */
async function getData(_url: string): Promise<[]> {
  const since: string = moment().subtract(7, 'days').format('YYYY-MM-DD[T]HH:mm:ss[Z]'); // 请求参数 issue起始日期

  try {
    const { data } = await axios.get(_url, {
      params: {
        since,
      },
    });

    return data.map((item: dataItem) => {
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
  } catch (err) {
    console.log('数据获取失败');
  }

  return [];
}

/**
 * 渲染html
 * @param {string} questionTpl html模板
 */
async function renderHtml(tpl: string): Promise<string> {
  const dayNum: number = moment().diff(DAY_START, 'days'); // *天
  const weeksNum: number = moment().diff(DAY_START, 'weeks'); // *星期
  const dateStart: string = moment().subtract(7, 'days').format('YYYY-MM-DD'); // 起始日期
  const dateEnd: string = moment().format('YYYY-MM-DD'); // 结束日期

  return ejs.render(tpl, {
    day: dayNum,
    week: weeksNum,
    day_start: dateStart,
    day_end: dateEnd,
    list: await getData(url),
  });
}

export async function sendMail(): Promise<any> {
  const testAccount = await createTestAccount();
  let config = {
    user: testAccount.user, // generated ethereal user
    pass: testAccount.pass, // generated ethereal password
  };

  try {
    config = await JSON.parse(fs.readFileSync(path.resolve(__dirname, '.config.json'), 'utf-8'));
  } catch (error) {
    console.log('sendMail -> error', error);
  }

  const transporter = createTransport({
    host: 'smtp.163.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    secureConnection: true,
    auth: config,
  } as TransportOptions);

  const questionTpl = fs.readFileSync(path.join(__dirname, '../template/question.html'), 'utf-8');

  transporter.sendMail({
    from: '"one question per day" <lishuaishuai_it@163.com>', // sender address
    to: 'lishuaishuai_it@163.com, wugaoliang_work@163.com, wlin0z@163.com', // list of receivers , wugaoliang_work@163.com, wlin0z@163.com
    subject: '每天一个小问题，周汇总来啦', // Subject line
    html: await renderHtml(questionTpl), // html body
    attachments: [
      //   {
      //     filename: 'test.md',
      //     path: './test.md',
      //   },
    ],
  });
}
