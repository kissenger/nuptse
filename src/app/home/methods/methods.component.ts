import { Component, EventEmitter, Output} from '@angular/core';
import { MethodDescriptor, MethodDescriptorsArray, MethodsArray } from '@shared/types';
import { METHODS_DB } from "@shared/methods.lib"
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavService } from '@shared/services/nav.service';
import { Utility } from '@shared/services/utility.service';

@Component({
  selector: 'app-methods',
  imports: [FormsModule, CommonModule],
  templateUrl: './methods.component.html',
  styleUrls: ['./methods.component.css', '../home.component.css'],
  standalone: true
})

export class MethodsComponent {

  @Output() methodsArrayUpdated = new EventEmitter<MethodDescriptorsArray>();

  public selectedMethods: MethodDescriptorsArray = [];
  public filteredMethods: MethodDescriptorsArray = [];
  public searchString: string = '';

  constructor(
    public nav: NavService,
    private _utility: Utility
  ) {}

  // public get methods(): MethodDescriptorsArray {
  //   let stage = this._utility.stageFromMethodName(this.selectedMethods[0]?.name);
  //   if (!!stage) return METHODS_DB.filter( (m: MethodDescriptor) => m.name.toLowerCase().indexOf(stage)>0);
  //   return METHODS_DB;
  // }

  // public applyFilter() {
  //   this.filteredMethods = this.methods
  //     .filter( (m:MethodDescriptor) => m.name.toLowerCase().indexOf(this.searchString.toLowerCase())>=0)
  //     .filter( (m:MethodDescriptor) => !this.selectedMethods.find( ({name}) => name === m.name));
  // } 

  // onFocus() {
  //   this.applyFilter();
  // }

  // onBlur() {
  //   this.filteredMethods = [];
  // }

  // updateSelectedMethods(m:MethodDescriptor,operation:'add'|'remove') {
  //   if (operation === 'add') this.selectedMethods.push(m);
  //   else this.selectedMethods = this.selectedMethods.filter(({name}) => name !== m.name)
  //   this.searchString = '';
  //   this.methodsArrayUpdated.emit(this.selectedMethods);
  // }

}


