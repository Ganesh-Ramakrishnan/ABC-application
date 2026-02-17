import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LetterService } from '../../services/letter';
import { ProgressService, Badge } from '../../services/progress';

@Component({
  selector: 'app-progress',
  imports: [CommonModule],
  templateUrl: './progress.html',
  styleUrl: './progress.scss',
})
export class ProgressComponent implements OnInit {
  completionPercentage: number = 0;
  totalStars: number = 0;
  currentStreak: number = 0;
  badges: Badge[] = [];
  unlockedBadges: Badge[] = [];
  isDarkTheme: boolean = true;

  constructor(
    private router: Router,
    private letterService: LetterService,
    private progressService: ProgressService
  ) {}

  ngOnInit() {
    this.letterService.loadProgress();
    this.completionPercentage = this.letterService.getCompletionPercentage();
    this.totalStars = this.letterService.getTotalStars();
    this.currentStreak = this.progressService.getCurrentStreak();
    this.badges = this.progressService.getBadges();
    this.unlockedBadges = this.progressService.getUnlockedBadges();

    const saved = localStorage.getItem('homeTheme');
    if (saved !== null) {
      this.isDarkTheme = saved === 'dark';
    }
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem('homeTheme', this.isDarkTheme ? 'dark' : 'light');
  }

  goBack() {
    this.router.navigate(['/']);
  }

  goToLetters() {
    this.router.navigate(['/letters']);
  }
}
