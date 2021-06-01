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
    states:"https://cdn-api.co-vin.in/api/v2/admin/location/states",
    districts:"https://cdn-api.co-vin.in/api/v2/admin/location/districts/",
  }

  private TOKEN_ID='';

  private TOKEN=``;

  private beneficiary=[];

  constructor(
    private storageService:StorageService,
  ) { }

  setToken(token:string){
    this.TOKEN=token;
    this.storageService.set("token", token);
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
      .catch(error => {
        this.resetToken();
        reject(error)
      });
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
            this.setToken(obj.token)
            this.getBeneficiaries();
            resolve("success");
          }else{
            reject("No Token")
          }
        }catch(err){
          reject(err)
        }
      })
      .catch(error => {
        this.resetToken();
        reject(error)
      });
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
          this.resetToken();
          reject(err)
        }
      })
      .catch(error => {
        this.resetToken();
        reject(error);
      })
    });
  }

  getStateList():Promise<any>{
   
    return new Promise((resolve,reject)=>{
      
      let requestOptions:any = {
        method: 'GET',
        headers: this.getAuthHeaders(),
        redirect: 'follow'
      };
      fetch(this.URLS.states, requestOptions)
      .then(response => response.text())
      .then(result => {
        try{
          let respObj= JSON.parse(result);
          resolve(respObj.states);
        }catch(error){
          this.resetToken();
          reject(error)
        }
        
      })
      .catch(error => {
        this.resetToken();
        reject(error)
      });
    });
  }


  getStatewiseDistrict(stateId): Promise<any>{
    return new Promise((resolve,reject)=>{
      
      let requestOptions:any = {
        method: 'GET',
        headers: this.getAuthHeaders(),
        redirect: 'follow'
      };
      fetch(this.URLS.districts+stateId, requestOptions)
      .then(response => response.text())
      .then(result => {
        try{
          let respObj= JSON.parse(result);
          resolve(respObj.districts);
        }catch(error){
          this.resetToken();
          reject(error)
        }
        
      })
      .catch(error => {
        this.resetToken();
        reject(error)
      });
    });
  }

  getVaccineType(): Promise<any>{
    return new Promise((resolve,reject)=>{
      setTimeout(() => {
        resolve(['covisheild','covaxin','sputvik', "any"]);
      }, 500);
    });
  }

  getVaccineFeeType(): Promise<any>{
    return new Promise((resolve,reject)=>{
      setTimeout(() => {
        resolve(['paid','free', "any"]);
      }, 500);
    });
  }

  resetToken(){
    alert("Token expired.")
    window.location.reload();
    this.storageService.set("token","");
  }

}
