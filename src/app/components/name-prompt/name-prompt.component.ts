import { Component, input, output, signal, OnInit } from '@angular/core';
import { ModalComponent } from '../ui/modal/modal.component';
import { InputComponent } from '../ui/input/input.component';
import { ButtonComponent } from '../ui/button/button.component';

@Component({
  selector: 'neo-name-prompt',
  standalone: true,
  imports: [ModalComponent, InputComponent, ButtonComponent],
  templateUrl: './name-prompt.component.html',
  styleUrl: './name-prompt.component.css'
})
export class NamePromptComponent implements OnInit {
  initialName = input<string>('');
  submitName = output<string>();

  name = signal('');

  ngOnInit() {
    this.name.set(this.initialName());
  }

  onSubmit() {
    const trimmed = this.name().trim();
    if (trimmed) {
      this.submitName.emit(trimmed);
    }
  }
}
