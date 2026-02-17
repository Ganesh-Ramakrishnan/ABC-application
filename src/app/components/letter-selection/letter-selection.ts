import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LetterService, LetterData } from '../../services/letter';

@Component({
  selector: 'app-letter-selection',
  imports: [CommonModule],
  templateUrl: './letter-selection.html',
  styleUrl: './letter-selection.scss',
})
export class LetterSelectionComponent implements OnInit {
  allLetters: LetterData[] = [];
  filteredLetters: LetterData[] = [];
  selectedFilter: 'all' | 'uppercase' | 'lowercase' | 'number' = 'uppercase';
  currentMode: string = 'tracing';
  isDarkTheme: boolean = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private letterService: LetterService
  ) {}

  ngOnInit() {
    this.letterService.loadProgress();
    this.allLetters = this.letterService.getAllLetters();
    this.filterLetters('uppercase');

    this.route.queryParams.subscribe(params => {
      this.currentMode = params['mode'] || 'tracing';
    });

    const saved = localStorage.getItem('homeTheme');
    if (saved !== null) {
      this.isDarkTheme = saved === 'dark';
    }
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem('homeTheme', this.isDarkTheme ? 'dark' : 'light');
  }

  filterLetters(type: 'all' | 'uppercase' | 'lowercase' | 'number') {
    this.selectedFilter = type;
    if (type === 'all') {
      this.filteredLetters = this.allLetters;
    } else {
      this.filteredLetters = this.letterService.getLettersByType(type);
    }
  }

  selectLetter(letter: string) {
    if (this.currentMode === 'writing') {
      this.router.navigate(['/trace', letter], { queryParams: { mode: 'writing' } });
    } else {
      this.router.navigate(['/trace', letter]);
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
