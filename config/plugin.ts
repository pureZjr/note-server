import { EggPlugin } from 'egg';

const plugin: EggPlugin = {
  static: true,
  // nunjucks: {
  //   enable: true,
  //   package: 'egg-view-nunjucks',
  // },
  // mysql: {
  //   enable: true,
  //   package: 'egg-mysql',
  // },
  mongo: {
    enable: true,
    package: 'egg-mongo-native',
  },
  cors: {
    enable: true,
    package: 'egg-cors',
  },
  redis: {
    enable: true,
    package: 'egg-redis',
  },
};

export default plugin;
