import { Controller } from 'egg';


export default class ArticleController extends Controller {

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
}

