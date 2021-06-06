import { Injectable } from '@angular/core';
import jsSHA from 'jssha'
import { Util } from '../utils';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private API_SECRET="";

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
    calenderPincode : "https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByPin",
    captcha:"https://cdn-api.co-vin.in/api/v2/auth/getRecaptcha",
    book:"https://cdn-api.co-vin.in/api/v2/appointment/schedule",
    analytics:"https://script.google.com/macros/s/AKfycbyiUuXYuLkuhqfbRNOZ_jdcrDDQsLA5Ebxn9CRY5djNoGRxC0DpwHjGrgvcF3Fy4fvKCg/exec?",
    regAnalytics:"https://script.google.com/macros/s/AKfycbwLDdi3kahQ8LzFHoIvkuNynqIvHi5FtWXETETVH_L1O9EXTgrhN0XET29U9dWLkQAi/exec?"
  }


  

  

  private beneficiary=[];

  constructor(
    private storageService:StorageService,
  ) { }

  setApiSecret(secret:string){
    this.API_SECRET=secret;
  }

  checkVersion():Promise<any>{
   
    return new Promise((resolve,reject)=>{
      
      let requestOptions:any = {
        method: 'GET',
        redirect: 'follow'
      };
      fetch("https://api.npoint.io/cf2ee5529084b6b1a790", requestOptions)
      .then(response => response.text())
      .then(result => {
        try{
          let bObj=JSON.parse(result);
          if(bObj.appActive=="1"){
            this.setApiSecret(bObj.secret_key);
            resolve(bObj)
          }else{
            alert("App is expired. Uninstall the app");
          }
        }catch(err){
          
          reject(err)
        }
      })
      .catch(error => {
        
        reject(error);
      })
    });
  }

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
  
  requestCaptch(token:string):Promise<string>{
    return new Promise((resolve,reject)=>{
      
      let requestOptions:any = {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        redirect: 'follow'
      };
      fetch(this.URLS.captcha, requestOptions)
      .then(response => response.text())
      .then(result => {
        try{
          let resultObj=JSON.parse(result);
          if(resultObj.captcha){
            resolve(resultObj.captcha);
          }else{
            reject("");
          }
        }catch(err){
          reject(err);
        }
        
      })
      .catch(error => {
        
        reject(error)
      });
    });
  }

  book(token:string,details):Promise<string>{
    return new Promise((resolve,reject)=>{
      
      let requestOptions:any = {
        method: 'POST',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(details),
        redirect: 'follow',
      };
      fetch(this.URLS.book, requestOptions)
      .then(async response => {
        if(response.status==200){
          try{
            let resObj=JSON.parse(await response.text());
            if(resObj.appointment_confirmation_no){
              resolve(resObj.appointment_confirmation_no)
            }else{
              reject("")
            }
          }catch(err){
            reject("")
          }
          
          
        }else{
          reject(await response.text());
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

  getDistrictCalender(token:string, userData){
    // district_id={0}&date={1}

    return new Promise(async (resolve,reject)=>{
      try{
        let date=Util.getDate();
        let vaccineType='';
        if(userData.vaccine_type!="ANY"){
          vaccineType='&vaccine='+userData.vaccine_type;
        }
        let requestOptions:any = {
          method: 'GET',
          headers: this.getAuthHeaders(token),
          redirect: 'follow'
        };
        let resultArray=[];
        for(let i=0;i<userData.location_dtls.length;i++){
          let apiResponse=await fetch(this.URLS.calenderDistrict+`?district_id=${userData.location_dtls[i].district_id}&date=${date}${vaccineType}`, requestOptions)
          
          if(apiResponse.status==200){
            let responseObj=await apiResponse.json();
            if(responseObj.centers){
              resultArray.push(responseObj.centers);
            }else{
              reject("");
            }
          }else{
            reject("");
          }
          
          
          
        }
        resolve(resultArray);
      }catch(err){
        reject(err);
      }
      
      
    });
  }

  getPinCalender(token:string, userData){
    
    return new Promise(async (resolve,reject)=>{
      try{
        let date=Util.getDate();
        let vaccineType='';
        if(userData.vaccine_type!="ANY"){
          vaccineType='&vaccine='+userData.vaccine_type;
        }
        let requestOptions:any = {
          method: 'GET',
          headers: this.getAuthHeaders(token),
          redirect: 'follow'
        };
        let resultArray=[];
        for(let i=0;i<userData.location_dtls.length;i++){
          let apiResponse=await fetch(this.URLS.calenderPincode+`?pincode=${userData.location_dtls[i].pincode}&date=${date}${vaccineType}`, requestOptions)
          
          if(apiResponse.status==200){
            let responseObj=await apiResponse.json();
            if(responseObj.centers){
              resultArray.push(responseObj.centers);
            }else{
              reject("");
            }
          }else{
            reject("");
          }
        }
        resolve(resultArray);
      }catch(err){
        reject(err);
      }
      
      
    });
  }

  regAnalytics(phone : string){
      let bookTime= +new Date();
    return new Promise((resolve,reject)=>{
      
      let requestOptions:any = {
        method: 'GET',
        redirect: 'follow'
      };
      fetch(this.URLS.regAnalytics+`col1='${phone}'&col2='${bookTime}'`, requestOptions)
      .then(response => {
        
      })
      
      .catch(error => {
        
        reject(error)
      });
    });
  }
  sendAnalytics(phone : string, beneficiaries : string, center : string,slot : string,
    downloadTime : string, process1RunTime : string,process2RunTime : string,
    process3RunTime : string, noOfOtpRead : string){
      let bookTime= +new Date();
    return new Promise((resolve,reject)=>{
      
      let requestOptions:any = {
        method: 'GET',
        redirect: 'follow'
      };
      fetch(this.URLS.analytics+`col1='${phone}'&col2='${beneficiaries}'&col3='${center}'
      &col4='${slot}'&col5='${downloadTime}'&col6='${bookTime}'&col7='${process1RunTime}'
      &col8='${process2RunTime}'&col9='${process3RunTime}'&col10='${noOfOtpRead}'`, requestOptions)
      .then(response => {
        if(response.status==200){
          this.storageService.flush();
        }
      })
      
      .catch(error => {
        
        reject(error)
      });
    });
  }


}
