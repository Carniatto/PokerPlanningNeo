import { Component, OnInit, OnDestroy, output, signal } from '@angular/core';
import { ModalComponent } from '../ui/modal/modal.component';
import { ButtonComponent } from '../ui/button/button.component';

@Component({
  selector: 'neo-session-ended',
  standalone: true,
  imports: [ModalComponent, ButtonComponent],
  templateUrl: './session-ended.component.html',
  styleUrl: './session-ended.component.css'
})
export class SessionEndedComponent implements OnInit, OnDestroy {
  leave = output<void>();

  redirectCountdown = signal(10);
  private countdownInterval: any;

  ngOnInit() {
    this.countdownInterval = setInterval(() => {
      const current = this.redirectCountdown();
      if (current > 0) {
        this.redirectCountdown.set(current - 1);
      } else {
        this.onSubmit();
      }
    }, 1000);
  }

  onSubmit() {
    clearInterval(this.countdownInterval);
    this.leave.emit();
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
