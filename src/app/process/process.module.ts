import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProcessPageRoutingModule } from './process-routing.module';

import { ProcessPage } from './process.page';
import { BookerComponent } from '../booker/booker.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProcessPageRoutingModule
  ],
  declarations: [ProcessPage,BookerComponent]
})
export class ProcessPageModule {}
