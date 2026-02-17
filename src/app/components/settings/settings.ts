import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgressService } from '../../services/progress';
import { LetterService } from '../../services/letter';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class SettingsComponent implements OnInit {
  soundEnabled: boolean = true;
  strokeWidth: number = 20;
  difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  showConfirmReset: boolean = false;
  isDarkTheme: boolean = true;

  constructor(
    private router: Router,
    private progressService: ProgressService,
    private letterService: LetterService
  ) {}

  ngOnInit() {
    this.loadSettings();
    const saved = localStorage.getItem('homeTheme');
    if (saved !== null) {
      this.isDarkTheme = saved === 'dark';
    }
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem('homeTheme', this.isDarkTheme ? 'dark' : 'light');
  }

  private loadSettings() {
    const settings = localStorage.getItem('appSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.soundEnabled = parsed.soundEnabled ?? true;
      this.strokeWidth = parsed.strokeWidth ?? 20;
      this.difficulty = parsed.difficulty ?? 'medium';
    }
  }

  saveSettings() {
    const settings = {
      soundEnabled: this.soundEnabled,
      strokeWidth: this.strokeWidth,
      difficulty: this.difficulty
    };
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }

  onSoundToggle() {
    this.saveSettings();
  }

  onStrokeWidthChange() {
    this.saveSettings();
  }

  onDifficultyChange(difficulty: 'easy' | 'medium' | 'hard') {
    this.difficulty = difficulty;
    this.saveSettings();
  }

  confirmReset() {
    this.showConfirmReset = true;
  }

  cancelReset() {
    this.showConfirmReset = false;
  }

  resetProgress() {
    this.progressService.resetProgress();
    localStorage.removeItem('letterProgress');
    this.showConfirmReset = false;
    alert('Progress has been reset!');
    this.router.navigate(['/']);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
