import { Injectable } from '@angular/core';
import jsSHA from 'jssha'
import { Util } from '../utils';
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
    calenderDistrict : "https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict",
    calenderPincode : "https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByPin"
  }

  

  

  private beneficiary=[];

  constructor(
    private storageService:StorageService,
  ) { }

  

  generateHeader(){
    let apiHeaders = new Headers();
    for(let header in this.HEADERS){
      apiHeaders.append(header,this.HEADERS[header]);
    }
    return apiHeaders;
  }

  getAuthHeaders(token : string){
    let apiHeaders=this.generateHeader();
    apiHeaders.append("Authorization",`Bearer ${token}`);
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
            
            resolve(obj.txnId);
          }else{
            reject("No txnId")
          }
        }catch(err){
          reject(err)
        }
      })
      .catch(error => {
        
        reject(error)
      });
    });
  }
  
  verifyOtp(otp:string,tokenId:string):Promise<{token:string}>{
    let shaObj = new jsSHA("SHA-256", "TEXT");
    shaObj.update(otp);
    let otpHash = shaObj.getHash("HEX");

    return new Promise((resolve,reject)=>{
      
      let requestOptions:any = {
        method: 'POST',
        headers: this.generateHeader(),
        body: JSON.stringify({
          "txnId":tokenId,
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
            resolve({token:obj.token});
          }else{
            reject("No Token")
          }
        }catch(err){
          reject(err)
        }
      })
      .catch(error => {
        
        reject(error)
      });
    });
    

  }

  getBeneficiaries(token:string):Promise<any>{
   
    return new Promise((resolve,reject)=>{
      
      let requestOptions:any = {
        method: 'GET',
        headers: this.getAuthHeaders(token),
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
      .catch(error => {
        
        reject(error);
      })
    });
  }

  getStateList(token:string):Promise<any>{
   
    return new Promise((resolve,reject)=>{
      
      let requestOptions:any = {
        method: 'GET',
        headers: this.getAuthHeaders(token),
        redirect: 'follow'
      };
      fetch(this.URLS.states, requestOptions)
      .then(response => response.text())
      .then(result => {
        try{
          let respObj= JSON.parse(result);
          resolve(respObj.states);
        }catch(error){
          
          reject(error)
        }
        
      })
      .catch(error => {
        
        reject(error)
      });
    });
  }


  getStatewiseDistrict(token:string,stateId:number): Promise<any>{
    return new Promise((resolve,reject)=>{
      
      let requestOptions:any = {
        method: 'GET',
        headers: this.getAuthHeaders(token),
        redirect: 'follow'
      };
      fetch(this.URLS.districts+stateId, requestOptions)
      .then(response => response.text())
      .then(result => {
        try{
          let respObj= JSON.parse(result);
          resolve(respObj.districts);
        }catch(error){
          
          reject(error)
        }
        
      })
      .catch(error => {
        
        reject(error)
      });
    });
  }

  getVaccineType(): Promise<any>{
    return new Promise((resolve,reject)=>{
        resolve(['covisheild','covaxin','sputvik', "any"]);
    });
  }

  getVaccineFeeType(): Promise<any>{
    return new Promise((resolve,reject)=>{
        resolve(['paid','free', "any"]);
    });
  }

  

  saveData(collectionArray){
    this.storageService.set("collection",collectionArray);
  }

  getDistrictCalender(token:string, districtId, vaccineType){
    // district_id={0}&date={1}

    return new Promise((resolve,reject)=>{
      let date=Util.getDate();
      let requestOptions:any = {
        method: 'GET',
        headers: this.getAuthHeaders(token),
        redirect: 'follow'
      };
      fetch(this.URLS.calenderDistrict+`?district_id=${districtId}&date=${date}&vaccine=${vaccineType}`, requestOptions)
      .then(response => response.text())
      .then(result => {
        console.log(result);
        try{
          let bObj=JSON.parse(result);
          resolve(bObj);
        }catch(err){
          
          reject(err)
        }
      })
      .catch(error => {
        
        reject(error);
      })
    });
  }


}
