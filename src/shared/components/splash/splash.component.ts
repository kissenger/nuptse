import { Component } from '@angular/core';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css'],
  standalone: true,
})

export class SplashComponent {
  
  public splash = [
    [ { style: {colour: 'grey', weight: 'unbold'}, text: '1234567890ET'}], 
    [ { style: {colour: 'grey', weight: 'unbold'}, text: '2143658709TE'}], 
    [ { style: {colour: 'grey', weight: 'unbold'}, text: '12'}, 
      { style: {colour: 'red',  weight: 'bold'  }, text: 'PRACTICE' }, 
      { style: {colour: 'grey', weight: 'unbold'}, text: '9E'}],
    [ { style: {colour: 'grey', weight: 'unbold'}, text: '21648' }, 
      { style: {colour: 'blue', weight: 'bold'  }, text: 'NIGHT' }, 
      { style: {colour: 'grey', weight: 'unbold'}, text: 'E9'}],
    [ { style: {colour: 'grey', weight: 'unbold'}, text: '261438507T9E'}],
    [ { style: {colour: 'grey', weight: 'unbold'}, text: '6241' }, 
      { style: {colour: 'blue', weight: 'unbold'}, text: 'A' }, 
      { style: {colour: 'grey', weight: 'unbold'}, text: '3' }, 
      { style: {colour: 'blue', weight: 'unbold'}, text: 'BELL' },
      { style: {colour: 'grey', weight: 'unbold'}, text: 'E9' }],
    [ { style: {colour: 'grey', weight: 'unbold'}, text: '621' },
      { style: {colour: 'blue', weight: 'unbold'}, text: 'RINGING' },
      { style: {colour: 'grey', weight: 'unbold'}, text: '79' } ],
    [ { style: {colour: 'grey', weight: 'unbold'}, text: '2' },
      { style: {colour: 'blue', weight: 'unbold'}, text: 'SIMULATOR' },
      { style: {colour: 'grey', weight: 'unbold'}, text: '97' } ],
    [ { style: {colour: 'grey', weight: 'unbold'}, text: '6240183T5E79' } ],
    [ { style: {colour: 'grey', weight: 'unbold'}, text: '260481T3E597' } ]
  ];

}