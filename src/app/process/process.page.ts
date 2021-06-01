import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-process',
  templateUrl: './process.page.html',
  styleUrls: ['./process.page.scss'],
})
export class ProcessPage implements OnInit {

  constructor(
    private storageService : StorageService,
    private router : Router,
  ) { }

  ngOnInit() {
  }

  async resetData(){
    await this.storageService.set("collection", null);
    this.router.navigateByUrl("home");
  }

}
