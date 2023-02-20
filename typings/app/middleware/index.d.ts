// This file is created by egg-ts-helper@1.30.2
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAuthority from '../../../app/middleware/authority';
import ExportDoNotCheckTokenUrl from '../../../app/middleware/doNotCheckTokenUrl';

declare module 'egg' {
  interface IMiddleware {
    authority: typeof ExportAuthority;
    doNotCheckTokenUrl: typeof ExportDoNotCheckTokenUrl;
  }
}
