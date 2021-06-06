import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
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
  mTOKEN:string="";
  otpRequested:boolean=false;
  txnId:string='';
  captcha:string='';
  captchaUrl='';
  availableCenter;
  timerCounter : number = 0;
  
  @ViewChild("inpOTP",{static:false})inpOTP:IonInput;
  @ViewChild("inpCaptcha",{static:false})inpCaptcha:IonInput;
  @Input("processId") processId:number;
  constructor(
    private networkService : NetworkService,
    private storageService : StorageService,
    private sanitizer: DomSanitizer,
    private router : Router,
    private cd:ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    this.userData= await this.storageService.get("userData");
    
    let token=await this.storageService.get("token"+this.processId);
    if(token){
      this.mTOKEN=token;
      this.start();
    }
    this.storageService.newSms.subscribe((smsText)=>{
      if(this.mTOKEN=="" && this.otpRequested==true){
        this.storageService.count("COUNTER_OTP_AUTO_READ")
        this.inpOTP.value=smsText;
        setTimeout(()=>{
          this.initVerifyOtp();
        },100);
      }
    });
  }
  start(){
    this.timer();
    this.startProcess();
  }
  async startProcess(){
    
    try{
      let resultsArray;
      if(this.userData.search_option == "1"){
        resultsArray=await this.networkService.getPinCalender(this.mTOKEN,this.userData);
      }else{
        resultsArray=await this.networkService.getDistrictCalender(this.mTOKEN,this.userData);
      }
      let availableCenter=this.checkAvailable(resultsArray);
      if(availableCenter.name){
        this.initBook(availableCenter);
      }else{
        setTimeout(()=>{
          this.startProcess();
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
      let captcha=await this.networkService.requestCaptch(this.mTOKEN);
      let blob = new Blob([captcha], {type: 'image/svg+xml'});
      let url = URL.createObjectURL(blob);
      this.captcha=captcha;
      this.captchaUrl=url;
      this.availableCenter=availableCenter;
      this.cd.detectChanges();
      var audio=new Audio("/assets/beep.mp3");
      audio.play();
    }catch(err){
      this.resetToken();
    }
  }

  async book(){
    let captcha:string=this.inpCaptcha.value.toString();
    let reqBeneficiaryIds = [];
    let benifNames="";
    let dose="1";
    this.userData.beneficiary_dtls.forEach(beneficiary_dtl => {
      if(beneficiary_dtl.status=="Partially Vaccinated"){
        dose="2";
      }
      reqBeneficiaryIds.push(beneficiary_dtl.bref_id);
      benifNames+=" , "+beneficiary_dtl.name+"";
    });
    try{
      let trySlot=this.availableCenter.slots[Math.floor(Math.random() * this.availableCenter.slots.length)]
      let bookRes=await this.networkService.book(this.mTOKEN,{
        captcha,
        beneficiaries:reqBeneficiaryIds,
        dose:dose,
        center_id:this.availableCenter.center_id,
        session_id:this.availableCenter.session_id,
        slot:trySlot
      });
      if(bookRes.length>0){

        this.success(benifNames,trySlot,this.availableCenter.name);
      }
    }catch(err){
      this.resetToken();
    }
  }

  async success(names:string,slot:string,centreName:string){
    await this.storageService.set("AN_DATA_NAMES",names);
    await this.storageService.set("AN_DATA_SLOT",slot);
    await this.storageService.set("AN_DATA_CENTRE",centreName);

    this.router.navigateByUrl('success');

  }

  checkAvailable(resultsArray){
    let dose="1";
    let ageGroup=999;
    this.userData.beneficiary_dtls.forEach(beneficiary_dtl => {
      if(ageGroup>beneficiary_dtl.age){
        ageGroup=beneficiary_dtl.age;
      }
      if(beneficiary_dtl.status=="Partially Vaccinated"){
        dose="2";
      }
    });
    
    let availableCenter:any={count:0};
    for(let r=0;r<resultsArray.length;r++){
      let centers=resultsArray[r];
      for(let c=0;c<centers.length;c++){
        let center=centers[c];
        if(this.userData.fee_type=="ANY" 
        || this.userData.fee_type.toLowerCase()==center.fee_type.toLowerCase()){
          let sessions=center.sessions;
          for(let s=0;s<sessions.length;s++){
            let session=sessions[s];
            if(
              session[`min_age_limit`]<=ageGroup && 
              session[`available_capacity_dose${dose}`]>this.userData.beneficiary_dtls.length 
              && session[`available_capacity_dose${dose}`]>availableCenter.count
            ){
              availableCenter={
                count:session[`available_capacity_dose${dose}`],
                'name': center['name'],
                'district': center['district_name'],
                'pincode': center['pincode'],
                'center_id': center['center_id'],
                'available': session.available_capacity_dose1,
                'date': session['date'],
                'slots': session['slots'],
                'session_id': session['session_id']
              };
              //break;
            }
          }
        }
        
        // if(availableCenter){
        //   break;
        // }
      }
      // if(availableCenter){
      //   break;
      // }
    }
    delete availableCenter.count;
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
    this.cd.detectChanges();
    let response=await this.networkService.verifyOtp(otp,this.txnId);
    if(response && response.token){
      this.mTOKEN=response.token;
      await this.storageService.set("token"+this.processId,this.mTOKEN);
      
      this.start();
    }
  }

  async resetToken(){
    this.timerCounter=0;
    await this.storageService.set("token"+this.processId,"");
    this.mTOKEN="";
  }

  getSantizeUrl(url : string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  timer(){
    setTimeout(()=>{
      this.timerCounter+=2;
      this.storageService.count("COUNTER_PROCESS_RUN"+this.processId);
      this.cd.detectChanges();
      this.timer();
    }, 2000)
  }

}
