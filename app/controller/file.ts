import { Controller } from 'egg';

export default class File extends Controller {
  async create() {
    const ctx = this.ctx;
    const res = await ctx.service.file.create({ ...ctx.request.body, accountId: ctx.accountId });
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error', text: res.text, data: res.data,
    };
  }

  async delete() {
    const ctx = this.ctx;
    const { id } = ctx.request.body;
    const res = await ctx.service.file.del(id, ctx.accountId);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }

  async delComplete() {
    const ctx = this.ctx;
    const { id, type } = ctx.request.body;
    const res = await ctx.service.file.delComplete(id, ctx.accountId, type);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }

  async getFolderFiles() {
    const ctx = this.ctx;
    const { parentKey, sort } = ctx.request.query;
    const res = await ctx.service.file.getInFolder(ctx.accountId, parentKey, sort);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      data: res.data,
      text: res.text,
    };
  }

  async get() {
    const ctx = this.ctx;
    const { id, sort } = ctx.request.query;
    const res = await ctx.service.file.get(id, ctx.accountId, sort);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      data: res.data.length ? res.data[0] : {},
      text: res.text,
    };
  }

  async del() {
    const ctx = this.ctx;
    const { id } = ctx.request.body;
    const res = await ctx.service.file.del(id, ctx.accountId);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }

  async edit() {
    const ctx = this.ctx;
    const res = await ctx.service.file.edit({ ...ctx.request.body, accountId: ctx.accountId });
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }

  async getDelFile() {
    const ctx = this.ctx;
    const { sort } = this.ctx.request.query;
    const res = await ctx.service.file.getDelFile(ctx.accountId, sort);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      data: res.data,
      text: res.text,
    };
  }

  async getNewestFile() {
    const ctx = this.ctx;
    const { sort } = ctx.request.query;
    const res = await ctx.service.file.getNewestFile(ctx.accountId, sort);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      data: res.data,
      text: res.text,
    };
  }

  async searchFile() {
    const ctx = this.ctx;
    const { key, keyword, type } = ctx.request.query;
    const tab = type;
    const res = await ctx.service.file.searchFile(ctx.accountId, keyword, tab, key);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      data: res.data,
      text: res.text,
    };
  }

  async recover() {
    const ctx = this.ctx;
    const { id } = ctx.request.body;
    const res = await ctx.service.file.recoverFile(ctx.accountId, id);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }

  async rename() {
    const ctx = this.ctx;
    const { id, title, type } = ctx.request.body;
    const res = await ctx.service.file.renameFile(ctx.accountId, id, title, type);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }

  async setTop() {
    const ctx = this.ctx;
    const { id, is_top } = ctx.request.body;
    const res = await ctx.service.file.setTop(ctx.accountId, id, is_top);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }

  async getShareFile() {
    const ctx = this.ctx;
    const { key } = ctx.request.query;
    const res = await ctx.service.file.getShareFile(key);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      data: res.data,
      text: res.text,
    };
  }

  async setShareFile() {
    const ctx = this.ctx;
    const { key, ts } = ctx.request.body;
    const res = await ctx.service.file.setShareFile(key, ts);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }

  async fileContentGet() {
    const ctx = this.ctx;
    const { id, type } = ctx.request.query;
    const res = await ctx.service.file.fileContentGet(ctx.accountId, id, type);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      data: res.data,
      text: res.text,
    };
  }

}
