import { Service } from 'egg';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';

import { IFile } from './File';
import { Collections } from '../constant/index';

interface IFolder {
  id?: string;
  title?: string;
  parentId?: string;
  index: number;
  key: string;
  children: IFolder[];
  accountId?: string;
  isTop?: 1 | 0;
  tags?: string[];
  parentIds?: string[];
}

export enum Types {
  NewDoc = '1',
  MyFolder = '2',
  Recycle = '3'
}

/**
 * Folder Service
 */
export default class File extends Service {
  /**
   * 新增文件夹
   * @param {Object} folder - 文件夹对象
   * @param {string} folder.title - 文件夹标题
   * @param {string} folder.id - 父文件夹id
   * @param {string} folder.accountId - 用户id
   * @param {string} folder.key - 父文件夹key
   */

  async create(folder: IFolder) {
    try {
      const id = uuidv4();
      const extra = {
        createTime: new Date().getTime(),
        updateTime: new Date().getTime(),
        inRecycle: false,
        parentInRecycle: false,
        accountId: folder.accountId,
        isTop: 0,
        tags: [],
      };
      // 判断文件夹名称是否存在
      const existFolder = await this.app.mongo.findOne(Collections.FOLDERS, { query: { accountId: folder.accountId, inRecycle: false, title: folder.title, parentKey: folder.key } });
      // 获取父文件夹的key
      if (existFolder) {
        return { success: 0, text: '创建失败,名称已存在' };
      }
      const doc = { ...folder, id, parentKey: folder.key, key: `${folder.key}-${id}`, ...extra };
      await this.app.mongo.insertOne(Collections.FOLDERS, { doc });
      return { success: 1, data: { doc }, text: '创建成功' };
    } catch {
      return { success: 0, text: '创建失败' };
    }
  }

  /**
   * 获取文件夹
 * @param {string} accountId - 用户id
 * @param {string} parentKey - 父文件夹key
 * @param {string} sort - 排序，默认更新时间
 */
  async get(accountId: string, parentKey: string, sort: string) {
    const sortBy = {};
    sortBy[sort] = -1;
    const folders = (await this.app.mongo.find(Collections.FOLDERS, {
      query: { parentKey, accountId, inRecycle: false }, sort:
        sortBy,
    })) as IFolder[];
    return { success: 1, data: folders, text: '成功' };
  }

  /**
* 获取文件夹树
* @param {string} accountId - 用户id
*/
  async getFolderTree(accountId: string) {
    const getFolders = async (parentKey: string) => {
      const folders = (await this.app.mongo.find(Collections.FOLDERS, {
        query: { parentKey, accountId, inRecycle: false },
      })) as IFolder[];
      return folders;
    };
    // 一级目录
    const folderTree = await getFolders('2');
    const addChildren = async (folders: IFolder[]) => {
      for (const folder of folders) {
        const childrenFolders = await getFolders(`${folder.key}`);
        folder.children = childrenFolders || [];
        if (childrenFolders.length) {
          await addChildren(childrenFolders);
        }
      }
    };
    await addChildren(folderTree);
    return { success: 1, data: folderTree, text: '成功' };
  }

  /**
* 删除文件夹，包含里面内容（软删除）
* @param {string} id - 文件夹id
* @param {string} accountId - 用户id
*/
  async del(id: string, accountId: string) {
    try {
      await this.app.mongo.findOneAndUpdate(Collections.FOLDERS, {
        filter: { id, accountId }, update: {
          $set: { inRecycle: true },
        },
      });
      await this.app.mongo.updateMany(Collections.FOLDERS, { filter: { key: { $regex: new RegExp(`${id}-`) }, accountId }, update: { $set: { inRecycle: true, parentInRecycle: true } } });
      await this.app.mongo.updateMany(Collections.FILES, { filter: { key: { $regex: new RegExp(`${id}-`) }, accountId }, update: { $set: { inRecycle: true, parentInRecycle: true } } });
      return { success: 1, text: '删除成功' };
    } catch {
      return { success: 0, text: '删除失败' };
    }
  }

  /**
* 删除文件夹（彻底删除）
* @param {string} id - 文件夹id
* @param {string} accountId - 用户id
*/
  async delComplete(id: string, accountId: string) {
    try {
      await this.app.mongo.deleteMany(Collections.FOLDERS, { filter: { key: { $regex: new RegExp(`${id}`) }, accountId } });
      const articles = await this.app.mongo.find(Collections.FILES, { query: { key: { $regex: new RegExp(`${id}`) }, accountId } }) as IFile[];
      this.app.mongo.deleteMany(Collections.FILES, { filter: { key: { $regex: new RegExp(`${id}`) }, accountId } });
      articles.forEach(v => {
        const db = v.type as string;
        this.app.mongo.findOneAndDelete(db, { filter: { id: v.id, accountId } });
      });
      return { success: 1, text: '删除成功' };
    } catch {
      return { success: 0, text: '删除失败' };
    }
  }

  /**
* 修改文件夹
* @param {Object} folder - 文件夹对象
* @param {string} folder.id - 文件夹id
* @param {string} folder.title - 文件夹标题
* @param {string} folder.accountId - 用户id
*/
  async edit(folder: IFolder) {
    try {
      const update = { ...folder };
      delete update.id;
      await this.app.mongo.findOneAndUpdate(Collections.FOLDERS, {
        filter: { id: folder.id, accountId: folder.accountId }, update: { $set: update },
      });
      return { success: 1, text: '更新成功' };
    } catch (err) {
      return { success: 0, text: '更新失败' };
    }
  }

  /**
 * 获取回收站的文件夹
 * @param {string} accountId - 用户id
 * @param {string} sort - 排序，默认更新时间
 */
  async getDelFolder(accountId, sort) {
    try {
      const query = {
        accountId, inRecycle: true,
        parentInRecycle: false,
      };
      const sortBy = {};
      sortBy[sort] = -1;
      const res = (await this.app.mongo.find(Collections.FOLDERS, { query, sort: { ...sortBy } })) as IFolder[];
      return { success: 1, data: res, text: '获取成功' };
    } catch (err) {
      return { success: 0, text: '获取失败' };
    }
  }

  /**
* 获取文件夹信息
* @param {string} accountId - 用户id
* @param {string} key - 文件夹key
*/
  async info(accountId, key) {
    try {
      const folders = (await this.app.mongo.find(Collections.FOLDERS, { query: { key, accountId, inRecycle: false } })) as IFolder[];
      return { success: 1, data: folders, text: '成功' };
    } catch { return { success: 0, text: '获取失败' }; }
  }

  /**
 * 获取最新文件夹
 * @param {string} accountId - 用户id
 */
  async getNewestFolder(accountId) {
    try {
      const query = {
        accountId,
        updateTime: { $gte: moment().subtract('days', 7).valueOf() },
        inRecycle: false,
      };
      const res = (await this.app.mongo.find(Collections.FOLDERS, { query })) as IFolder[];
      return { success: 1, data: res, text: '获取成功' };
    } catch (err) {
      return { success: 0, text: '获取失败' };
    }
  }

  /**
 * 搜索文件夹
 * @param {Object} args - 搜索参数
 * @param {string} args.accountId - 用户id
 * @param {string} args.keyword - 关键字
 * @param {string} args.type - 类型
 * @param {string} args.parentKey - 父文件key
 * @param {string} args.sort - 排序
 */
  async searchFolder({
    accountId, keyword, type, parentKey, sort,
  }) {
    try {
      const query = {
        accountId,
        title: { $regex: new RegExp(`${keyword}`) },
      };
      if (type === Types.NewDoc) {
        Object.assign(query, {
          updateTime: { $gte: moment().subtract('days', 7).valueOf() },
          inRecycle: false,
        });
      } else if (type === Types.MyFolder) {
        Object.assign(query, {
          inRecycle: false,
        });
        if (parentKey) {
          Object.assign(query, {
            key: { $regex: new RegExp(`^${parentKey}-`) },
          });
        }
      } else {
        Object.assign(query, {
          inRecycle: true,
        });
      }
      const sortBy = {};
      sortBy[sort] = -1;
      const res = (await this.app.mongo.find(Collections.FOLDERS, { query, sort: { sortBy: -1 } })) as IFolder[];
      return { success: 1, data: res, text: '获取成功' };
    } catch (err) {
      return { success: 0, text: '获取失败' };
    }
  }

  /**
* 恢复文件夹
* @param {string} accountId - 用户id
* @param {string} id - 文件夹id
*/
  async recoverFolder(accountId, id) {
    try {
      await this.app.mongo.updateMany(Collections.FOLDERS, {
        filter: { id, accountId }, update: {
          $set: { inRecycle: false },
        },
      });
      await this.app.mongo.updateMany(Collections.FOLDERS, { filter: { key: { $regex: new RegExp(`${id}`) }, accountId }, update: { $set: { inRecycle: false, parentInRecycle: false } } });
      await this.app.mongo.updateMany(Collections.FILES, { filter: { key: { $regex: new RegExp(`${id}`) }, accountId }, update: { $set: { inRecycle: false, parentInRecycle: false } } });
      return { success: 1, text: '删除成功' };
    } catch {
      return { success: 0, text: '删除失败' };
    }
  }

  /**
* 重命名
* @param {string} accountId - 用户id
* @param {string} id - 文件夹id
* @param {string} title - 标题
*/
  async renameFolder(accountId, id, title) {
    try {
      // 判断文件名称是否存在
      const folderInfo = await this.app.mongo.findOne(Collections.FOLDERS, { query: { accountId, id } }) as IFolder;
      const existFolderTitle = await this.app.mongo.findOne(Collections.FOLDERS, { query: { accountId, parentId: folderInfo.parentId, title } }) as IFolder;
      if (existFolderTitle) {
        return { success: 0, text: '创建失败,名称已存在' };
      }
      await this.app.mongo.findOneAndUpdate(Collections.FOLDERS, { filter: { id, accountId }, update: { $set: { title } } });
      return { success: 1, text: '修改成功' };
    } catch {
      return { success: 0, text: '修改失败' };
    }
  }

  /**
* 文件夹置顶、取消置顶
* @param {string} accountId - 用户id
* @param {string} id - 文件夹id
* @param {boolean} is_top - 是否置顶
*/
  async setTop(accountId, id, is_top) {
    try {
      await this.app.mongo.findOneAndUpdate(Collections.FOLDERS, {
        filter: { id, accountId }, update: { $set: { isTop: is_top } },
      });
      return { success: 1, text: '更新成功' };
    } catch (err) {
      return { success: 0, text: '更新失败' };
    }
  }

}

