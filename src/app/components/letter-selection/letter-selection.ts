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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private letterService: LetterService
  ) {}

  ngOnInit() {
    this.letterService.loadProgress();
    this.allLetters = this.letterService.getAllLetters();
    this.filterLetters('uppercase');

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

  // Colorful gradient for each letter tile matching the design
  getLetterGradient(index: number): string {
    const gradients = [
      'bg-gradient-to-br from-red-400 to-red-600',      // A - Red
      'bg-gradient-to-br from-orange-400 to-orange-600', // B - Orange
      'bg-gradient-to-br from-yellow-400 to-yellow-500', // C - Yellow
      'bg-gradient-to-br from-green-400 to-green-600',   // D - Green
      'bg-gradient-to-br from-teal-400 to-teal-600',     // E - Teal
      'bg-gradient-to-br from-blue-400 to-blue-600',     // F - Blue
      'bg-gradient-to-br from-indigo-400 to-indigo-600', // G - Indigo
      'bg-gradient-to-br from-purple-400 to-purple-600', // H - Purple
      'bg-gradient-to-br from-pink-400 to-pink-600',     // I - Pink
      'bg-gradient-to-br from-yellow-300 to-yellow-500', // J - Light Yellow
      'bg-gradient-to-br from-amber-400 to-amber-600',   // K - Amber
      'bg-gradient-to-br from-lime-400 to-lime-600',     // L - Lime
      'bg-gradient-to-br from-blue-500 to-blue-700',     // M - Dark Blue
      'bg-gradient-to-br from-cyan-400 to-cyan-600',     // N - Cyan
      'bg-gradient-to-br from-violet-400 to-violet-600', // O - Violet
      'bg-gradient-to-br from-fuchsia-400 to-fuchsia-600', // P - Fuchsia
      'bg-gradient-to-br from-rose-400 to-rose-600',     // Q - Rose
      'bg-gradient-to-br from-orange-500 to-orange-700', // R - Dark Orange
      'bg-gradient-to-br from-red-500 to-red-700',       // S - Row 3 starts
      'bg-gradient-to-br from-emerald-400 to-emerald-600', // T - Emerald
      'bg-gradient-to-br from-sky-400 to-sky-600',       // U - Sky
      'bg-gradient-to-br from-indigo-500 to-indigo-700', // V - Dark Indigo
      'bg-gradient-to-br from-purple-500 to-purple-700', // W - Dark Purple
      'bg-gradient-to-br from-pink-500 to-pink-700',     // X - Dark Pink
      'bg-gradient-to-br from-red-400 to-orange-500',    // Y - Red-Orange
      'bg-gradient-to-br from-amber-500 to-orange-600',  // Z - Amber-Orange
    ];
    return gradients[index % gradients.length];
  }
}
