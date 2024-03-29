import { Service } from 'egg';
import { v4 as uuidv4 } from 'uuid';
import * as jsonwebtoken from 'jsonwebtoken';

import { QN_SOURCE_URL, CDN_QN_SOURCE_URL } from '../constant/index';
import { Collections, Types } from '../constant/index';

interface IAccount {
  id?: string;
  nickname?: string;
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
   * @param {string} account.nickname - 昵称
   * @param {string} account.password - 密码
   * @param {string} account.email - 邮箱
   */
  async register(account: IAccount) {
    try {
      const id = uuidv4();
      // 验证邮箱唯一性
      const existAccount = !!(
        await this.app.mongo.find(Collections.ACCOUNTS, {
          query: { email: account.email },
        })
      ).length;
      if (existAccount) {
        return { success: 0, text: '创建失败,邮箱已存在' };
      }
      const defaultAvatar =
        'https://cdn-src.renjianzahuopu.store/note/joker.jpeg';
      await this.app.mongo.insertOne(Collections.ACCOUNTS, {
        doc: { id, ...account, avatar: defaultAvatar },
      });
      // 注册成功生成欢迎笔记
      this.ctx.service.file.create({
        title: '欢迎使用码农笔记',
        content:
          '<div><h1><b id="sg5vc">云端资料库</b></h1></div><div><h2 id="dgr5d">一站式管理保存工作、学习、生活中各类珍贵资料</h2></div><div><h2 id="m29ao">数据实时同步，珍贵资料永久留存，安全加密绝不外泄</h2></div>',
        parentId: '2',
        type: Types.ARTICLE,
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
      const user = await this.app.mongo.findOne(Collections.ACCOUNTS, {
        query: { ...account },
      });
      if (user.avatar && user.avatar.indexOf(CDN_QN_SOURCE_URL) < 0) {
        user.avatar = user.avatar.replace(QN_SOURCE_URL, CDN_QN_SOURCE_URL);
      }
      if (user) {
        const token = jsonwebtoken.sign(
          { id: user.id, email: user.email },
          'motherfuck',
        );
        return {
          success: 1,
          text: '登录成功',
          data: { ...user, token, password: undefined, _id: undefined },
        };
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
      await this.app.mongo.findOneAndUpdate(Collections.ACCOUNTS, {
        filter: { id: account.id },
        update: { $set: account },
      });
      return { success: 1, text: '修改成功' };
    } catch (err) {
      console.log(err);
      return { success: 0, text: '修改失败' };
    }
  }
}
