import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StorageService } from './services/storage.service';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';

declare var SMSReceive: any;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private platform:Platform,
    private storageService : StorageService,
    private backgroundMode : BackgroundMode, 
  ) {
    
    if(this.platform.is("hybrid")){
      this.backgroundMode.enable();
      SMSReceive.startWatch(
        () => {
          document.addEventListener('onSMSArrive', (e: any) => {
            var IncomingSMS = e.data;
            let smsBody=IncomingSMS.body;
            if(smsBody.indexOf("Your OTP to register/access CoWIN is")!=-1){
              smsBody=smsBody
              .replace("Your OTP to register/access CoWIN is","")
              .replace(". It will be valid for 3 minutes.","")
              .replace("CoWIN","")
              .replace("-","")
              .replace(/ /g,"")
              .replace(/\n/g,'')
              .replace(/\t/g,'')
              .replace(/"/gi,'')
              this.storageService.newSms.next(smsBody);
            }
          });
        },
        () => { console.error('watch start failed') }
      )
    }
    
  }


}
