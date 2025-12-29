import { ElementRef, Injectable, QueryList } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class NavService {

  private _anchors?: QueryList<ElementRef>;
  private _activeAnchor: string = '';

  setAnchors(anchors: QueryList<ElementRef>) {
    this._activeAnchor = anchors.get(0)?.nativeElement.id;
    this._anchors = anchors;
  }
  
  scrollTo(anchor: string) {
    const target = <ElementRef>this._anchors?.find(a => a.nativeElement.id === anchor);
    this._activeAnchor = target.nativeElement.id;
    target?.nativeElement.scrollIntoView({ behavior: "smooth", inline: "center" });
  }

  get activeAnchor() {
    return this._activeAnchor;
  }
}