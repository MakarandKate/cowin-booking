import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver'
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  public APP_VERSION="1.0";

  private _storage: Storage | null = null;
  public newSms:BehaviorSubject<string>=new BehaviorSubject('');
  constructor(
    private storage: Storage,
  ) { 
    this.init();
  }

  async init() {
    
    await this.storage.defineDriver(CordovaSQLiteDriver);
    const storage = await this.storage.create();
    this._storage = storage;
  }

  public set(key: string, value: any) {
    this._storage?.set(key, value);
  }

  public get(key:string){
    return this._storage?.get(key);
  }

  public async count(key:string){
    let count=await this.get(key);
    if(!count){
      count=0;
    }
    count++;
    this.set(key,count);
  }
  public flush(){
    this.storage.clear();
  }

}
