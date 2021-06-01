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
  isByPincode : boolean = true;
  isByDistrict : boolean = false;
  vaccineArray=[];
  stateArray=[];
  districtArray=[];
  vaccineFeeTypeArray=[];

  beneficiary=[];

  constructor(
    private networkService:NetworkService,
    private storageService:StorageService,
  ) {
    
  }

  async ionViewWillEnter(){
    let phone=await this.storageService.get("phone");
    this.inpPhoneNumber.value=phone;
    let token=await this.storageService.get("token");
    if(token && token.length>0){
      this.networkService.setToken(token);
      let beneficiary=await this.networkService.getBeneficiaries();
      this.showBeneficiary(beneficiary);
    }else{

    }
    
  }

  async ngOnInit(){
    

    this.getVaccineArray();
    this.getVaccineFeeTypeArray();
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
    let response=await this.networkService.verifyOtp(otp);
    if(response == "success"){
      let beneficiary=await this.networkService.getBeneficiaries();
      this.showBeneficiary(beneficiary);
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
    let selectedBenificery = [];
    this.beneficiary.forEach(ben => {
      if(ben.selected){
        selectedBenificery.push({
          'bref_id': ben['beneficiary_reference_id'],
          'name': ben['name'],
          'vaccine': ben['vaccine'],
          'age': ben['age'],
          'status': ben['vaccination_status']
        })
        console.log(ben);
      }
  });
    console.log(selectedBenificery);
  }

  getSelectAreaBy(event){
    console.log(event.target.value);
    let value=event.target.value;
    if(value == "district"){
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
    console.log(event.target.value);
  }

  getVaccinetype(event){
    console.log(event.target.value);
  }

  getAgeCategory(event){
    console.log(event.target.value);
  }

  async getVaccineArray(){
    this.vaccineArray=await this.networkService.getVaccineType();
  }

  async getStateList(){
    this.stateArray= await this.networkService.getStateList();
  }

  async getDistrictList(stateId){
    this.districtArray = await this.networkService.getStatewiseDistrict(stateId);
  }

  async getVaccineFeeTypeArray(){
    this.vaccineFeeTypeArray=await this.networkService.getVaccineFeeType();
  }

  getPincode(event){
    let pincode=event.target.value.split(",");
    console.log(pincode);
    let pincodeArray = [];
    pincode.forEach((pin,i) => {
       pincodeArray.push({
        'pincode' : pin,
        'alert_freq': 440 + ((2 * i) * 110)
       })
    });
    console.log(pincodeArray);
  }

 

}
