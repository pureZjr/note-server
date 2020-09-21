import { Service } from 'egg';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';

import { sizeof } from '../util';
import { Collections } from '../constant/index';

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
  type?: string;
}

export enum Types {
  NewDoc = '1',
  MyFolder = '2',
  Recycle = '3'
}

/**
 * Article Service
 */
export default class Article extends Service {

  /**
   * 新增文章
   * @param {Object} article - 文章对象
   * @param {string} article.title - 文章标题
   * @param {string} article.content - 文章内容
   * @param {string} article.classification - 文章分类
   * @param {string} article.parentId - 父文件夹id
   * @param {string} article.type - 文章类型
   * @param {string} article.accountId - 用户id
   */
  async create(article: IArticle) {
    try {
      const id = uuidv4();
      const extra = {
        createTime: new Date().getTime(),
        updateTime: new Date().getTime(),
        inRecycle: false,
        parentInRecycle: false,
        size: 0,
        isTop: 0,
        tags: [],
      };
      // 判断文件名称是否存在
      const existArticle = await this.app.mongo.findOne(Collections.FILES, { query: { accountId: article.accountId, inRecycle: false, parentId: article.parentId, title: article.title } });
      if (existArticle) {
        return { success: 0, text: '创建失败,名称已存在' };
      }
      const content = article.content;
      delete article.content;
      const belongFolder = await this.app.mongo.findOne(Collections.FOLDERS, { query: { accountId: article.accountId, id: article.parentId, inRecycle: false } });
      const parentFolderTitle = belongFolder ? belongFolder.title : '我的文件夹';
      // 插入文章基本信息
      const insertData = { ...article, parentFolderTitle, parentKey: `${belongFolder ? belongFolder.key : '2'}`, key: `${belongFolder ? belongFolder.key : '2'}-${id}`, id, ...extra };
      await this.app.mongo.insertOne(Collections.FILES, { doc: insertData });
      // 插入文章内容
      const db = article.type as string;
      await this.app.mongo.insertOne(db, { doc: { id, accountId: article.accountId, content } });
      return { success: 1, data: insertData, text: '创建成功' };
    } catch (err) {
      console.log(err);
      return { success: 0, text: '创建失败' };
    }
  }


  /**
   * 获取文件夹下的文章
   * @param {string} accountId - 用户id
   * @param {string} parentKey - 父文件夹key
   */
  async getInFolder(accountId: string, parentKey: string) {
    const result = await this.app.mongo.find(Collections.FILES, { query: { parentKey, accountId, inRecycle: false }, sort: { isTop: -1 } });
    return { success: 1, data: result, text: '获取成功' };
  }

  /**
   * 获取文章
   * @param {string} id - 文章id
   * @param {string} accountId - 用户id
   */
  async get(id: string, accountId: string) {
    const result = await (await this.app.mongo.find(Collections.FILES, { query: { id, accountId }, sort: { isTop: -1 } }));
    return { success: 1, data: result, text: '获取成功' };
  }

  /**
   * 删除文章（软删除）
   * @param {string} id - 文章id
   * @param {string} accountId - 用户id
   */
  async del(id: string, accountId: string) {
    try {
      await this.app.mongo.findOneAndUpdate(Collections.FILES, { filter: { id, accountId }, update: { $set: { inRecycle: true } } });
      return { success: 1, text: '删除成功' };
    } catch {
      return { success: 0, text: '删除失败' };
    }
  }

  /**
   * 删除文章（彻底删除）
   * @param {string} id - 文章id
   * @param {string} accountId - 用户id
   * @param {string} type - 文章类型
   */
  async delComplete(id: string, accountId: string, type: string) {
    try {
      await this.app.mongo.deleteMany(Collections.FILES, { filter: { id, accountId } });
      const db = type;
      await this.app.mongo.findOneAndDelete(db, { filter: { id, accountId } });
      return { success: 1, text: '删除成功' };
    } catch {
      return { success: 0, text: '删除失败' };
    }
  }


  /**
   * 修改文章
   * @param {Object} article - 文章对象
   * @param {string} article.id - 文章id
   * @param {string} article.title - 文章标题
   * @param {string} article.content - 文章内容
   * @param {string} article.classification - 文章分类
   * @param {string} article.accountId - 用户id
   * @param {string} article.type - 文章类型
   */
  async edit(article: IArticle) {
    try {
      const update = { ...article, content: undefined, updateTime: new Date().getTime(), size: sizeof(article.content, 'utf-8') };
      delete update.id;
      // 修改文章基本信息
      await this.app.mongo.findOneAndUpdate(Collections.FILES, {
        filter: { id: article.id, accountId: article.accountId }, update: { $set: update },
      });
      // 修改文章内容
      const db = article.type as string;
      await this.app.mongo.findOneAndUpdate(db, {
        filter: { id: article.id }, update: { $set: { content: article.content } },
      });
      return { success: 1, text: '更新成功' };
    } catch (err) {
      return { success: 0, text: '更新失败' };
    }
  }

  /**
   * 获取回收站的文章
   * @param {string} accountId - 用户id
   */
  async getDelArticle(accountId) {
    try {
      const query = {
        accountId, inRecycle: true, parentInRecycle: false,
      };
      const res = (await this.app.mongo.find(Collections.FILES, { query })) as IArticle[];
      return { success: 1, data: res, text: '获取成功' };
    } catch (err) {
      console.log(err);
      return { success: 0, text: '获取失败' };
    }
  }

  /**
   * 获取最新文件
   * @param {string} accountId - 用户id
   */
  async getNewestArticle(accountId) {
    try {
      const query = {
        accountId,
        inRecycle: false,
        updateTime: { $gte: moment().subtract('days', 7).valueOf() },
      };
      const res = (await this.app.mongo.find(Collections.FILES, { query, sort: { isTop: -1 } })) as IArticle[];
      return { success: 1, data: res, text: '获取成功' };
    } catch (err) {
      return { success: 0, text: '获取失败' };
    }
  }

  /**
   * 搜索文件
   * @param {string} accountId - 用户id
   * @param {string} keyword - 关键字
   * @param {string} type - 类型
   */
  async searchArticle(accountId, keyword, type, parentKey?) {
    try {
      if (keyword === '') {
        if (type === Types.NewDoc) {
          return this.getNewestArticle(accountId);
        } else if (type === Types.MyFolder) {
          return this.getInFolder(accountId, parentKey);
        } return this.getDelArticle(accountId);
      }

      const query = {
        accountId,
        title: { $regex: new RegExp(`${keyword}`) },
      };
      if (type === Types.NewDoc) {
        Object.assign(query, {
          updateTime: { $gte: moment().startOf('day').valueOf() },
          inRecycle: false,
        });
      } else if (type === Types.MyFolder) {
        Object.assign(query, {
          inRecycle: false,
        });
        if (parentKey) {
          Object.assign(query, {
            key: { $regex: new RegExp(`^ ${parentKey} - `) },
          });
        }
      } else {
        Object.assign(query, {
          inRecycle: true,
        });
      }
      const res = await this.app.mongo.aggregate(Collections.FILES, {
        pipeline: [{
          $lookup: {
            from: 'markdown',
            localField: 'id',
            foreignField: 'id',
            as: 'markdown',
          },
        }, {
          $lookup: {
            from: 'article',
            localField: 'id',
            foreignField: 'id',
            as: 'article',
          },
        }, {
          $match: {
            content: { $ne: [] },
            $or: [
              { title: { $regex: new RegExp(keyword) } },
              query,
              { 'markdown.content': { $regex: new RegExp(keyword) } },
              { 'article.content': { $regex: new RegExp(keyword) } },
            ],

          },
        }, { $project: { _id: 1, id: 1, title: 1, type: 1, parentId: 1, accountId: 1, parentFolderTitle: 1, parentKey: 1, key: 1, createTime: 1, updateTime: 1, inRecycle: 1, parentInRecycle: 1, size: 1 } },
        ],
      }) as IArticle[];
      return { success: 1, data: res, text: '获取成功' };
    } catch (err) {
      return { success: 0, text: '获取失败' };
    }
  }

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

  /**
   * 恢复文件
   * @param {string} accountId - 用户id
   * @param {string} id - 文章id
   */
  async recoverArticle(accountId, id) {
    try {
      await this.app.mongo.findOneAndUpdate(Collections.FILES, { filter: { id, accountId }, update: { $set: { inRecycle: false } } });
      return { success: 1, text: '删除成功' };
    } catch {
      return { success: 0, text: '删除失败' };
    }
  }

  /**
   * 重命名
   * @param {string} accountId - 用户id
   * @param {string} id - 文章id
   * @param {string} title - 标题
   */
  async renameArticle(accountId, id, title) {
    try {
      // 判断文件名称是否存在
      const articleInfo = await this.app.mongo.findOne(Collections.FILES, { query: { accountId, id } }) as IArticle;
      const existArticleTitle = await this.app.mongo.findOne(Collections.FILES, { query: { accountId, parentId: articleInfo.parentId, title } }) as IArticle;
      if (existArticleTitle) {
        return { success: 0, text: '创建失败,名称已存在' };
      }
      await this.app.mongo.findOneAndUpdate(Collections.FILES, { filter: { id, accountId }, update: { $set: { title } } });
      return { success: 1, text: '修改成功' };
    } catch {
      return { success: 0, text: '修改失败' };
    }
  }

  /**
   * 文章置顶、取消置顶
   * @param {string} accountId - 用户id
   * @param {string} id - 文章id
   * @param {boolean} is_top - 是否置顶
   */
  async setTop(accountId, id, is_top) {
    try {
      await this.app.mongo.findOneAndUpdate(Collections.FILES, {
        filter: { id, accountId }, update: { $set: { isTop: is_top } },
      });
      return { success: 1, text: '更新成功' };
    } catch (err) {
      return { success: 0, text: '更新失败' };
    }
  }

  /**
   * 获取共享文章
   * @param {string} key - 文章key
   */
  async getShareArticle(key) {
    try {
      const shareArticle = await this.app.mongo.findOne(Collections.SHAREARTICLES, {
        query: {
          key,
        },
      });
      if (shareArticle._id) {
        const articleInfo = (await this.app.mongo.findOne(Collections.FILES, { query: { key } })) as IArticle;
        const db = articleInfo.type as string;
        const articleDetail = await this.app.mongo.findOne(db, { query: { id: articleInfo.id } });
        return { success: 1, data: { title: articleInfo.title, content: articleDetail.content }, text: '获取成功' };
      }
      return { success: 0, text: '获取失败' };

    } catch (err) {
      return { success: 0, text: '获取失败' };
    }
  }


  /**
   * 生成共享文章
   * @param {string} key - 文章key
   * @param { number } ts - 共享时长
   */
  async setShareArticle(key, ts) {
    try {
      await this.app.mongo.findOneAndDelete(Collections.SHAREARTICLES, { filter: { key } });
      await this.app.mongo.insertOne(Collections.SHAREARTICLES, {
        doc: {
          key,
          ts,
        },
      });
      return { success: 1, text: '获取成功' };
    } catch (err) {
      return { success: 0, text: '获取失败' };
    }
  }
}

