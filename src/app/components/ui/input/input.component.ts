import { Component, input, output } from '@angular/core';

@Component({
  selector: 'neo-input',
  standalone: true,
  template: `
    <div class="input-container">
      @if (label()) {
        <label [attr.for]="id()">{{ label() }}</label>
      }
      <div class="input-wrapper">
        <input 
          [id]="id()"
          [type]="type()" 
          [value]="value()"
          [placeholder]="placeholder()" 
          [disabled]="disabled()"
          [autofocus]="autofocus()"
          (input)="onInput($event)"
          (keyup.enter)="enter.emit()">
      </div>
    </div>
  `,
  styleUrl: './input.component.css'
})
export class InputComponent {
  id = input<string>('input-' + Math.random().toString(36).substr(2, 9));
  label = input<string>('');
  type = input<string>('text');
  value = input<string>('');
  placeholder = input<string>('');
  disabled = input(false);
  autofocus = input(false);

  valueChange = output<string>();
  enter = output<void>();

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.valueChange.emit(val);
  }
}
