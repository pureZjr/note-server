import { Controller } from 'egg';


export default class ArticleController extends Controller {
  async create() {
    const ctx = this.ctx;
    const res = await ctx.service.article.create({ ...ctx.request.body, accountId: ctx.accountId });
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error', text: res.text, data: res.data,
    };
  }

  async getFolderArticles() {
    const ctx = this.ctx;
    const { parentKey } = ctx.request.query;
    const res = await ctx.service.article.getInFolder(ctx.accountId, parentKey);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      data: res.data,
      text: res.text,
    };
  }

  async get() {
    const ctx = this.ctx;
    const { id } = ctx.request.query;
    const res = await ctx.service.article.get(id, ctx.accountId);
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
    const res = await ctx.service.article.del(id, ctx.accountId);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }

  async delComplete() {
    const ctx = this.ctx;
    const { id, type } = ctx.request.body;
    const res = await ctx.service.article.delComplete(id, ctx.accountId, type);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }

  async edit() {
    const ctx = this.ctx;
    const res = await ctx.service.article.edit({ ...ctx.request.body, accountId: ctx.accountId });
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }

  async getDelArticle() {
    const ctx = this.ctx;
    const res = await ctx.service.article.getDelArticle(ctx.accountId);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      data: res.data,
      text: res.text,
    };
  }

  async getNewestArticle() {
    const ctx = this.ctx;
    const res = await ctx.service.article.getNewestArticle(ctx.accountId);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      data: res.data,
      text: res.text,
    };
  }

  async searchArticle() {
    const ctx = this.ctx;
    const { key, keyword, type } = ctx.request.query;
    const res = await ctx.service.article.searchArticle(ctx.accountId, keyword, type, key);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      data: res.data,
      text: res.text,
    };
  }

  async articleContentGet() {
    const ctx = this.ctx;
    const { id, type } = ctx.request.query;
    const res = await ctx.service.article.articleContentGet(ctx.accountId, id, type);
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
    const res = await ctx.service.article.recoverArticle(ctx.accountId, id);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }

  async rename() {
    const ctx = this.ctx;
    const { id, title } = ctx.request.body;
    const res = await ctx.service.article.renameArticle(ctx.accountId, id, title);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }

  async setTop() {
    const ctx = this.ctx;
    const { id, is_top } = ctx.request.body;
    const res = await ctx.service.article.setTop(ctx.accountId, id, is_top);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }

  async getShareArticle() {
    const ctx = this.ctx;
    const { key } = ctx.request.query;
    const res = await ctx.service.article.getShareArticle(key);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      data: res.data,
      text: res.text,
    };
  }

  async setShareArticle() {
    const ctx = this.ctx;
    const { key, ts } = ctx.request.body;
    const res = await ctx.service.article.setShareArticle(key, ts);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }
}

