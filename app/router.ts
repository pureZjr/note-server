import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  // 文章
  router.post('/article-add', controller.article.create);
  router.get('/articleInFolder-get', controller.article.getFolderArticles);
  router.get('/article-get', controller.article.get);
  router.post('/article-del', controller.article.del);
  router.post('/article-del-complete', controller.article.delComplete);
  router.post('/article-edit', controller.article.edit);
  router.get('/del-article-get', controller.article.getDelArticle);
  router.get('/article-newest', controller.article.getNewestArticle);
  router.get('/search-article', controller.article.searchArticle);
  router.get('/article-content-get', controller.article.articleContentGet);
  router.post('/article-recover', controller.article.recover);

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

  // 用户
  router.post('/account-register', controller.account.register);
  router.post('/account-login', controller.account.login);
  router.post('/account-logout', controller.account.logout);
};
