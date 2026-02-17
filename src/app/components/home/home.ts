import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LetterService } from '../../services/letter';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  completionPercentage: number = 0;
  animatedLetters: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
  isDarkTheme: boolean = true;

  constructor(
    private router: Router,
    private letterService: LetterService
  ) {}

  ngOnInit() {
    this.letterService.loadProgress();
    this.completionPercentage = this.letterService.getCompletionPercentage();
    const saved = localStorage.getItem('homeTheme');
    if (saved !== null) {
      this.isDarkTheme = saved === 'dark';
    }
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem('homeTheme', this.isDarkTheme ? 'dark' : 'light');
  }

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
