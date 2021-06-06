import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { NetworkService } from '../services/network.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {

  isAppActive=false;
  appExpired=false;

  constructor(
    private router : Router,
    private networkService:NetworkService,
    private storageService:StorageService,
    private alertController : AlertController,
  ) { }

  ngOnInit() {
    this.checkVersion();
  }

  async checkVersion(){
    try{
      let config=await this.networkService.checkVersion();
      if(config.appActive && config.appActive=="1"){
        this.isAppActive=true;
        if(this.storageService.APP_VERSION!=config.app_version){
          this.showUpdate(config.update_url);
        }
      }
    }catch(err){

    }
  }

  goToHome(){
    this.router.navigateByUrl('home');
  }

  async showUpdate(updateUrl){
    const alert = await this.alertController.create({
      header: 'Alert',
      cssClass: 'my-custom-class',
      message: 'App version expired downlod new version.',
      buttons: [
        {
          text: 'Download',
          handler: () => {
            window.open(updateUrl, "_blank");
          }
        },
      ]
    });

    await alert.present();

  
  }

}
