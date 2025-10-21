import { Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CallsObject } from '@shared/types';
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
  @Output() callsUpdated = new EventEmitter<CallsObject>();
  @Output() workingBell = new EventEmitter<string>();
  @Input() 
  get numberOfBells(): number { return this._numberOfBells};
  set numberOfBells(n: number) {
    this._numberOfBells = n;
    this.onBellSelect();
  }

  private _numberOfBells = 0;
  public callOptions = ['None', 'Some', 'Lots'];
  public bobs: 'None'|'Some'|'Lots' = 'None';
  public singles: 'None'|'Some'|'Lots' = 'None';
  public selectedWorkingBell: string = 'Random';
  public get workingBellOptions() {
    return ['Random',...Utility.getRoundsArray(this._numberOfBells)]
  };

  constructor(
    public nav: NavService
  ) {}
  
  public onBobSelect() {
    if (this.singles === 'Lots' && this.bobs === 'Lots') this.singles = 'Some';
    this.callsUpdated.emit(this.calls);
  }

  public onSingleSelect() {
    if (this.singles === 'Lots' && this.bobs === 'Lots') this.bobs = 'Some';
    this.callsUpdated.emit(this.calls);
  }  

  public onBellSelect() {
    if (this.selectedWorkingBell === 'Random') {
      const wb = Utility.randomInteger(2,this.numberOfBells);
      this.workingBell.emit(Utility.numbToChar(wb));
    } else {
      this.workingBell.emit(this.selectedWorkingBell);
    }
  }

  get calls(): CallsObject {

    let bobs = 0;
    let singles = 0;

    if (this.bobs === 'None') {
      if (this.singles === 'None') { bobs = 0; singles = 0  };
      if (this.singles === 'Some') { bobs = 0; singles = 33 };
      if (this.singles === 'Lots') { bobs = 0; singles = 75 };
    } else if (this.bobs === 'Some') {
      if (this.singles === 'None') { bobs = 33; singles = 0  };
      if (this.singles === 'Some') { bobs = 33; singles = 33 };
      if (this.singles === 'Lots') { bobs = 25; singles = 50 };
    }  else if (this.bobs === 'Lots') {
      if (this.singles === 'None') { bobs = 75; singles = 0  };
      if (this.singles === 'Some') { bobs = 50; singles = 25 };
    }  

    const plain = 100 - bobs - singles;
    return {plain , bobs, singles}

  }

}


