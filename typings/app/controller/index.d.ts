// This file is created by egg-ts-helper@1.25.7
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportAccount from '../../../app/controller/account';
import ExportArticle from '../../../app/controller/article';
import ExportFolder from '../../../app/controller/folder';
import ExportHome from '../../../app/controller/home';

declare module 'egg' {
  interface IController {
    account: ExportAccount;
    article: ExportArticle;
    folder: ExportFolder;
    home: ExportHome;
  }
}
