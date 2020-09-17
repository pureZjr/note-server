import { Controller } from 'egg';
import * as qiniu from 'qiniu';


const config = {
  AK: 'azSrR1H1o5IMgtfdO7zA270C5Q3J9bHoe0-ftiYC',
  SK: 'fK0SYdSZ2QydWZQGMBPiD-WECUdk2Da0XChXo7Ms',
};


export default class QiniuController extends Controller {
  public async token() {
    const { AK, SK } = config;
    const ctx = this.ctx;
    const { bucket } = ctx.request.query;
    const mac = new qiniu.auth.digest.Mac(AK, SK);
    const options = {
      scope: `${bucket}`,
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(mac);
    ctx.body = {
      status: 'ok',
      data: uploadToken,
      text: '头像上传失败',
    };
  }
}
