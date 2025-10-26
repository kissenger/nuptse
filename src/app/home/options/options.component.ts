import { Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PracticeOptions } from '@shared/types';
import { NavService } from '@shared/services/nav.service';
import { Utility } from '@shared/classes/utilities.class';

@Component({
  selector: 'app-options',
  imports: [FormsModule, CommonModule],
  templateUrl: './options.component.html',
  styleUrl: './options.component.css',
  standalone: true
})

export class OptionsComponent {

  @Output() options = new EventEmitter<PracticeOptions>();

  @Input() 
  get numberOfBells(): number|undefined { 
    return this._numberOfBells
  };
  set numberOfBells(n: number|undefined) {
    if (n) this._numberOfBells = n;
    this.onUpdatedOptions();
  };

  private _numberOfBells = 0;
  public bobs: boolean = false;
  public singles: boolean = false;
  public workingBell: string = 'Random';
  public get workingBellOptions() {
    return ['Random',...Utility.getRoundsArray(this._numberOfBells)]
  };

  constructor(
    public nav: NavService
  ) {}
  
  public onUpdatedOptions() {
    this.options.emit({
      workingBell: this.workingBell,
      bobs: this.bobs, 
      singles: this.singles
    });
  }

}


