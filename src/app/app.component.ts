import { Component } from '@angular/core';
import { HttpClientService, ServerApiStatusCode } from './service/http-client.service';
declare const yzb: any;

interface OAppConfig {
  appId: string;   // 当前 app_id 为猿之棒开放平台所添加应用对应生成的appid值
  getJsTicketUrl: string;
  jsArray: Array<string>;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  appConfig: OAppConfig = {
    appId: '101169',
    jsArray: [
      'core.requestAuthCode',
      'core.requestAccess',
      'network.request'
    ],
    getJsTicketUrl: 'https://yzb-code-storage-api-app.david-health.cn/Api/getJsApiCheckInfo',
  }
  content: any;
  constructor(private httpClient: HttpClientService) {
  }

  getAccessCode() {
    if (yzb.helper.isRunInClientDesktop()) {
      // 获取 access code
      this.content = '正在获取中...';
      this.getAuthCode().then((code) => {
        // 获取 code 成功
        this.content = code;
      }).catch(error => {
        this.content = '获取 access code 失败';
      });
    } else {
      alert('请在猿之棒应用内调试！');
    }
  }
  
  getAuthCode() {
    return new Promise((resolve, reject) => {
      this.getJsTicketInfo().then((result: object | any) => {
        result['js_api_list'] = this.appConfig.jsArray;
        result['is_spa'] = true;  // 是否为单页应用
        // 进行config配置
        this.config(result).then(() => {
          // 配置成功可以进行获取access code
          this.requestAuthCode(this.appConfig.appId).then((code) => {
            // 这里返回code信息，请求交换用户信息 / token
            resolve(code);
          }).catch((error) => {
            reject(error);
          });
        }).catch((error) => {
          reject(error);
        });
      }).catch((error) => {
        reject(error);
      });
    })
  }

  // 获取数据js签名信息
  getJsTicketInfo() {
    return new Promise((resolve, reject) => {
      const url = window.location.href;
      const postData = { url: url };
      this.httpClient.getDataFromServer(this.appConfig.getJsTicketUrl, postData).then((response) => {
        if (ServerApiStatusCode.Success === response.status) {
          // 验证成功
          resolve(response.data);
        } else {
          reject(response);
        }
      }).catch((error) => {
        reject(error);
      });
    });
  }

  // 进行config配置
  config(jsTicketInfo: any) {
    return new Promise((resolve, reject) => {
      const config = {
        data: jsTicketInfo,
        next: (result: object) => {
          resolve(result);
        },
        error: (error: any) => {
          reject(error);
        }
      };
      yzb.core.config(config);
    });
  }

  // 获取access code
  requestAuthCode(appId: string) {
    return new Promise((resolve, reject) => {
      const config = {
        data: { app_id: appId },
        next: (result: object | any) => {
          const code: string = result.code;
          resolve(code);
        },
        error: (error: any) => {
          reject(error);
        }
      };
      yzb.core.requestAuthCode(config);
    });
  }

}
