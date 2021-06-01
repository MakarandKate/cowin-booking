import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { IonInput } from '@ionic/angular';
import { NetworkService } from '../services/network.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-booker',
  templateUrl: './booker.component.html',
  styleUrls: ['./booker.component.scss'],
})
export class BookerComponent implements OnInit {
  userData : any;
  TOKEN:string="";
  otpRequested:boolean=false;
  txnId:string='';
  captcha:string='';
  captchaUrl='';
  availableCenter;
  
  @ViewChild("inpOTP",{static:false})inpOTP:IonInput;
  @ViewChild("inpCaptcha",{static:false})inpCaptcha:IonInput;
  @Input("processId") processId:string;
  constructor(
    private networkService : NetworkService,
    private storageService : StorageService,
    private sanitizer: DomSanitizer,
  ) { }

  async ngOnInit() {
    this.userData= await this.storageService.get("userData");
    
    let token=await this.storageService.get("token"+this.processId);
    if(token){
      this.TOKEN=token;
      this.start();
    }
  }

  async start(){
    try{
      let resultsArray=await this.networkService.getDistrictCalender(this.TOKEN,this.userData);
      let availableCenter=this.checkAvailable(resultsArray);
      if(availableCenter){
        this.initBook(availableCenter);
      }else{
        setTimeout(()=>{
          this.start();
        },10000);
      }
    }catch(err){
      this.resetToken();
    }
    
    
  }

  async initBook(availableCenter){
  //   {
  //     'beneficiaries': [beneficiary['bref_id'] for beneficiary in beneficiary_dtls],
  //     'dose': 2 if [beneficiary['status'] for beneficiary in beneficiary_dtls][0] == 'Partially Vaccinated' else 1,
  //     'center_id' : options[choice[0] - 1]['center_id'],
  //     'session_id': options[choice[0] - 1]['session_id'],
  //     'slot'      : options[choice[0] - 1]['slots'][choice[1] - 1]
  // }
    try{
      let captcha=await this.networkService.requestCaptch(this.TOKEN);
      let blob = new Blob([captcha], {type: 'image/svg+xml'});
      let url = URL.createObjectURL(blob);
      this.captcha=captcha;
      this.captchaUrl=url;
      this.availableCenter=availableCenter;
    }catch(err){
      this.resetToken();
    }
  }

  book(){
    let captcha:string=this.inpCaptcha.value.toString();
    this.networkService.book(this.TOKEN,{
      captcha,
      beneficiaries:[],
      dose:1,
      center_id:this.availableCenter.center_id,
      session_id:this.availableCenter.session_id,
      slot:this.availableCenter.slots[0]
    });
  }

  checkAvailable(resultsArray){
    let availableCenter;
    for(let r=0;r<resultsArray.length;r++){
      let centers=resultsArray[r];
      for(let c=0;c<centers.length;c++){
        let center=centers[c];
        let sessions=center.sessions;
        for(let s=0;s<sessions.length;s++){
          let session=sessions[s];
          if(session.available_capacity_dose1>this.userData.beneficiary_dtls.length){
            availableCenter={
              'name': center['name'],
              'district': center['district_name'],
              'pincode': center['pincode'],
              'center_id': center['center_id'],
              'available': session.available_capacity_dose1,
              'date': session['date'],
              'slots': session['slots'],
              'session_id': session['session_id']
            };
            break;
          }
        }
        if(availableCenter){
          break;
        }
      }
      if(availableCenter){
        break;
      }
    }
    return availableCenter;
  }

  async initSendOtp(){
    let phone=await this.storageService.get("phone");
    this.otpRequested=true;
    this.txnId=await this.networkService.requestOtp(phone);
  }

  async initVerifyOtp(){
    this.otpRequested=false;
    let otp:string=this.inpOTP.value.toString();
    
    let response=await this.networkService.verifyOtp(otp,this.txnId);
    if(response && response.token){
      this.TOKEN=response.token;
      this.storageService.set("token"+this.processId,this.TOKEN);
      this.start();
    }
  }

  async resetToken(){
    await this.storageService.set("token"+this.processId,"");
    this.TOKEN="";
  }

  getSantizeUrl(url : string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

}
