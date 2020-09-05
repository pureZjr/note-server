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
      // 注册成功生成欢迎笔记
      this.ctx.service.article.create({
        title: '欢迎使用幻象笔记',
        content: '<div>云端资料库</div><div>一站式管理保存工作、学习、生活中各类珍贵资料</div><div>数据实时同步，珍贵资料永久留存，安全加密绝不外泄</div><div>支持全平台使用，无论电脑、网页还是手机，都能编辑和查看您的文档</div>',
        parentId: '2',
        type: 'article',
        accountId: id,
      });
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
