import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, timeout } from 'rxjs';

// 服务器api返回值类型
export enum ServerApiStatusCode {
  Success = '2000', // 成功的状态码2000
  CommonError = '4000', // 普通错误4000
  TokenError = '4001', // token过期 4001
  NoAccess = '4003',  // 用户无权限
}

export interface ApiResponse {
  status: string;
  message: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {

  constructor(private httpClient: HttpClient) { }

  getDataFromServer(url: string, postData: object | any, header = {}, timeoutNumber = 1000 * 15): Promise<ApiResponse> {
    const formData = new FormData();
    Object.keys(postData).forEach((key) => {
        formData.append(key, postData[key]);
    });
    const headers = { headers: header };
    return new Promise((resolve, reject) => {
      this.httpClient.post(url, formData, headers)
        .pipe(timeout(timeoutNumber))
        .subscribe({
            next: (response: any) => {
              const responseObject = {
                status: response.status,
                message: response.message,
                data: response.data,
              };
              resolve(responseObject);
            },
            error: (error) => {
              reject(error);
            },
            complete: () => {
            }
        });
    });
  }

}
