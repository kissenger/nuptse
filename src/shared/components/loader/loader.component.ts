import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-loader',
  template:`
    <div class="loader-container">
      @if (loadingState === 'loading') { <div class="loader"></div> } 
      @else { Content could not be loaded :( }
    </div>`,
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent{
  @Input() public loadingState: 'loading' | 'failed' = 'loading';   
  
  constructor(
  ) {}

}
