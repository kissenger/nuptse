import { ElementRef, Injectable, QueryList } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class NavService {

  private _anchors?: QueryList<ElementRef>;

  setAnchors(anchors: QueryList<ElementRef>) {
    this._anchors = anchors;
  }
  
  scrollTo(anchor: string) {
    const target = <ElementRef>this._anchors?.find(a => a.nativeElement.id === anchor);
    target?.nativeElement.scrollIntoView({ behavior: "smooth", inline: "center" });
  }
}