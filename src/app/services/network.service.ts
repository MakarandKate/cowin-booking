import { Injectable } from '@angular/core';
import jsSHA from 'jssha'
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private API_SECRET="U2FsdGVkX1+z/4Nr9nta+2DrVJSv7KS6VoQUSQ1ZXYDx/CJUkWxFYG6P3iM/VW+6jLQ9RDQVzp/RcZ8kbT41xw==";

  private HEADERS={
    "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36",
    "origin":"https://selfregistration.cowin.gov.in/",
    "referer": "https://selfregistration.cowin.gov.in/",
    "Content-Type": "application/json"
  };
  private URLS={
    requestOTP:"https://cdn-api.co-vin.in/api/v2/auth/generateMobileOTP",
    verifyOtp:"https://cdn-api.co-vin.in/api/v2/auth/validateMobileOtp",
    beneficiaries:"https://cdn-api.co-vin.in/api/v2/appointment/beneficiaries",
  }

  private TOKEN_ID='';

  private TOKEN=`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiIwZTNjMjdhYy0zODE5LTRhYzktOWNlYi04YzQ4YzEzNzVkMzMiLCJ1c2VyX2lkIjoiMGUzYzI3YWMtMzgxOS00YWM5LTljZWItOGM0OGMxMzc1ZDMzIiwidXNlcl90eXBlIjoiQkVORUZJQ0lBUlkiLCJtb2JpbGVfbnVtYmVyIjo3NTg4NzYzODYyLCJiZW5lZmljaWFyeV9yZWZlcmVuY2VfaWQiOjIxMzM4ODI3MTAzODAwLCJzZWNyZXRfa2V5IjoiYjVjYWIxNjctNzk3Ny00ZGYxLTgwMjctYTYzYWExNDRmMDRlIiwic291cmNlIjoiIiwidWEiOiJNb3ppbGxhLzUuMCAoTWFjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAxMF8xNV83KSBBcHBsZVdlYktpdC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWUvOTAuMC40NDMwLjIxMiBTYWZhcmkvNTM3LjM2IiwiZGF0ZV9tb2RpZmllZCI6IjIwMjEtMDUtMzFUMDg6MTM6MDIuNDkyWiIsImlhdCI6MTYyMjQ0ODc4MiwiZXhwIjoxNjIyNDQ5NjgyfQ.UWKpfag_G7H0dL_88PNQcO9WMncQdJF9RjlkRUjxaHk`;

  private beneficiary=[];

  constructor(
    private storageService:StorageService,
  ) { }

  setTokenId(tokenId:string){
    this.TOKEN_ID=tokenId;
  }

  generateHeader(){
    let apiHeaders = new Headers();
    for(let header in this.HEADERS){
      apiHeaders.append(header,this.HEADERS[header]);
    }
    return apiHeaders;
  }

  getAuthHeaders(){
    let apiHeaders=this.generateHeader();
    apiHeaders.append("Authorization",`Bearer ${this.TOKEN}`);
    return apiHeaders;
  }

  requestOtp(phone:string):Promise<string>{
    this.storageService.set("phone",phone);
    return new Promise((resolve,reject)=>{
      
      let requestOptions:any = {
        method: 'POST',
        headers: this.generateHeader(),
        body: JSON.stringify({
          "mobile":phone,
          "secret":this.API_SECRET
        }),
        redirect: 'follow'
      };
      fetch(this.URLS.requestOTP, requestOptions)
      .then(response => response.text())
      .then(result => {
        try{
          let obj=JSON.parse(result);
          if(obj.txnId){
            this.TOKEN_ID=obj.txnId;
            resolve("success");
          }else{
            reject("No txnId")
          }
        }catch(err){
          reject(err)
        }
      })
      .catch(error => reject(error));
    });
    

  }
  
  verifyOtp(otp:string):Promise<string>{
    let shaObj = new jsSHA("SHA-256", "TEXT");
    shaObj.update(otp);
    let otpHash = shaObj.getHash("HEX");

    return new Promise((resolve,reject)=>{
      
      let requestOptions:any = {
        method: 'POST',
        headers: this.generateHeader(),
        body: JSON.stringify({
          "txnId":this.TOKEN_ID,
          "otp":otpHash
        }),
        redirect: 'follow'
      };
      fetch(this.URLS.verifyOtp, requestOptions)
      .then(response => response.text())
      .then(result => {
        try{
          let obj=JSON.parse(result);
          if(obj.token){
            this.TOKEN=obj.token;
            this.getBeneficiaries();
            resolve("success");
          }else{
            reject("No Token")
          }
        }catch(err){
          reject(err)
        }
      })
      .catch(error => reject(error));
    });
    

  }

  getBeneficiaries():Promise<any>{
   
    return new Promise((resolve,reject)=>{
      
      let requestOptions:any = {
        method: 'GET',
        headers: this.getAuthHeaders(),
        redirect: 'follow'
      };
      fetch(this.URLS.beneficiaries, requestOptions)
      .then(response => response.text())
      .then(result => {
        try{
          let bObj=JSON.parse(result);
          this.beneficiary=bObj.beneficiaries;
          resolve(this.beneficiary);
        }catch(err){
          reject(err)
        }
      })
      .catch(error => reject(error));
    });
  }

}
