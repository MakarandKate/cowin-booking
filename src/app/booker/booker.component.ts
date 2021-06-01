import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
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
  
  @ViewChild("inpOTP",{static:false})inpOTP:IonInput;
  @Input("processId") processId:string;
  constructor(
    private networkService : NetworkService,
    private storageService : StorageService,
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
      this.checkAvailable(resultsArray);
    }catch(err){
      this.resetToken();
    }
    
    
  }

  checkAvailable(resultsArray){
    let availableCenter=0;
    for(let r=0;r<resultsArray.length;r++){
      let centers=resultsArray[r];
      for(let c=0;c<centers.length;c++){
        let center=centers[c];
        let sessions=center.sessions;
        for(let s=0;s<sessions.length;s++){
          let session=sessions[s];
          console.log(session.available_capacity_dose1);
        }
        
      }
    }
    
  
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

}
