import { Service } from 'egg';
import { v4 as uuidv4 } from 'uuid';
import * as jsonwebtoken from 'jsonwebtoken';

interface IAccount {
  id?: string;
  username?: string;
  password?: string;
  email?: string;
  parentId?: string;
}

/**
 * Account Service
 */
export default class Account extends Service {

  /**
   * 用户注册
   * @param {Object} account - 用户对象
   * @param {string} account.username - 用户名
   * @param {string} account.password - 密码
   * @param {string} account.email - 邮箱
   */
  async register(account: IAccount) {
    try {
      const id = uuidv4();
      // 验证邮箱唯一性
      const existAccount = !!(await this.app.mongo.find('accounts', { query: { email: account.email } })).length;
      if (existAccount) {
        return { success: 0, text: '创建失败,邮箱已存在' };
      }
      await this.app.mongo.insertOne('accounts', { doc: { id, ...account } });
      return { success: 1, text: '创建成功' };
    } catch {
      return { success: 0, text: '创建失败' };
    }
  }

  /**
   * 用户登录
   * @param {Object} account - 用户对象
   * @param {string} account.password - 密码
   * @param {string} account.email - 邮箱
   */
  async login(account: IAccount) {
    try {
      const user = (await this.app.mongo.findOne('accounts', { query: { ...account } }));
      if (user) {
        const token = jsonwebtoken.sign({ id: user.id, email: user.email }, 'motherfuck');
        return { success: 1, text: '登录成功', data: { token } };
      }
      return { success: 0, text: '登录失败' };
    } catch (err) {
      console.log(err);
      return { success: 0, text: '登录失败' };
    }
  }

}
