// This file is created by egg-ts-helper@1.30.2
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAccount from '../../../app/controller/account';
import ExportFile from '../../../app/controller/file';
import ExportFolder from '../../../app/controller/folder';
import ExportQiniu from '../../../app/controller/qiniu';

declare module 'egg' {
  interface IController {
    account: ExportAccount;
    file: ExportFile;
    folder: ExportFolder;
    qiniu: ExportQiniu;
  }
}
