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
  selectedFilter: 'all' | 'uppercase' | 'lowercase' | 'number' = 'all';
  currentMode: string = 'tracing';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private letterService: LetterService
  ) {}

  ngOnInit() {
    this.letterService.loadProgress();
    this.allLetters = this.letterService.getAllLetters();
    this.filterLetters('all');

    // Get mode from query params
    this.route.queryParams.subscribe(params => {
      this.currentMode = params['mode'] || 'tracing';
    });
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

  getStarsArray(count: number): number[] {
    return Array(count).fill(0);
  }

  getLetterColor(type: string): string {
    switch(type) {
      case 'uppercase': return 'bg-gradient-to-br from-purple-400 to-purple-600';
      case 'lowercase': return 'bg-gradient-to-br from-pink-400 to-pink-600';
      case 'number': return 'bg-gradient-to-br from-blue-400 to-blue-600';
      default: return 'bg-gradient-to-br from-gray-400 to-gray-600';
    }
  }
}
