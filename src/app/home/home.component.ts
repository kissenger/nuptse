import { Component, ElementRef, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { ScrollspyService } from '../../shared/services/scrollspy.service';
import { CommonModule } from '@angular/common';

import { MethodsComponent } from './methods/methods.component';
import { PracticeComponent } from "./practice/practice.component";
import { CallsComponent } from "./calls/calls.component";
import { CallsObject, MethodDescriptorsArray } from '@shared/types';

@Component({
  selector: 'app-home',
  imports: [CommonModule, MethodsComponent, PracticeComponent, CallsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent {

  @ViewChildren('anchor') anchors!: QueryList<ElementRef>;
  
  private _activeAnchor: string = '';
  private get _activeAnchorIndex() { 
    return this.anchors.toArray().findIndex(a => a.nativeElement.id === this._activeAnchor) 
  }; 
  public selectedMethods: MethodDescriptorsArray = [];
  public selectedCalls: CallsObject = {plain: 100, bobs: 0, singles: 0};
  public numberOfBells: number = 0;
  public hideBackBtn = true;
  public hideFwdBtn  = true;
  public disableFwdBtn = false;
  public showPracticeComponent = false;
  public workingBell: number = 5;

  constructor(
    private _scrollSpy: ScrollspyService,
    private _ref: ChangeDetectorRef,
  ) {}
    
  ngAfterViewInit(): void {
    this._scrollSpy.observeChildren(this.anchors); 
    this._scrollSpy.intersectionEmitter.subscribe( (isect) => {
      if (isect.ratio > 0.2) {
        this._activeAnchor = isect.id;

        this.hideBackBtn = this._activeAnchor === 'welcome';
        this.hideFwdBtn = this._activeAnchor === 'practice';
        this.disableFwdBtn = this._activeAnchor === 'methods' && this.selectedMethods.length === 0;
        this.showPracticeComponent = this._activeAnchor === 'practice';

        this._ref.detectChanges();    // needed to fire ngClass, not sure why
      }
    })
  }

  scrollFwd() {
    const target = document.querySelector('#' + this.anchors.get(this._activeAnchorIndex + 1)?.nativeElement.id);
    if (!!target) target.scrollIntoView();
  }

  scrollBack() {
    const target = document.querySelector('#' + this.anchors.get(this._activeAnchorIndex - 1)?.nativeElement.id);
    if (!!target) target.scrollIntoView();
  }

  onMethodsChange(ms: MethodDescriptorsArray) {
    this.selectedMethods = ms;
    this.disableFwdBtn = this._activeAnchor === 'methods' && this.selectedMethods.length === 0;
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


