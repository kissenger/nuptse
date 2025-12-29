import { Component, EventEmitter, Input, Output} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PracticeOptions } from '@shared/types';
import { NavService } from '@shared/services/nav.service';
import { Utility } from '@shared/classes/utilities.class';

@Component({
  selector: 'app-options',
  imports: [FormsModule, CommonModule],
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css', '../home.component.css'],
  standalone: true
})

export class OptionsComponent {

  @Output() options = new EventEmitter<PracticeOptions>();
  @Input() suppressBobsOption: boolean = false;
  @Input() 
  set numberOfBells(n: number|undefined) {
    if (n) this.workingBellOptions = ['Random', ...Utility.getRoundsArray(n)];
    this.onChangeEmit();
  };

  public practiceOptions = new PracticeOptions();
  public workingBellOptions: Array<string | number> = [];

  constructor(
    public nav: NavService
  ) {}
  
  public onChangeEmit() {
    this.options.emit(this.practiceOptions);
  }

}


