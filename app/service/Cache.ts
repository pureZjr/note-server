const Service = require('egg').Service;

export default class CacheService extends Service {
  async set(key, value, seconds) {
    value = JSON.stringify(value);
    if (this.app.redis) {
      if (!seconds) {
        await this.app.redis.set(key, value);
      } else {
        await this.app.redis.set(key, value, 'EX', seconds);
      }
    }
  }

  async get(key) {
    if (this.app.redis) {
      const data = await this.app.redis.get(key);
      if (!data) return;
      return JSON.parse(data);
    }
  }

  async del(key) {
    if (this.app.redis) {
      await this.app.redis.del(key);
    }
  }


}

