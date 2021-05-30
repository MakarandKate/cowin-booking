import { Component, ViewChild } from '@angular/core';
import { IonInput } from '@ionic/angular';

import { NetworkService } from '../services/network.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild("inpPhoneNumber",{static:false})inpPhoneNumber:IonInput;
  @ViewChild("inpOTP",{static:false})inpOTP:IonInput;

  constructor(
    private networkService:NetworkService,
  ) {}

  async initSendOtp(){
    let phone=this.inpPhoneNumber.value.toString();
    try{
      await this.networkService.requestOtp(phone);
    }catch(err){

    }
  }

  async initVerifyOtp(){
    let otp:string=this.inpOTP.value.toString();
    
    //console.log(hash)
    await this.networkService.verifyOtp(otp);
  }
}
