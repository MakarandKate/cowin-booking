import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { NetworkService } from '../services/network.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-booker',
  templateUrl: './booker.component.html',
  styleUrls: ['./booker.component.scss'],
})
export class BookerComponent implements OnInit {
  collectionData : any;
  TOKEN:string="";
  constructor(
    private networkService : NetworkService,
    private storageService : StorageService,
  ) { }

  async ngOnInit() {
    this.collectionData= await this.storageService.get("collection");
    //let token = this.networkService.

  }

  start(){

  }

  initSendOtp(){

  }

  initVerifyOtp(){
    
  }

}
