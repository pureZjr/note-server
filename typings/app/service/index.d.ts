// This file is created by egg-ts-helper@1.25.7
// Do not modify this file!!!!!!!!!

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportAccount from '../../../app/service/Account';
import ExportArticle from '../../../app/service/Article';
import ExportCache from '../../../app/service/Cache';
import ExportFolder from '../../../app/service/Folder';

declare module 'egg' {
  interface IService {
    account: AutoInstanceType<typeof ExportAccount>;
    article: AutoInstanceType<typeof ExportArticle>;
    cache: AutoInstanceType<typeof ExportCache>;
    folder: AutoInstanceType<typeof ExportFolder>;
  }
}
