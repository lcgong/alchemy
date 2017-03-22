
import { animate, trigger,  transition, style, keyframes } from '@angular/core';


export const bounceInDownBig =  keyframes([
    style({opacity: 0, transform: 'translateY(-100%)', offset: 0}),
    style({opacity: 1, transform: 'translateY(15px)',  offset: 0.3}),
    style({opacity: 1, transform: 'translateY(0)',     offset: 1.0})
  ]);
export const bounceOutDownBig = keyframes([
  style({opacity: 1, transform: 'translateY(0)',     offset: 0}),
  style({opacity: 1, transform: 'translateY(-15px)', offset: 0.7}),
  style({opacity: 0, transform: 'translateY(200%)',  offset: 1.0})
]);
