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

  private wordMap: Record<string, string> = {
    A: 'APPLE',   B: 'BEAR',   C: 'CAT',    D: 'DOG',
    E: 'EGG',     F: 'FISH',   G: 'GOAT',   H: 'HAT',
    I: 'IGLOO',   J: 'JAM',    K: 'KITE',   L: 'LION',
    M: 'MOON',    N: 'NEST',   O: 'OWL',    P: 'PIG',
    Q: 'QUEEN',   R: 'ROSE',   S: 'SUN',    T: 'TREE',
    U: 'UNDER',   V: 'VAN',    W: 'WOLF',   X: 'X-RAY',
    Y: 'YAK',     Z: 'ZEBRA',
    a: 'apple',   b: 'ball',   c: 'cat',    d: 'dog',
    e: 'egg',     f: 'frog',   g: 'goat',   h: 'hen',
    i: 'ice',     j: 'jug',    k: 'key',    l: 'lamp',
    m: 'map',     n: 'net',    o: 'owl',    p: 'pen',
    q: 'queen',   r: 'rat',    s: 'sun',    t: 'top',
    u: 'up',      v: 'van',    w: 'web',    x: 'x-ray',
    y: 'yak',     z: 'zero',
    '0': 'ZERO',  '1': 'ONE',  '2': 'TWO',  '3': 'THREE',
    '4': 'FOUR',  '5': 'FIVE', '6': 'SIX',  '7': 'SEVEN',
    '8': 'EIGHT', '9': 'NINE',
  };

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
  }

  getWord(letter: string): string {
    return this.wordMap[letter] || '';
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
