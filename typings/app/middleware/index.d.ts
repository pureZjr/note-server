// This file is created by egg-ts-helper@1.25.7
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAuthority from '../../../app/middleware/authority';

declare module 'egg' {
  interface IMiddleware {
    authority: typeof ExportAuthority;
  }
}
