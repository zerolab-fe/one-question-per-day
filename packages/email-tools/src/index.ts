/**
 * @file 入口
 * @author lishuaishuai
 * @date 2020年09月25日13:20:57
 * @description
 */
import schedule from 'node-schedule';
import { sendMail } from './send';


function main(): void {
  schedule.scheduleJob('0 0 14 * * 5', (): void => {
    sendMail()
    console.log(`run: ${new Date().toLocaleString()}`);
  });
}

main();
