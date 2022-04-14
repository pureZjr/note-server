import { Service } from 'egg';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';

import { Types, Collections } from '../constant/index';
import { sizeof } from '../util';

export interface IFile {
  id?: string;
  title: string;
  content?: string;
  classification?: string;
  parentId?: string;
  accountId?: string;
  parentKey?: string;
  isTop?: 1 | 0;
  tags?: string[];
  type: Types;
  size?: number;
}

export enum Tabs {
  NewDoc = '1',
  MyFolder = '2',
  Recycle = '3',
}

/**
 * File Service
 */
export default class File extends Service {
  /**
   * 新增文件
   * @param {Object} file - 文件对象
   * @param {string} file.title - 文件标题
   * @param {string} file.content - 文件内容
   * @param {string} file.classification - 文件分类
   * @param {string} file.parentId - 父文件夹id
   * @param {Types} file.type - 文件类型
   * @param {string} file.accountId - 用户id
   * @param {number} file.size - 文件大小
   */
  async create(file: IFile) {
    try {
      const id = uuidv4();
      const extra = {
        createTime: new Date().getTime(),
        updateTime: new Date().getTime(),
        inRecycle: false,
        parentInRecycle: false,
        size: file.size || 0,
        isTop: 0,
        tags: [],
      };
      // 判断文件名称是否存在
      const existFile = await this.app.mongo.findOne(Collections.FILES, {
        query: {
          accountId: file.accountId,
          inRecycle: false,
          parentId: file.parentId,
          title: file.title,
          type: file.type,
        },
      });
      if (existFile) {
        if ([Types.ARTICLE, Types.MARKDOWN].includes(file.type)) {
          return { success: 0, text: '创建失败,名称已存在' };
        }
        file.title = file.title + id;
      }
      const content = file.content;
      delete file.content;
      const belongFolder = await this.app.mongo.findOne(Collections.FOLDERS, {
        query: {
          accountId: file.accountId,
          id: file.parentId,
          inRecycle: false,
        },
      });
      const parentFolderTitle = belongFolder
        ? belongFolder.title
        : '我的文件夹';
      // 插入文件基本信息
      const insertData = {
        ...file,
        parentFolderTitle,
        parentKey: `${belongFolder ? belongFolder.key : '2'}`,
        key: `${belongFolder ? belongFolder.key : '2'}-${id}`,
        id,
        ...extra,
      };
      await this.app.mongo.insertOne(Collections.FILES, { doc: insertData });
      // 插入文件链接
      const db = file.type as string;
      await this.app.mongo.insertOne(db, {
        doc: { id, accountId: file.accountId, content },
      });
      return { success: 1, data: insertData, text: '创建成功' };
    } catch {
      return { success: 0, text: '创建失败' };
    }
  }

  /**
   * 获取文件夹下的文件
   * @param {string} accountId - 用户id
   * @param {string} parentKey - 父文件夹key
   * @param {string} sort - 排序，默认更新时间
   */
  async getInFolder(accountId: string, parentKey: string, sort: string) {
    const sortBy = {};
    sortBy[sort] = -1;
    const result = await this.app.mongo.find(Collections.FILES, {
      query: { parentKey, accountId, inRecycle: false },
      sort: { isTop: -1, ...sortBy },
    });
    return { success: 1, data: result, text: '获取成功' };
  }

  /**
   * 获取文件
   * @param {string} id - 文件id
   * @param {string} accountId - 用户id
   * @param {string} sort - 排序，默认更新时间
   */
  async get(id: string, accountId: string, sort: string) {
    const sortBy = {};
    sortBy[sort] = -1;
    const result = await await this.app.mongo.find(Collections.FILES, {
      query: { id, accountId },
      sort: { isTop: -1, ...sortBy },
    });
    return { success: 1, data: result, text: '获取成功' };
  }

  /**
   * 删除文件（软删除）
   * @param {string} id - 文件id
   * @param {string} accountId - 用户id
   */
  async del(id: string, accountId: string) {
    try {
      await this.app.mongo.findOneAndUpdate(Collections.FILES, {
        filter: { id, accountId },
        update: { $set: { inRecycle: true } },
      });
      return { success: 1, text: '删除成功' };
    } catch {
      return { success: 0, text: '删除失败' };
    }
  }

  /**
   * 删除文件（彻底删除）
   * @param {string} id - 文件id
   * @param {string} accountId - 用户id
   * @param {Types} type - 文件类型
   */
  async delComplete(id: string, accountId: string, type: Types) {
    try {
      await this.app.mongo.deleteMany(Collections.FILES, {
        filter: { id, accountId },
      });
      const db = type;
      await this.app.mongo.findOneAndDelete(db, { filter: { id, accountId } });
      return { success: 1, text: '删除成功' };
    } catch {
      return { success: 0, text: '删除失败' };
    }
  }

  /**
   * 恢复文件
   * @param {string} accountId - 用户id
   * @param {string} id - 文件id
   */
  async recoverFile(accountId, id) {
    try {
      await this.app.mongo.findOneAndUpdate(Collections.FILES, {
        filter: { id, accountId },
        update: { $set: { inRecycle: false } },
      });
      return { success: 1, text: '删除成功' };
    } catch {
      return { success: 0, text: '删除失败' };
    }
  }

  /**
   * 重命名
   * @param {string} accountId - 用户id
   * @param {string} id - 文件id
   * @param {string} title - 标题
   */
  async renameFile(accountId, id, title) {
    try {
      // 判断文件名称是否存在
      const fileInfo = await this.app.mongo.findOne(Collections.FILES, {
        query: { accountId, id },
      });
      const existFileTitle = await this.app.mongo.findOne(Collections.FILES, {
        query: { accountId, parentId: fileInfo.parentId, title },
      });
      if (existFileTitle) {
        return { success: 0, text: '创建失败,名称已存在' };
      }
      await this.app.mongo.findOneAndUpdate(Collections.FILES, {
        filter: { id, accountId },
        update: { $set: { title } },
      });
      return { success: 1, text: '修改成功' };
    } catch {
      return { success: 0, text: '修改失败' };
    }
  }

  /**
   * 获取回收站的文件
   * @param {string} accountId - 用户id
   * @param {string} sort - 排序，默认更新时间
   */
  async getDelFile(accountId, sort: string) {
    try {
      const query = {
        accountId,
        inRecycle: true,
        parentInRecycle: false,
      };
      const sortBy = {};
      sortBy[sort] = -1;
      const res = await this.app.mongo.find(Collections.FILES, {
        query,
        sort: { ...sortBy },
      });
      return { success: 1, data: res, text: '获取成功' };
    } catch (err) {
      console.log(err);
      return { success: 0, text: '获取失败' };
    }
  }

  /**
   * 获取最新文件
   * @param {string} accountId - 用户id
   * @param {string} sort - 排序，默认更新时间
   */
  async getNewestFile(accountId, sort) {
    try {
      const query = {
        accountId,
        inRecycle: false,
        updateTime: { $gte: moment().subtract('days', 7).valueOf() },
      };
      const sortBy = {};
      sortBy[sort] = -1;
      const res = await this.app.mongo.find(Collections.FILES, {
        query,
        sort: { isTop: -1, ...sortBy },
      });
      return { success: 1, data: res, text: '获取成功' };
    } catch (err) {
      return { success: 0, text: '获取失败' };
    }
  }

  /**
   * 文件置顶、取消置顶
   * @param {string} accountId - 用户id
   * @param {string} id - 文件id
   * @param {boolean} is_top - 是否置顶
   */
  async setTop(accountId, id, is_top) {
    try {
      await this.app.mongo.findOneAndUpdate(Collections.FILES, {
        filter: { id, accountId },
        update: { $set: { isTop: is_top } },
      });
      return { success: 1, text: '更新成功' };
    } catch (err) {
      return { success: 0, text: '更新失败' };
    }
  }

  /**
   * 修改文件
   * @param {Object} file - 文件对象
   * @param {string} file.id - 文件id
   * @param {string} file.title - 文件标题
   * @param {string} file.content - 文件内容
   * @param {string} file.classification - 文件分类
   * @param {string} file.accountId - 用户id
   * @param {Types} file.type - 文件类型
   */
  async edit(file: IFile) {
    try {
      const update = {
        ...file,
        content: undefined,
        updateTime: new Date().getTime(),
        size: sizeof(file.content, 'utf-8'),
      };
      delete update.id;
      // 修改文件基本信息
      await this.app.mongo.findOneAndUpdate(Collections.FILES, {
        filter: { id: file.id, accountId: file.accountId },
        update: { $set: update },
      });
      // 修改文件内容
      const db = file.type;
      await this.app.mongo.findOneAndUpdate(db, {
        filter: { id: file.id },
        update: { $set: { content: file.content } },
      });
      return { success: 1, text: '更新成功' };
    } catch (err) {
      return { success: 0, text: '更新失败' };
    }
  }

  /**
   * 获取共享文件
   * @param {string} key - 文件key
   */
  async getShareFile(key) {
    try {
      const shareFile = await this.app.mongo.findOne(Collections.SHAREFILES, {
        query: {
          key,
        },
      });
      if (shareFile._id) {
        const fileInfo = await this.app.mongo.findOne(Collections.FILES, {
          query: { key },
        });
        const db = fileInfo.type;
        const fileDetail = await this.app.mongo.findOne(db, {
          query: { id: fileInfo.id },
        });
        return {
          success: 1,
          data: {
            title: fileInfo.title,
            content: fileDetail.content,
            type: fileInfo.type,
          },
          text: '获取成功',
        };
      }
      return { success: 0, text: '获取失败' };
    } catch (err) {
      return { success: 0, text: '获取失败' };
    }
  }

  /**
   * 搜索文件
   * @param {string} accountId - 用户id
   * @param {string} keyword - 关键字
   * @param {Tabs} tabs - 类型
   */
  async searchFile(accountId, keyword, tabs, parentKey?) {
    try {
      const query = {
        accountId,
      };
      if (tabs === Tabs.NewDoc) {
        Object.assign(query, {
          updateTime: { $gte: moment().subtract('days', 7).valueOf() },
          inRecycle: false,
        });
      } else if (tabs === Tabs.MyFolder) {
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
      console.log({ ...query });
      const res = await this.app.mongo.aggregate(Collections.FILES, {
        pipeline: [
          {
            $lookup: {
              from: 'markdown',
              localField: 'id',
              foreignField: 'id',
              as: 'markdown',
            },
          },
          {
            $lookup: {
              from: 'article',
              localField: 'id',
              foreignField: 'id',
              as: 'article',
            },
          },
          {
            $match: {
              content: { $ne: [] },
              ...query,
              $or: [
                { title: { $regex: new RegExp(keyword) } },
                { 'markdown.content': { $regex: new RegExp(keyword) } },
                { 'article.content': { $regex: new RegExp(keyword) } },
              ],
            },
          },
          {
            $project: {
              _id: 1,
              id: 1,
              title: 1,
              type: 1,
              parentId: 1,
              accountId: 1,
              parentFolderTitle: 1,
              parentKey: 1,
              key: 1,
              createTime: 1,
              updateTime: 1,
              inRecycle: 1,
              parentInRecycle: 1,
              size: 1,
            },
          },
        ],
      });
      return { success: 1, data: res, text: '获取成功' };
    } catch (err) {
      return { success: 0, text: '获取失败' };
    }
  }

  /**
   * 生成共享文件
   * @param {string} key - 文件key
   * @param { number } ts - 共享时长
   * @param { Object } creator - 分享者
   * @param {string} creator.username - 分享者名称
   * @param {string} creator.email - 分享者邮箱
   * @param {string} creator.avatar - 分享者头像
   */
  async setShareFile(key, ts, creator) {
    try {
      await this.app.mongo.findOneAndDelete(Collections.SHAREFILES, {
        filter: { key },
      });
      await this.app.mongo.insertOne(Collections.SHAREFILES, {
        doc: {
          key,
          ts,
          creator,
        },
      });
      return { success: 1, text: '更新成功' };
    } catch (err) {
      return { success: 0, text: '更新失败' };
    }
  }

  /**
   * 评论分享文章
   * @param { string } key - 文章的key
   * @param { Object } commenter - 评论者
   * @param {string} commenter.username - 评论者名称
   * @param {string} commenter.email - 评论者邮箱
   * @param {string} commenter.avatar - 评论者头像
   * @param { string } comment - 评论内容
   */
  async commentShareFile(key, commenter, comment) {
    try {
      const response = {
        commenter,
        comment,
        id: uuidv4(),
      };
      await this.app.mongo.findOneAndUpdate(Collections.SHAREFILES, {
        filter: {
          key,
        },
        update: { $addToSet: { responses: response } },
      });
      return { success: 0, text: '更新成功' };
    } catch {
      return { success: 0, text: '更新失败' };
    }
  }

  /**
   * 点赞、取消点赞分享文章
   * @param { string } key - 文章的key
   * @param { string } email - 点赞邮箱
   * @param { boolean } cancel - 取消点赞
   */
  async likeShareFile(key, email, cancel) {
    try {
      await this.app.mongo.findOneAndUpdate(Collections.SHAREFILES, {
        filter: {
          key,
        },
        update: cancel
          ? { $pull: { likes: email } }
          : { $addToSet: { likes: email } },
      });
      return { success: 0, text: '更新成功' };
    } catch {
      return { success: 0, text: '更新失败' };
    }
  }

  /**
   * 最近阅读分享文章
   * @param { string } key - 文章的key
   * @param { string } email - 邮箱
   */
  async recentReadShareFile(key, email) {
    try {
      await this.app.mongo.findOneAndUpdate(Collections.SHAREFILES, {
        filter: {
          key,
        },
        update: { $addToSet: { read: email } },
      });
      return { success: 0, text: '更新成功' };
    } catch {
      return { success: 0, text: '更新失败' };
    }
  }

  /**
   * 获取文件内容
   * @param {string} accountId - 用户id
   * @param {string} id - 文件id
   * @param {string} type - 类型
   */
  async fileContentGet(accountId, id, type) {
    try {
      const query = {
        accountId,
        id,
      };
      const db = type;
      const res = await this.app.mongo.findOne(db, { query });
      return { success: 1, data: res.content || '', text: '获取成功' };
    } catch (err) {
      return { success: 0, text: '获取失败' };
    }
  }
}
