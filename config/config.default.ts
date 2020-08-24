import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1586678617467_4883';

  // add your egg config in here
  config.middleware = ['authority'];

  config.security = {
    domainWhiteList: ['http://localhost:8080'],
    csrf: {
      enable: false,
      queryName: '_csrf', // 通过 query 传递 CSRF token 的默认字段为 _csrf
      bodyName: '_csrf', // 通过 body 传递 CSRF token 的默认字段为 _csrf
    },
  };

  config.cors = {
    origin: '*',
  };

  config.mongo = {
    client: {
      host: '47.107.72.163',
      port: '22222',
      name: 'blog',
      user: '',
      password: '',
      options: {},
    },
  };

  config.redis = {
    client: {
      port: 6379,
      host: '47.107.72.163',
      password: 'pure123',
      db: 0,
      reconnectOnError: () => 2,
    },
  };

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
  };

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
