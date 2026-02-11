import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.css'],
  standalone: true,
})


export class HelpComponent {

  // @Input() showHelpMenu: boolean = false;
public _show: boolean = false;

  @Input()
  set showHelpMenu(val: boolean) {
    this.showHelpMenuChange.emit(val);
    this._show = val;
  }
  get showHelpMenu() {
    return this._show;
  }

  @Output() showHelpMenuChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  onHideMenu() {
    this.showHelpMenu = false;
  }

}