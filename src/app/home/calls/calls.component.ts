import { Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CallsObject } from '@shared/types';

@Component({
  selector: 'app-calls',
  imports: [FormsModule, CommonModule],
  templateUrl: './calls.component.html',
  styleUrl: './calls.component.css',
  standalone: true
})

export class CallsComponent {
  @Output() callsUpdated = new EventEmitter<CallsObject>();
  @Output() workingBellUpdated = new EventEmitter<number>();
  @Input() 
  get numberOfBells(): number { return this._numberOfBells};
  set numberOfBells(n: number) {
    this._numberOfBells = n;
    this._selectWorkingBell();
  }

  private _numberOfBells = 0;
  public callOptions = ['None', 'Some', 'Lots'];
  public bobs: 'None'|'Some'|'Lots' = 'None';
  public singles: 'None'|'Some'|'Lots' = 'None';
  public selectedWorkingBell: string = 'Random';
  public get workingBellSelectionArray() {return ['Random',...[...Array(this.numberOfBells)].map((n,i)=>`${i+1}`)]};

  public onBobSelect() {
    if (this.singles === 'Lots' && this.bobs === 'Lots') this.singles = 'Some';
    this.callsUpdated.emit(this.calls);
  }

  public onSingleSelect() {
    if (this.singles === 'Lots' && this.bobs === 'Lots') this.bobs = 'Some';
    this.callsUpdated.emit(this.calls);
  }  

  public onBellSelect() {
    this._selectWorkingBell();
  }

  private _selectWorkingBell() {
    let wb: number;
    if (this.selectedWorkingBell === 'Random') wb = this._randomInteger(2,this.numberOfBells);
    else wb = parseInt(this.selectedWorkingBell);
    this.workingBellUpdated.emit(wb);
  }

  private _randomInteger(min:number, max:number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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


