import { Service } from 'egg';
import { v4 as uuidv4 } from 'uuid';
import * as jsonwebtoken from 'jsonwebtoken';

import { Collections, Types } from '../constant/index';

interface IAccount {
  id?: string;
  nickname?: string;
  password?: string;
  email?: string;
  parentId?: string;
  lastLoginTime?: number
  createTime: number
}

/**
 * Account Service
 */
export default class Account extends Service {

  /**
   * 用户注册
   * @param {Object} account - 用户对象
   * @param {string} account.nickname - 昵称
   * @param {string} account.password - 密码
   * @param {string} account.email - 邮箱
   */
  async register(account: IAccount) {
    try {
      const id = uuidv4();
      // 验证邮箱唯一性
      const existAccount = !!(await this.app.mongo.find(Collections.ACCOUNTS, { query: { email: account.email } })).length;
      if (existAccount) {
        return { success: 0, text: '创建失败,邮箱已存在' };
      }
      const defaultAvatar = 'https://note.ss.purevivi.chat/Fnn562fSUBw4HdUH7GOH8sWD0GnH';
      await this.app.mongo.insertOne(Collections.ACCOUNTS, { doc: { id, ...account, avatar: defaultAvatar, createTime: new Date().getTime() } });
      // 注册成功生成欢迎笔记
      this.ctx.service.file.create({
        title: '欢迎使用码农笔记',
        content: '<p><br></p><p>欢迎使用全新的码农笔记</p><p>——— 记录工作和生活点滴，办公文档随身携带</p><p>您可以在这里</p><ol><li>1、新建笔记，在笔记中输入文字内容，插入图片、表格、附件，随时随地记录身边点滴</li><li>2、上传办公文档，直接在码农笔记内管理、查看和编辑各类Office、PDF文档</li><li>3、自动实时备份，码农笔记将您的宝贵数据实时同步到云端，永久留存</li><li>4、多平台信息同步，通过电脑、手机、网页随时随地查看和编辑您的文档资料</li></ol>',
        parentId: '2',
        type: Types.ARTICLE,
        accountId: id
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
      const user = (await this.app.mongo.findOne(Collections.ACCOUNTS, { query: { ...account } }));
      if (user) {
        const token = jsonwebtoken.sign({ id: user.id, email: user.email }, 'motherfuck');
        await this.app.mongo.findOneAndUpdate(Collections.ACCOUNTS, { filter: { id: user.id }, update: { $set: {lastLoginTime:new Date().getTime()} }})
        return { success: 1, text: '登录成功', data: { ...user, token, password: undefined, _id: undefined } };
      }
      return { success: 0, text: '登录失败' };
    } catch (err) {
      console.log(err);
      return { success: 0, text: '登录失败' };
    }
  }

  /**
   * 编辑用户信息
   * @param {Object} account - 用户对象
   * @param {string} account.avatar - 头像
   * @param {string} account.email - 邮箱
   * @param {string} account.nickname - 昵称
   * @param {string} account.sex - 性别
   * @param {string} account.area - 地区
   * @param {string} account.sign - 个性签名
   * @param {string} account.id - 用户id
   */
  async edit(account: IAccount) {
    try {
      await this.app.mongo.findOneAndUpdate(Collections.ACCOUNTS, { filter: { id: account.id }, update: { $set: account } });
      return { success: 1, text: '修改成功' };
    } catch (err) {
      console.log(err);
      return { success: 0, text: '修改失败' };
    }
  }

}
