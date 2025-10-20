import { Component, ElementRef, ViewChildren, QueryList, ChangeDetectorRef, ViewEncapsulation, ViewChild } from '@angular/core';
import { ScrollspyService } from '../../shared/services/scrollspy.service';
import { CommonModule } from '@angular/common';

import { MethodsComponent } from './methods/methods.component';
import { PracticeComponent } from "./practice/practice.component";
import { CallsComponent } from "./calls/calls.component";
import { CallsObject, MethodDescriptorsArray } from '@shared/types';
import { NavService } from '@shared/services/nav.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, MethodsComponent, PracticeComponent, CallsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  encapsulation: ViewEncapsulation.None
})

export class HomeComponent {

  @ViewChildren('anchor') anchors!: QueryList<ElementRef>;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  
  public selectedMethods: MethodDescriptorsArray = [];
  public selectedCalls: CallsObject = {plain: 100, bobs: 0, singles: 0};
  public numberOfBells: number = 0;
  public hideBackBtn = true;
  public hideFwdBtn  = true;
  public disableFwdBtn = false;
  public showPracticeComponent = false;
  public workingBell: number = 5;

  constructor(
    public nav: NavService,
    private _scrollSpy: ScrollspyService,
    private _ref: ChangeDetectorRef
  ) {}
    
  ngAfterViewInit(): void {
    this.nav.setAnchors(this.anchors);
    this.nav.scrollTo('home');
    this._scrollSpy.init(this.anchors, this.scrollContainer); 
    this._scrollSpy.intersectionEmitter.subscribe( (isect) => {
      if (isect.ratio > 0.2) {
        this.showPracticeComponent = isect.id === 'practice'
        this._ref.detectChanges();    // needed to fire ngClass, not sure why
      }
    })
  }


  onMethodsChange(ms: MethodDescriptorsArray) {
    this.selectedMethods = ms;
    this.numberOfBells = this.nBells(ms[0].stage);
  }

  onCallsChange(c: CallsObject) {
    this.selectedCalls = c;
  }

  onWorkingBellUpdate(wb: number) {
    this.workingBell = wb;
  }

  nBells(stage:string): number {
    switch (stage) {
      case 'Maximus': return 12;
      case 'Cinques': return 11;
      case 'Royal':   return 10;
      case 'Caters':  return 9;
      case 'Major':   return 8;
      case 'Triples': return 7;
      case 'Minor':   return 6;
      case 'Doubles': return 5;
      default: return 0;
    }
  }
}


