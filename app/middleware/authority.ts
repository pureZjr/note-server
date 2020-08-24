import * as jsonwebtoken from 'jsonwebtoken';

export default () => {

  const authority = async (ctx, next) => {
    const { token } = ctx.header;
    const hasToken = !!token;
    if (ctx.url.indexOf('account-') > -1) {
      await next();
    } else if (hasToken) {
      const { id, email } = jsonwebtoken.verify(token, 'motherfuck');
      const redisData = await ctx.service.cache.get(email);
      if (!!redisData && redisData.token === token) {
        ctx.accountId = id;
        await next();
      } else {
        await next();
        ctx.body = {
          status: 'error',
          logout: true,
          text: '登录已过期，请重新登录！',
        };
      }

    } else {
      ctx.body = {
        status: 'error',
        text: '没有权限，请先登录！',
      };
    }

  };
  return authority;
};
