import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-process',
  templateUrl: './process.page.html',
  styleUrls: ['./process.page.scss'],
})
export class ProcessPage {

  constructor(
    private storageService : StorageService,
    private router : Router,
    public alertController: AlertController,
  ) { }

  async ngOnInit() {
    let userData= await this.storageService.get("userData");
    if(!userData){
      this.router.navigateByUrl("home");
    }
  }

  async resetData(){

    const alert = await this.alertController.create({
      cssClass: '',
      header: 'Caution!',
      subHeader: 'Delete Saved Data?',
      message: 'This will reset data.',
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
        handler: (blah) => {
          
        }
      }, {
        text: 'Okay',
        handler: async () => {
          await this.storageService.set("userData", null);
          await this.storageService.set("token1", null);
          await this.storageService.set("token2", null);
          await this.storageService.set("token3", null);
          this.router.navigateByUrl("home");
        }
      }]
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();

   
  }

}
