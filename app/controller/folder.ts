import { Controller } from 'egg';

export default class ArticleController extends Controller {
  async create() {
    const ctx = this.ctx;
    const res = await ctx.service.folder.create({ ...ctx.request.body, accountId: ctx.accountId });
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
      data: res.data,
    };
  }

  async get() {
    const ctx = this.ctx;
    const { parentKey } = ctx.request.query;
    const res = await ctx.service.folder.get(ctx.accountId, parentKey);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      data: res.data,
      text: res.text,
    };
  }

  async getTree() {
    const ctx = this.ctx;
    const res = await ctx.service.folder.getFolderTree(ctx.accountId);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      data: res.data,
      text: res.text,
    };
  }

  async del() {
    const ctx = this.ctx;
    const { id } = ctx.request.body;
    const res = await ctx.service.folder.del(id, ctx.accountId);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }

  async delComplete() {
    const ctx = this.ctx;
    const { id } = ctx.request.body;
    const res = await ctx.service.folder.delComplete(id, ctx.accountId);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }

  async edit() {
    const ctx = this.ctx;
    const res = await ctx.service.folder.edit({ ...ctx.request.body, accountId: ctx.accountId });
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }

  async getDelFolder() {
    const ctx = this.ctx;
    const { key } = ctx.request.query;
    const res = await ctx.service.folder.getDelFolder(ctx.accountId, key);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      data: res.data,
      text: res.text,
    };
  }

  async info() {
    const ctx = this.ctx;
    const { key } = ctx.request.query;
    const res = await ctx.service.folder.info(ctx.accountId, key);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      data: res.data,
      text: res.text,
    };
  }

  async getNewestFolder() {
    const ctx = this.ctx;
    const res = await ctx.service.folder.getNewestFolder(ctx.accountId);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      data: res.data,
      text: res.text,
    };
  }


  async searchFolder() {
    const ctx = this.ctx;
    const { key, keyword, type } = ctx.request.query;
    const res = await ctx.service.folder.searchFolder(ctx.accountId, keyword, type, key);
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
    const res = await ctx.service.folder.recoverFolder(ctx.accountId, id);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }

  async rename() {
    const ctx = this.ctx;
    const { id, title } = ctx.request.body;
    const res = await ctx.service.folder.renameFolder(ctx.accountId, id, title);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }

  async setTop() {
    const ctx = this.ctx;
    const { id, is_top } = ctx.request.body;
    const res = await ctx.service.folder.setTop(ctx.accountId, id, is_top);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }
}

