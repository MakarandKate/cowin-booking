import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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
  isByPincode : boolean = true;
  isByDistrict : boolean = false;
  vaccineArray=[];
  stateArray=[];
  districtArray=[];
  vaccineFeeTypeArray=[];
   
  beneficiary=[];
  selectedBenificery = [];
  pincodeArray = [];
  selectedDistrictArray=[];
  selectAreaByValue : string = "1";
  selectedvaccineFeeType : string = "ANY";
  selectesVaccineType : string = "ANY";
  locationArray = [];
  savedData: string = "";
  TOKEN:string="";
  OTP_TOKEN_ID:string="";

  constructor(
    private networkService:NetworkService,
    private storageService:StorageService,
    private router:Router,
  ) {

  }

  async getUserData(){
    this.savedData=await this.storageService.get("userData");
    if(this.savedData != null){
      this.router.navigateByUrl('process');
    }
  }

  async ionViewWillEnter(){
    this.getUserData();
    let phone=await this.storageService.get("phone");
    this.inpPhoneNumber.value=phone;
    this.TOKEN=await this.storageService.get("token");
    if(this.TOKEN && this.TOKEN.length>0){ 
      this.getBeneficiary();
    }
    
  }

  async initSendOtp(){
    let phone=this.inpPhoneNumber.value.toString();
    try{
      this.OTP_TOKEN_ID=await this.networkService.requestOtp(phone);
    }catch(err){

    }
  }

  async initVerifyOtp(){
    let otp:string=this.inpOTP.value.toString();
    
    let response=await this.networkService.verifyOtp(otp,this.OTP_TOKEN_ID);
    if(response && response.token){
      this.TOKEN=response.token;
      this.storageService.set("token",this.TOKEN);
      this.getBeneficiary();
    }
    
  }

  async getBeneficiary(){
    try{
      let beneficiary=await this.networkService.getBeneficiaries(this.TOKEN);
      this.showBeneficiary(beneficiary);
    }catch(err){
      this.resetToken();
    }
  }

  showBeneficiary(beneficiary){
    let currentYear = new Date().getFullYear();
    beneficiary.forEach(ben => {
        ben.selected=false;
        ben.age = currentYear - Number(ben.birth_year);
    });
    this.beneficiary=beneficiary;
  }

  setSelectedBeneficiary(){
    let selectedBenificery=[];
    this.beneficiary.forEach(ben => {
      if(ben.selected){
        selectedBenificery.push({
          'bref_id': ben['beneficiary_reference_id'],
          'name': ben['name'],
          'vaccine': ben['vaccine'],
          'age': ben['age'],
          'status': ben['vaccination_status']
        })
      }
    });
    this.selectedBenificery=selectedBenificery;
  }

  getSelectAreaBy(event){
    this.selectAreaByValue=event.target.value;
    if(this.selectAreaByValue == "2"){
      this.isByDistrict = true;
      this.isByPincode= false;
      this.getStateList();
    }
    else{
      this.isByPincode = true;
      this.isByDistrict = false;
    }
  }

  getState(event){
    let stateId=event.target.value;
    this.getDistrictList(stateId);
  }

  getDistrict(event){
    this.selectedDistrictArray=JSON.parse("["+event.target.value.toString()+"]");
    this.locationArray=this.selectedDistrictArray;
  }

  getVaccinetype(event){
    this.selectesVaccineType = event.target.value;
  }

  getVaccineFeetype(event){
    this.selectedvaccineFeeType=event.target.value;
  }


  async getStateList(){
    try{
      this.stateArray= await this.networkService.getStateList(this.TOKEN);
    }catch(err){
      this.resetToken();
    }
  }

  async getDistrictList(stateId){
    try{
      this.districtArray = await this.networkService.getStatewiseDistrict(this.TOKEN,stateId);
    }catch(err){
      this.resetToken();
    }
  }


  getPincode(event){
    let pincode=event.target.value.split(",");
    console.log(pincode);
    pincode.forEach((pin,i) => {
       this.pincodeArray.push({
        'pincode' : pin,
        'alert_freq': 440 + ((2 * i) * 110)
       })
    });
    console.log(this.pincodeArray);
    this.locationArray=this.pincodeArray;
  }

  async saveDetails(){
    if(this.selectedBenificery.length > 0 && this.locationArray.length > 0){
      let userDataObj = {
        'beneficiary_dtls': this.selectedBenificery,
        'location_dtls': this.locationArray,
        'search_option': this.selectAreaByValue,
        'minimum_slots': this.selectedBenificery.length,
        'refresh_freq': 10,
        'auto_book': "yes-please",
        'start_date': new Date(),
        'vaccine_type': this.selectesVaccineType,
        'fee_type': this.selectedvaccineFeeType
      }
      await this.storageService.set("userData",userDataObj);
    
      this.router.navigateByUrl("process");
    }else{
      alert("please select beneficiary and location");
    }
    
    
  }

 
  async resetToken(){
    await this.storageService.set("token","");
    window.location.reload();
  }

}
