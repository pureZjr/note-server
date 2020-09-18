import { Controller } from 'egg';
import * as jsonwebtoken from 'jsonwebtoken';


export default class AccountController extends Controller {
  async register() {
    const ctx = this.ctx;
    const res = await ctx.service.account.register(ctx.request.body);
    // 设置响应体和状态码
    ctx.body = {
      status: res.success === 1 ? 'ok' : 'error',
      text: res.text,
    };
  }

  async login() {
    const ctx = this.ctx;
    const res = await ctx.service.account.login(ctx.request.body);
    if (res.success === 1) {
      await this.ctx.service.cache.set(ctx.request.body.email, res.data, 7 * 24 * 60 * 60);
      ctx.body = {
        status: 'ok',
        text: res.text,
        data: res.data,
      };
    } else {
      ctx.body = {
        status: 'error',
        text: res.text,
      };
    }

  }

  async logout() {
    const ctx = this.ctx;
    const { token } = ctx.header;
    const { email } = jsonwebtoken.verify(token, 'motherfuck');
    await this.ctx.service.cache.del(email);
    ctx.body = {
      status: 'ok',
      text: '登出成功',
    };
  }

  async edit() {
    const ctx = this.ctx;
    const res = await this.ctx.service.account.edit({
      ...ctx.request.body,
      id: ctx.accountId,
    });
    if (res.success === 1) {
      ctx.body = {
        status: 'ok',
        text: res.text,
      };
    } else {
      ctx.body = {
        status: 'error',
        text: res.text,
      };
    }

  }

}
