import { Component, EventEmitter, Output} from '@angular/core';
import { MethodDescriptor, MethodDescriptorsArray, MethodsArray } from '@shared/types';
import { METHODS_DB } from "@shared/methods.lib";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-methods',
  imports: [FormsModule, CommonModule],
  templateUrl: './methods.component.html',
  styleUrl: './methods.component.css',
  standalone: true
})

export class MethodsComponent {

  @Output() methodsArrayUpdated = new EventEmitter<MethodDescriptorsArray>();
  @Output() scrollTo = new EventEmitter<string>();

  public selectedMethods: MethodDescriptorsArray = [];
  public searchString: string = '';

  public get methods() {
    if (!this.selectedMethods[0]) return METHODS_DB;
    return METHODS_DB.filter(( m:MethodDescriptor) => m.stage===this.selectedMethods[0]?.stage);
  }

  public get filteredMethods(): MethodDescriptorsArray {
    if (this.searchString === '') {
      if (!this.selectedMethods[0]) return METHODS_DB;
      return [];
    }
    return this.methods
      .filter( (m:MethodDescriptor) => m.name.toLowerCase().indexOf(this.searchString.toLowerCase())>=0)
      .filter( (m:MethodDescriptor) => !this.selectedMethods.find( ({name}) => name === m.name));
  } 

  updateSelectedMethods(m:MethodDescriptor,operation:'add'|'remove') {
    if (operation === 'add') this.selectedMethods.push(m);
    else this.selectedMethods = this.selectedMethods.filter(({name}) => name !== m.name)
    this.searchString = '';
    this.methodsArrayUpdated.emit(this.selectedMethods);
  }

  scrollFwd() {
    this.scrollTo.emit('fwd');
  }

  closeList() {
    console.log('close list');
  }

}


