import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  animatedLetters: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];

  constructor(private router: Router) {}

  startLearning() {
    this.router.navigate(['/letters'], { queryParams: { mode: 'tracing' } });
  }

  startWriting() {
    this.router.navigate(['/letters'], { queryParams: { mode: 'writing' } });
  }

  goToProgress() {
    this.router.navigate(['/progress']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }
}
