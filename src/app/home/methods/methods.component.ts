import { Component, EventEmitter, Output} from '@angular/core';
import { MethodDescriptor, MethodDescriptorsArray } from '@shared/types';
import { FormsModule } from '@angular/forms';
import { NavService } from '@shared/services/nav.service';
import { MethodList } from '@shared/classes/methodList.class';

@Component({
  selector: 'app-methods',
  imports: [FormsModule],
  templateUrl: './methods.component.html',
  styleUrls: ['./methods.component.css', '../home.component.css'],
  standalone: true
})

export class MethodsComponent {

  @Output() methodsArrayUpdated = new EventEmitter<MethodList>();

  public selectedMethods: MethodList = new MethodList();
  public filteredMethods: MethodList = new MethodList();
  public searchString: string = '';

  constructor(
    public nav: NavService,
  ) {
  }

  public applyFilter() {
    this.filteredMethods.unfilter();
    if (this.selectedMethods.stage) this.filteredMethods.filterByStage(this.selectedMethods.stage);
    this.filteredMethods.filterBySearchString(this.searchString);
    this.filteredMethods.filterOutSelectedMethods(this.selectedMethods);
  } 

  onFocus() {
    this.applyFilter();
  }

  onBlur() {
    this.filteredMethods.clear();
  }

  updateSelectedMethods(mn: string, operation: 'add'|'remove') {
    if (operation === 'add') {
      this.selectedMethods.add(mn);
    } else {
      this.selectedMethods.remove(mn);
    }

    console.log(this.selectedMethods)

    this.searchString = '';
    this.methodsArrayUpdated.emit(this.selectedMethods);

    if (this.selectedMethods.isEmpty) {
      this.filteredMethods.unfilter();
    } else {
      this.filteredMethods.clear();
    }
  }

}


