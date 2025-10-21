import { Component, EventEmitter, Output} from '@angular/core';
import { MethodDescriptor, MethodDescriptorsArray, MethodsArray } from '@shared/types';
import { METHODS_DB } from "@shared/methods.lib";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavService } from '@shared/services/nav.service';
import { Utility } from '@shared/classes/utilities.class';

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
  public filteredMethods: MethodDescriptorsArray = METHODS_DB;
  public searchString: string = '';

  constructor(
    public nav: NavService,
  ) {}

  public get methods() {
    const stage = !!this.selectedMethods[0] ? Utility.stageFromMethodName(this.selectedMethods[0]?.name) : '';
    return METHODS_DB.filter( (m: MethodDescriptor) => m.name.toLowerCase().indexOf(stage ?? '')>=0);
  }

  public applyFilter() {
    console.log(this.methods);
    this.filteredMethods = this.methods
      .filter( (m:MethodDescriptor) => m.name.toLowerCase().indexOf(this.searchString.toLowerCase())>=0)
      .filter( (m:MethodDescriptor) => !this.selectedMethods.find( ({name}) => name === m.name));
  } 

  onFocus() {
    this.applyFilter();
  }

  onBlur() {
    this.filteredMethods = [];
  }

  updateSelectedMethods(m:MethodDescriptor,operation:'add'|'remove') {
    if (operation === 'add') this.selectedMethods.push(m);
    else this.selectedMethods = this.selectedMethods.filter(({name}) => name !== m.name)
    this.searchString = '';
    this.methodsArrayUpdated.emit(this.selectedMethods);
    
    this.filteredMethods = this.selectedMethods.length === 0 ? METHODS_DB : [];
  }

}


