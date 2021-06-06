import { Component, OnInit } from '@angular/core';
import { NetworkService } from '../services/network.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.page.html',
  styleUrls: ['./success.page.scss'],
})
export class SuccessPage implements OnInit {
  center : string="";
  slot : string="";
  isBtnActive=false;

  constructor(
    private networkService : NetworkService,
    private storageService : StorageService,
  ) { }

  ngOnInit() {
    this.sendAnalytics();
  }

  async sendAnalytics(){
    let phone=await this.storageService.get("phone");
    let beneficiaries=await this.storageService.get("AN_DATA_NAMES");
    this.center=await this.storageService.get("AN_DATA_CENTRE");
    this.slot=await this.storageService.get("AN_DATA_SLOT");
    let downloadTime=await this.storageService.get("APP_INSTALL_TIME");
    let process1RunTime=await this.storageService.get("COUNTER_PROCESS_RUN1");
    let process2RunTime=await this.storageService.get("COUNTER_PROCESS_RUN2");
    let process3RunTime=await this.storageService.get("COUNTER_PROCESS_RUN3");
    let noOfOtpRead=await this.storageService.get("COUNTER_OTP_AUTO_READ");

    this.networkService.sendAnalytics(phone,beneficiaries,this.center,this.slot,downloadTime,
      process1RunTime,process2RunTime,process3RunTime,noOfOtpRead);

    setTimeout(()=>{
      this.isBtnActive=true;
    },3000);

  }

  goToHome(){
    window.location.href="/";
  }
}
