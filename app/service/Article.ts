import { Service } from 'egg';

import { Types } from '../constant/index';


export interface IArticle {
  id?: string;
  title?: string;
  content?: string;
  classification?: string;
  parentId?: string;
  accountId?: string;
  parentKey?: string;
  isTop?: 1 | 0;
  tags?: string[];
  type: Types;
}


/**
 * Article Service
 */
export default class Article extends Service {

  /**
   * 获取文件内容
   * @param {string} accountId - 用户id
   * @param {string} id - 文章id
   * @param {string} type - 类型
   */
  async articleContentGet(accountId, id, type) {
    try {
      const query = {
        accountId,
        id,
      };
      const db = type;
      const res = (await this.app.mongo.findOne(db, { query })) as IArticle;
      return { success: 1, data: res.content || '', text: '获取成功' };
    } catch (err) { return { success: 0, text: '获取失败' }; }
  }

}

