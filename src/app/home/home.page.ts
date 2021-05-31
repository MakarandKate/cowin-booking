import { Component, ViewChild } from '@angular/core';
import { IonInput } from '@ionic/angular';

import { NetworkService } from '../services/network.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild("inpPhoneNumber",{static:false})inpPhoneNumber:IonInput;
  @ViewChild("inpOTP",{static:false})inpOTP:IonInput;

  beneficiary=[];

  constructor(
    private networkService:NetworkService,
    private storageService:StorageService,
  ) {}

  async ionViewWillEnter(){
    let phone=await this.storageService.get("phone");
    this.inpPhoneNumber.value=phone;
    //let beneficiary=await this.networkService.getBeneficiaries();
    //this.showBeneficiary(beneficiary);
  }

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

  showBeneficiary(beneficiary){
    beneficiary.forEach(ben => {
        ben.selected=false;
    });
    this.beneficiary=beneficiary;
  }

  setBeneficiary(){
    console.log(this.beneficiary);
  }

}
