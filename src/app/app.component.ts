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
          console.log('watch started');
          document.addEventListener('onSMSArrive', (e: any) => {
            console.log('onSMSArrive()');
            var IncomingSMS = e.data;
            console.log(JSON.stringify(IncomingSMS));
            this.storageService.newSms.next(JSON.stringify(IncomingSMS));
          });
        },
        () => { console.log('watch start failed') }
      )
    }
    
  }


}
