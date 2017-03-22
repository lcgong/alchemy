import { Directive, Input, ElementRef } from '@angular/core';

@Directive({
	selector : '[set-focus]'
})
export class SetFocusDirective {
	@Input('set-focus')
	focus : boolean;

	constructor(private element : ElementRef) {}

	protected ngOnChanges() {
		if (this.focus) {
			this.element.nativeElement.focus();
		}
	}
}
