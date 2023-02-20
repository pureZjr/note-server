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
      host: '127.0.0.1',
      port: '27017',
      name: 'note',
      user: '',
      password: '',
      options: {
        useUnifiedTopology: true,
      },
    },
  };

  config.redis = {
    client: {
      port: 6379,
      host: '127.0.0.1',
      password: 'note',
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
