import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  // 文件夹
  router.post('/folder-add', controller.folder.create);
  router.get('/folderTree-get', controller.folder.getTree);
  router.get('/folders-get', controller.folder.get);
  router.post('/folder-del', controller.folder.del);
  router.post('/folder-del-complete', controller.folder.delComplete);
  router.post('/folder-edit', controller.folder.edit);
  router.get('/del-folders-get', controller.folder.getDelFolder);
  router.get('/folder-info', controller.folder.info);
  router.get('/folder-newest', controller.folder.getNewestFolder);
  router.get('/search-folder', controller.folder.searchFolder);
  router.post('/folder-recover', controller.folder.recover);
  router.post('/folder-rename', controller.folder.rename);
  router.post('/folder-setTop', controller.folder.setTop);

  // 用户
  router.post('/account-register', controller.account.register);
  router.post('/account-login', controller.account.login);
  router.post('/account-logout', controller.account.logout);
  router.post('/account-edit', controller.account.edit);

  // 七牛
  router.get('/qiniu-token', controller.qiniu.token);

  // 文件
  router.post('/file-create', controller.file.create);
  router.post('/file-delete', controller.file.delete);
  router.post('/file-del-complete', controller.file.delComplete);
  router.post('/file-add', controller.file.create);
  router.get('/fileInFolder-get', controller.file.getFolderFiles);
  router.get('/file-get', controller.file.get);
  router.post('/file-del', controller.file.del);
  router.post('/file-del-complete', controller.file.delComplete);
  router.post('/file-edit', controller.file.edit);
  router.get('/del-file-get', controller.file.getDelFile);
  router.get('/file-newest', controller.file.getNewestFile);
  router.get('/search-file', controller.file.searchFile);
  router.post('/file-recover', controller.file.recover);
  router.post('/file-rename', controller.file.rename);
  router.post('/file-setTop', controller.file.setTop);
  router.get('/get-file-share', controller.file.getShareFile);
  router.post('/set-file-share', controller.file.setShareFile);
  router.get('/file-content-get', controller.file.fileContentGet);

};
