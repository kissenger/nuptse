import { ViewportScroller } from '@angular/common';
import { PLATFORM_ID, inject, ElementRef, Injectable, QueryList } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})

export class NavService {

  private _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private _anchors?: QueryList<ElementRef>;
  private _activeAnchor: string = '';

  setAnchors(anchors: QueryList<ElementRef>) {
    this._activeAnchor = anchors.get(0)?.nativeElement.id;
    this._anchors = anchors;
  }
  
  scrollTo(anchor: string) {
    const target: ElementRef<HTMLDivElement> | undefined = this._anchors?.find(a => a.nativeElement.id === anchor);
    if (target && this._isBrowser) {
      this._activeAnchor = target.nativeElement.id;
      target.nativeElement?.scrollIntoView({ behavior: "smooth", inline: "center" });
    }
    // console.log(anchor)

    // this._scroller.scrollToAnchor(anchor)
    // console.log(target)
    
  }

  get activeAnchor() {
    return this._activeAnchor;
  }
}