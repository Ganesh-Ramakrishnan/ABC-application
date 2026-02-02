import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Stroke {
  path: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  direction: string;
}

interface LetterPath {
  strokes: Stroke[];
}

// Cursive letter paths for Writing mode (reference display)
interface CursiveLetterPath {
  path: string;  // Single SVG path for the cursive letter
  viewBox?: string;  // Optional custom viewBox
}

@Component({
  selector: 'app-tracing-canvas',
  imports: [CommonModule],
  templateUrl: './tracing-canvas.html',
  styleUrl: './tracing-canvas.scss',
})
export class TracingCanvasComponent implements OnInit, AfterViewInit {
  @ViewChild('tracingSvg', { static: false }) svgRef!: ElementRef<SVGElement>;
  @ViewChild('drawingCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  currentLetter: string = '';
  private isDrawing = false;
  private maskPath: string = '';
  private currentStrokeMaskPath: string = '';
  private letterPaths: { [key: string]: LetterPath } = {};
  private cursiveLetterPaths: { [key: string]: CursiveLetterPath } = {};
  private lastPoint: { x: number; y: number } | null = null;
  traceProgress: number = 0;
  showCelebration: boolean = false;
  private currentStrokeIndex: number = 0;
  private completedStrokes: boolean[] = [];
  private strokeStartPoint: { x: number; y: number } | null = null;
  private hasStartedCurrentStroke: boolean = false;
  private currentStrokePathElement: SVGPathElement | null = null;
  private currentPathProgress: number = 0;
  cursorX: number = 0;
  cursorY: number = 0;
  showCursor: boolean = false;
  isFreeWriting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initializeLetterPaths();
    this.initializeCursiveLetterPaths();
  }

  ngOnInit() {
    this.currentLetter = this.route.snapshot.paramMap.get('letter') || 'A';
    const mode = this.route.snapshot.queryParamMap.get('mode');
    this.isFreeWriting = mode === 'writing';
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.setupLetter();
      this.setupDrawing();
    }, 100);
  }

  private initializeLetterPaths() {
    // Define SVG paths for each letter with individual strokes
    this.letterPaths = {
      'A': {
        strokes: [
          {
            path: 'M 125 280 L 200 60',
            startPoint: { x: 125, y: 280 },
            endPoint: { x: 200, y: 60 },
            direction: '↗'
          },
          {
            path: 'M 200 60 L 275 280',
            startPoint: { x: 200, y: 60 },
            endPoint: { x: 275, y: 280 },
            direction: '↘'
          },
          {
            path: 'M 145 190 L 255 190',
            startPoint: { x: 145, y: 190 },
            endPoint: { x: 255, y: 190 },
            direction: '→'
          }
        ]
      },
      'B': {
        strokes: [
          {
            path: 'M 127 60 L 127 280',
            startPoint: { x: 127, y: 60 },
            endPoint: { x: 127, y: 280 },
            direction: '↓'
          },
          {
            path: 'M 145 67 L 230 67 Q 265 67 265 105 Q 265 142 230 142 L 145 142',
            startPoint: { x: 145, y: 67 },
            endPoint: { x: 145, y: 142 },
            direction: '→'
          },
          {
            path: 'M 145 157 L 235 157 Q 275 157 275 215 Q 275 272 235 272 L 145 272',
            startPoint: { x: 145, y: 157 },
            endPoint: { x: 145, y: 272 },
            direction: '→'
          }
        ]
      },
      'C': {
        strokes: [
          {
            path: 'M 267 80 Q 267 67 230 67 Q 160 67 122 122 Q 85 177 85 200 Q 85 223 122 278 Q 160 333 230 333 Q 267 333 267 320',
            startPoint: { x: 267, y: 80 },
            endPoint: { x: 267, y: 320 },
            direction: '↶'
          }
        ]
      },
      'D': {
        strokes: [
          {
            path: 'M 100 80 L 100 320',
            startPoint: { x: 100, y: 80 },
            endPoint: { x: 100, y: 320 },
            direction: '↓'
          },
          {
            path: 'M 100 80 L 220 80 Q 300 80 300 200 Q 300 320 220 320 L 100 320',
            startPoint: { x: 100, y: 80 },
            endPoint: { x: 100, y: 320 },
            direction: '→'
          }
        ]
      },
      'E': {
        strokes: [
          {
            path: 'M 100 80 L 100 320',
            startPoint: { x: 100, y: 80 },
            endPoint: { x: 100, y: 320 },
            direction: '↓'
          },
          {
            path: 'M 100 80 L 280 80',
            startPoint: { x: 100, y: 80 },
            endPoint: { x: 280, y: 80 },
            direction: '→'
          },
          {
            path: 'M 100 200 L 260 200',
            startPoint: { x: 100, y: 200 },
            endPoint: { x: 260, y: 200 },
            direction: '→'
          },
          {
            path: 'M 100 320 L 280 320',
            startPoint: { x: 100, y: 320 },
            endPoint: { x: 280, y: 320 },
            direction: '→'
          }
        ]
      },
      'F': {
        strokes: [
          {
            path: 'M 100 80 L 100 320',
            startPoint: { x: 100, y: 80 },
            endPoint: { x: 100, y: 320 },
            direction: '↓'
          },
          {
            path: 'M 100 80 L 280 80',
            startPoint: { x: 100, y: 80 },
            endPoint: { x: 280, y: 80 },
            direction: '→'
          },
          {
            path: 'M 100 200 L 260 200',
            startPoint: { x: 100, y: 200 },
            endPoint: { x: 260, y: 200 },
            direction: '→'
          }
        ]
      },
      'G': {
        strokes: [
          {
            path: 'M 300 120 Q 260 80 200 80 Q 100 80 100 200 Q 100 320 200 320 Q 280 320 280 240 L 280 200 L 220 200',
            startPoint: { x: 300, y: 120 },
            endPoint: { x: 220, y: 200 },
            direction: '↶'
          }
        ]
      },
      'H': {
        strokes: [
          {
            path: 'M 100 80 L 100 320',
            startPoint: { x: 100, y: 80 },
            endPoint: { x: 100, y: 320 },
            direction: '↓'
          },
          {
            path: 'M 300 80 L 300 320',
            startPoint: { x: 300, y: 80 },
            endPoint: { x: 300, y: 320 },
            direction: '↓'
          },
          {
            path: 'M 100 200 L 300 200',
            startPoint: { x: 100, y: 200 },
            endPoint: { x: 300, y: 200 },
            direction: '→'
          }
        ]
      },
      'I': {
        strokes: [
          {
            path: 'M 120 80 L 280 80',
            startPoint: { x: 120, y: 80 },
            endPoint: { x: 280, y: 80 },
            direction: '→'
          },
          {
            path: 'M 200 80 L 200 320',
            startPoint: { x: 200, y: 80 },
            endPoint: { x: 200, y: 320 },
            direction: '↓'
          },
          {
            path: 'M 120 320 L 280 320',
            startPoint: { x: 120, y: 320 },
            endPoint: { x: 280, y: 320 },
            direction: '→'
          }
        ]
      },
      'J': {
        strokes: [
          {
            path: 'M 120 80 L 280 80',
            startPoint: { x: 120, y: 80 },
            endPoint: { x: 280, y: 80 },
            direction: '→'
          },
          {
            path: 'M 220 80 L 220 280 Q 220 320 180 320 Q 140 320 140 280',
            startPoint: { x: 220, y: 80 },
            endPoint: { x: 140, y: 280 },
            direction: '↓'
          }
        ]
      },
      'K': {
        strokes: [
          {
            path: 'M 100 80 L 100 320',
            startPoint: { x: 100, y: 80 },
            endPoint: { x: 100, y: 320 },
            direction: '↓'
          },
          {
            path: 'M 300 80 L 100 200',
            startPoint: { x: 300, y: 80 },
            endPoint: { x: 100, y: 200 },
            direction: '↙'
          },
          {
            path: 'M 100 200 L 300 320',
            startPoint: { x: 100, y: 200 },
            endPoint: { x: 300, y: 320 },
            direction: '↘'
          }
        ]
      },
      'L': {
        strokes: [
          {
            path: 'M 100 80 L 100 320',
            startPoint: { x: 100, y: 80 },
            endPoint: { x: 100, y: 320 },
            direction: '↓'
          },
          {
            path: 'M 100 320 L 280 320',
            startPoint: { x: 100, y: 320 },
            endPoint: { x: 280, y: 320 },
            direction: '→'
          }
        ]
      },
      'M': {
        strokes: [
          {
            path: 'M 80 320 L 80 80',
            startPoint: { x: 80, y: 320 },
            endPoint: { x: 80, y: 80 },
            direction: '↑'
          },
          {
            path: 'M 80 80 L 200 200',
            startPoint: { x: 80, y: 80 },
            endPoint: { x: 200, y: 200 },
            direction: '↘'
          },
          {
            path: 'M 200 200 L 320 80',
            startPoint: { x: 200, y: 200 },
            endPoint: { x: 320, y: 80 },
            direction: '↗'
          },
          {
            path: 'M 320 80 L 320 320',
            startPoint: { x: 320, y: 80 },
            endPoint: { x: 320, y: 320 },
            direction: '↓'
          }
        ]
      },
      'N': {
        strokes: [
          {
            path: 'M 100 320 L 100 80',
            startPoint: { x: 100, y: 320 },
            endPoint: { x: 100, y: 80 },
            direction: '↑'
          },
          {
            path: 'M 100 80 L 300 320',
            startPoint: { x: 100, y: 80 },
            endPoint: { x: 300, y: 320 },
            direction: '↘'
          },
          {
            path: 'M 300 320 L 300 80',
            startPoint: { x: 300, y: 320 },
            endPoint: { x: 300, y: 80 },
            direction: '↑'
          }
        ]
      },
      'O': {
        strokes: [
          {
            path: 'M 200 80 Q 100 80 100 200 Q 100 320 200 320 Q 300 320 300 200 Q 300 80 200 80',
            startPoint: { x: 200, y: 80 },
            endPoint: { x: 200, y: 80 },
            direction: '↶'
          }
        ]
      },
      'P': {
        strokes: [
          {
            path: 'M 100 320 L 100 80',
            startPoint: { x: 100, y: 320 },
            endPoint: { x: 100, y: 80 },
            direction: '↑'
          },
          {
            path: 'M 100 80 L 240 80 Q 300 80 300 160 Q 300 240 240 240 L 100 240',
            startPoint: { x: 100, y: 80 },
            endPoint: { x: 100, y: 240 },
            direction: '→'
          }
        ]
      },
      'Q': {
        strokes: [
          {
            path: 'M 200 80 Q 100 80 100 200 Q 100 320 200 320 Q 300 320 300 200 Q 300 80 200 80',
            startPoint: { x: 200, y: 80 },
            endPoint: { x: 200, y: 80 },
            direction: '↶'
          },
          {
            path: 'M 240 280 L 320 360',
            startPoint: { x: 240, y: 280 },
            endPoint: { x: 320, y: 360 },
            direction: '↘'
          }
        ]
      },
      'R': {
        strokes: [
          {
            path: 'M 100 320 L 100 80',
            startPoint: { x: 100, y: 320 },
            endPoint: { x: 100, y: 80 },
            direction: '↑'
          },
          {
            path: 'M 100 80 L 240 80 Q 300 80 300 160 Q 300 240 240 240 L 100 240',
            startPoint: { x: 100, y: 80 },
            endPoint: { x: 100, y: 240 },
            direction: '→'
          },
          {
            path: 'M 180 240 L 300 320',
            startPoint: { x: 180, y: 240 },
            endPoint: { x: 300, y: 320 },
            direction: '↘'
          }
        ]
      },
      'S': {
        strokes: [
          {
            path: 'M 280 120 Q 260 80 200 80 Q 100 80 100 140 Q 100 200 200 200 Q 300 200 300 260 Q 300 320 200 320 Q 140 320 120 280',
            startPoint: { x: 280, y: 120 },
            endPoint: { x: 120, y: 280 },
            direction: '↶'
          }
        ]
      },
      'T': {
        strokes: [
          {
            path: 'M 100 80 L 300 80',
            startPoint: { x: 100, y: 80 },
            endPoint: { x: 300, y: 80 },
            direction: '→'
          },
          {
            path: 'M 200 80 L 200 320',
            startPoint: { x: 200, y: 80 },
            endPoint: { x: 200, y: 320 },
            direction: '↓'
          }
        ]
      },
      'U': {
        strokes: [
          {
            path: 'M 100 80 L 100 280 Q 100 320 200 320 Q 300 320 300 280 L 300 80',
            startPoint: { x: 100, y: 80 },
            endPoint: { x: 300, y: 80 },
            direction: '↓'
          }
        ]
      },
      'V': {
        strokes: [
          {
            path: 'M 80 80 L 200 320',
            startPoint: { x: 80, y: 80 },
            endPoint: { x: 200, y: 320 },
            direction: '↘'
          },
          {
            path: 'M 200 320 L 320 80',
            startPoint: { x: 200, y: 320 },
            endPoint: { x: 320, y: 80 },
            direction: '↗'
          }
        ]
      },
      'W': {
        strokes: [
          {
            path: 'M 80 80 L 120 320',
            startPoint: { x: 80, y: 80 },
            endPoint: { x: 120, y: 320 },
            direction: '↘'
          },
          {
            path: 'M 120 320 L 200 160',
            startPoint: { x: 120, y: 320 },
            endPoint: { x: 200, y: 160 },
            direction: '↗'
          },
          {
            path: 'M 200 160 L 280 320',
            startPoint: { x: 200, y: 160 },
            endPoint: { x: 280, y: 320 },
            direction: '↘'
          },
          {
            path: 'M 280 320 L 320 80',
            startPoint: { x: 280, y: 320 },
            endPoint: { x: 320, y: 80 },
            direction: '↗'
          }
        ]
      },
      'X': {
        strokes: [
          {
            path: 'M 100 80 L 300 320',
            startPoint: { x: 100, y: 80 },
            endPoint: { x: 300, y: 320 },
            direction: '↘'
          },
          {
            path: 'M 300 80 L 100 320',
            startPoint: { x: 300, y: 80 },
            endPoint: { x: 100, y: 320 },
            direction: '↙'
          }
        ]
      },
      'Y': {
        strokes: [
          {
            path: 'M 100 80 L 200 200',
            startPoint: { x: 100, y: 80 },
            endPoint: { x: 200, y: 200 },
            direction: '↘'
          },
          {
            path: 'M 300 80 L 200 200',
            startPoint: { x: 300, y: 80 },
            endPoint: { x: 200, y: 200 },
            direction: '↙'
          },
          {
            path: 'M 200 200 L 200 320',
            startPoint: { x: 200, y: 200 },
            endPoint: { x: 200, y: 320 },
            direction: '↓'
          }
        ]
      },
      'Z': {
        strokes: [
          {
            path: 'M 100 80 L 300 80',
            startPoint: { x: 100, y: 80 },
            endPoint: { x: 300, y: 80 },
            direction: '→'
          },
          {
            path: 'M 300 80 L 100 320',
            startPoint: { x: 300, y: 80 },
            endPoint: { x: 100, y: 320 },
            direction: '↙'
          },
          {
            path: 'M 100 320 L 300 320',
            startPoint: { x: 100, y: 320 },
            endPoint: { x: 300, y: 320 },
            direction: '→'
          }
        ]
      }
    };
  }

  private initializeCursiveLetterPaths() {
    // Cursive/Handwritten style letter paths for Writing mode
    // These are flowing, connected-style letters
    this.cursiveLetterPaths = {
      'A': {
        path: 'M 80 320 Q 120 100 200 80 Q 280 100 320 320 M 100 220 Q 200 180 300 220'
      },
      'B': {
        path: 'M 100 320 L 100 80 M 100 80 Q 180 80 200 120 Q 220 160 180 180 Q 140 200 100 180 M 100 180 Q 200 180 220 220 Q 240 280 180 320 Q 120 340 100 320'
      },
      'C': {
        path: 'M 280 120 Q 220 60 160 80 Q 80 120 80 200 Q 80 280 160 320 Q 220 340 280 280'
      },
      'D': {
        path: 'M 100 320 L 100 80 Q 100 80 120 80 Q 280 80 280 200 Q 280 320 120 320 Q 100 320 100 320'
      },
      'E': {
        path: 'M 260 80 Q 140 80 100 80 L 100 320 Q 140 320 260 320 M 100 200 L 220 200'
      },
      'F': {
        path: 'M 260 80 Q 140 80 100 80 L 100 320 M 100 200 L 200 200'
      },
      'G': {
        path: 'M 280 120 Q 220 60 160 80 Q 80 120 80 200 Q 80 280 160 320 Q 240 340 280 280 L 280 200 L 200 200'
      },
      'H': {
        path: 'M 100 80 L 100 320 M 300 80 L 300 320 M 100 200 Q 200 180 300 200'
      },
      'I': {
        path: 'M 140 80 L 260 80 M 200 80 L 200 320 M 140 320 L 260 320'
      },
      'J': {
        path: 'M 140 80 L 260 80 M 200 80 L 200 280 Q 200 340 140 320 Q 100 300 100 260'
      },
      'K': {
        path: 'M 100 80 L 100 320 M 280 80 Q 180 160 100 200 M 100 200 Q 180 240 280 320'
      },
      'L': {
        path: 'M 100 80 L 100 320 Q 100 320 280 320'
      },
      'M': {
        path: 'M 80 320 L 80 80 Q 120 160 200 200 Q 280 160 320 80 L 320 320'
      },
      'N': {
        path: 'M 100 320 L 100 80 Q 200 200 300 320 L 300 80'
      },
      'O': {
        path: 'M 200 80 Q 80 80 80 200 Q 80 320 200 320 Q 320 320 320 200 Q 320 80 200 80'
      },
      'P': {
        path: 'M 100 320 L 100 80 Q 280 80 280 160 Q 280 240 100 240'
      },
      'Q': {
        path: 'M 200 80 Q 80 80 80 200 Q 80 320 200 320 Q 320 320 320 200 Q 320 80 200 80 M 240 280 Q 280 320 340 360'
      },
      'R': {
        path: 'M 100 320 L 100 80 Q 280 80 280 160 Q 280 240 100 240 M 180 240 Q 240 280 300 320'
      },
      'S': {
        path: 'M 280 120 Q 240 60 180 80 Q 100 100 100 160 Q 100 200 200 200 Q 300 200 300 260 Q 300 320 200 320 Q 140 320 100 280'
      },
      'T': {
        path: 'M 80 80 L 320 80 M 200 80 L 200 320'
      },
      'U': {
        path: 'M 100 80 L 100 260 Q 100 340 200 340 Q 300 340 300 260 L 300 80'
      },
      'V': {
        path: 'M 80 80 Q 120 200 200 320 Q 280 200 320 80'
      },
      'W': {
        path: 'M 60 80 Q 100 240 140 320 Q 180 200 200 160 Q 220 200 260 320 Q 300 240 340 80'
      },
      'X': {
        path: 'M 100 80 Q 200 200 300 320 M 300 80 Q 200 200 100 320'
      },
      'Y': {
        path: 'M 100 80 Q 150 160 200 200 L 200 320 M 300 80 Q 250 160 200 200'
      },
      'Z': {
        path: 'M 100 80 L 300 80 Q 200 200 100 320 L 300 320'
      }
    };
  }

  getCursiveLetterPath(): string {
    return this.cursiveLetterPaths[this.currentLetter]?.path || this.cursiveLetterPaths['A'].path;
  }

  private setupLetter() {
    const letterData = this.letterPaths[this.currentLetter] || this.letterPaths['A'];

    // Initialize stroke tracking
    this.currentStrokeIndex = 0;
    this.completedStrokes = new Array(letterData.strokes.length).fill(false);
    this.maskPath = '';

    // Free writing mode - no stroke indicators needed
    if (!this.isFreeWriting) {
      // Show current stroke indicators
      this.updateCurrentStroke();
    }

    // Update decoration based on letter
    this.updateLetterDecoration();
  }

  private updateLetterDecoration() {
    const decorations: { [key: string]: string } = {
      'A': '🍎', 'B': '⚽', 'C': '🌙', 'D': '🐕', 'E': '🥚',
      'F': '🌸', 'G': '🍇', 'H': '🏠', 'I': '🍦', 'J': '🎨',
      'K': '🔑', 'L': '🦁', 'M': '🍄', 'N': '📰', 'O': '🍊',
      'P': '🍕', 'Q': '👑', 'R': '🌈', 'S': '⭐', 'T': '🌳',
      'U': '☂️', 'V': '🎻', 'W': '🍉', 'X': '❌', 'Y': '💛',
      'Z': '⚡'
    };

    if (this.isFreeWriting) {
      // Update writing mode decoration
      const decorElement = document.querySelector('#letterDecorWriting');
      if (decorElement) {
        decorElement.textContent = decorations[this.currentLetter] || '🎈';
      }
    } else {
      // Update tracing mode decoration
      const svg = this.svgRef.nativeElement;
      const decorElement = svg.querySelector('#letterDecor');
      if (decorElement) {
        decorElement.textContent = decorations[this.currentLetter] || '🎈';
      }
    }
  }

  private updateCurrentStroke() {
    const svg = this.svgRef.nativeElement;
    const letterData = this.letterPaths[this.currentLetter] || this.letterPaths['A'];
    const currentStroke = letterData.strokes[this.currentStrokeIndex];

    if (!currentStroke) {
      // All strokes completed!
      this.showCursor = false;
      this.triggerCelebration();
      return;
    }

    // Reset stroke progress
    this.currentPathProgress = 0;
    this.currentStrokeMaskPath = '';
    this.showCursor = false;
    this.lastPoint = null; // Reset for new stroke drawing
    this.hasStartedCurrentStroke = false;

    // Clear previous indicators
    const guidePath = svg.querySelector('#guidePath') as SVGPathElement;
    const arrowsGroup = svg.querySelector('#arrowsGroup');
    const dotsGroup = svg.querySelector('#dotsGroup');

    if (dotsGroup) dotsGroup.innerHTML = '';
    if (arrowsGroup) arrowsGroup.innerHTML = '';

    // Set guide path for current stroke (hidden by default, shown on hint)
    if (guidePath) {
      guidePath.setAttribute('d', currentStroke.path);
      guidePath.setAttribute('stroke', '#9CA3AF');
      guidePath.setAttribute('stroke-width', '3');
      guidePath.setAttribute('opacity', '0');
    }

    // Create a temporary path element to track progress
    this.currentStrokePathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.currentStrokePathElement.setAttribute('d', currentStroke.path);
    svg.appendChild(this.currentStrokePathElement);
    this.currentStrokePathElement.style.display = 'none';

    // Add small start and end point indicators INSIDE the letter (on stroke path)
    if (arrowsGroup) {
      // Position indicators directly at stroke start/end points
      const startX = currentStroke.startPoint.x;
      const startY = currentStroke.startPoint.y;
      const endX = currentStroke.endPoint.x;
      const endY = currentStroke.endPoint.y;

      // Small start indicator - Yellow dot with tiny arrow
      const startCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      startCircle.setAttribute('cx', startX.toString());
      startCircle.setAttribute('cy', startY.toString());
      startCircle.setAttribute('r', '12');
      startCircle.setAttribute('fill', '#FCD34D');
      startCircle.setAttribute('stroke', '#F59E0B');
      startCircle.setAttribute('stroke-width', '3');
      startCircle.setAttribute('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');

      // Small arrow text on start
      const startText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      startText.setAttribute('x', startX.toString());
      startText.setAttribute('y', (startY + 5).toString());
      startText.setAttribute('font-size', '14');
      startText.setAttribute('font-weight', 'bold');
      startText.setAttribute('text-anchor', 'middle');
      startText.setAttribute('fill', '#F97316');
      startText.textContent = currentStroke.direction;

      // Small end indicator - Green dot
      const endCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      endCircle.setAttribute('cx', endX.toString());
      endCircle.setAttribute('cy', endY.toString());
      endCircle.setAttribute('r', '10');
      endCircle.setAttribute('fill', '#10B981');
      endCircle.setAttribute('stroke', '#059669');
      endCircle.setAttribute('stroke-width', '3');
      endCircle.setAttribute('opacity', '0.9');
      endCircle.setAttribute('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))');

      arrowsGroup.appendChild(startCircle);
      arrowsGroup.appendChild(startText);
      arrowsGroup.appendChild(endCircle);
    }
  }

  private setupDrawing() {
    const canvas = this.canvasRef.nativeElement;

    // Match canvas size
    if (this.isFreeWriting) {
      // In writing mode, match the container size
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    } else {
      // In tracing mode, match SVG size
      const svg = this.svgRef.nativeElement;
      const rect = svg.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    // Mouse events
    canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    canvas.addEventListener('mousemove', (e) => this.draw(e));
    canvas.addEventListener('mouseup', () => this.stopDrawing());
    canvas.addEventListener('mouseleave', () => this.stopDrawing());

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.startDrawing(e);
    });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.draw(e);
    });
    canvas.addEventListener('touchend', () => this.stopDrawing());
  }

  private startDrawing(event: MouseEvent | TouchEvent) {
    const point = this.getPoint(event);

    // Free writing mode - draw anywhere
    if (this.isFreeWriting) {
      this.isDrawing = true;
      this.lastPoint = point;
      return;
    }

    const letterData = this.letterPaths[this.currentLetter] || this.letterPaths['A'];
    const currentStroke = letterData.strokes[this.currentStrokeIndex];

    if (!currentStroke || !this.currentStrokePathElement) return;

    // Check if starting near the start point (within 60px tolerance)
    const startDistance = this.calculateDistance(point, currentStroke.startPoint);

    if (startDistance < 60 || this.hasStartedCurrentStroke) {
      this.isDrawing = true;
      this.hasStartedCurrentStroke = true;
      this.showCursor = true;

      // Update path progress based on touch position
      this.updatePathProgress(point);
    }
  }

  private draw(event: MouseEvent | TouchEvent) {
    if (!this.isDrawing) return;

    const point = this.getPoint(event);

    // Free writing mode - just draw
    if (this.isFreeWriting) {
      this.drawFreeStroke(point);
      return;
    }

    // Update path progress based on current touch position
    this.updatePathProgress(point);
  }

  private updatePathProgress(touchPoint: { x: number; y: number }) {
    if (!this.currentStrokePathElement) return;

    const letterData = this.letterPaths[this.currentLetter] || this.letterPaths['A'];
    const currentStroke = letterData.strokes[this.currentStrokeIndex];
    if (!currentStroke) return;

    const pathLength = this.currentStrokePathElement.getTotalLength();

    // Find the closest point on the path to the touch point
    let closestDistance = Infinity;
    let closestPoint = 0;

    // Sample points along the path to find the closest one
    const samples = 100;
    for (let i = 0; i <= samples; i++) {
      const distance = (i / samples) * pathLength;
      const point = this.currentStrokePathElement.getPointAtLength(distance);

      const dx = touchPoint.x - point.x;
      const dy = touchPoint.y - point.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < closestDistance) {
        closestDistance = dist;
        closestPoint = distance;
      }
    }

    // Only update if touch is reasonably close to the path (within 60px)
    if (closestDistance < 60) {
      // Update progress (ensure it only moves forward)
      const newProgress = Math.min(pathLength, Math.max(this.currentPathProgress, closestPoint));
      this.currentPathProgress = newProgress;

      // Get the point on the path at current progress
      const currentPoint = this.currentStrokePathElement.getPointAtLength(this.currentPathProgress);

      // Update cursor position
      this.cursorX = currentPoint.x;
      this.cursorY = currentPoint.y;

      // Draw visible stroke on canvas in tracing mode
      this.drawTracingStroke(currentPoint);

      // Create a partial path from start to current progress
      const progressPercentage = (this.currentPathProgress / pathLength) * 100;

      // Build the mask path for the completed portion
      this.currentStrokeMaskPath = '';
      const stepSize = pathLength / 200; // More samples for smoother reveal
      for (let i = 0; i <= this.currentPathProgress; i += stepSize) {
        const pt = this.currentStrokePathElement.getPointAtLength(i);
        if (i === 0) {
          this.currentStrokeMaskPath += `M ${pt.x} ${pt.y} `;
        } else {
          this.currentStrokeMaskPath += `L ${pt.x} ${pt.y} `;
        }
      }

      this.updateMask();

      // Check if stroke is complete (reached 95% or more)
      if (progressPercentage >= 95) {
        this.checkStrokeCompletion(currentPoint);
      }
    }
  }

  private stopDrawing() {
    this.isDrawing = false;

    // In free writing mode, reset lastPoint to start new stroke
    if (this.isFreeWriting) {
      this.lastPoint = null;
    }
    // Don't reset lastPoint or strokeStartPoint in guided mode - allow continuing the same stroke
  }

  private checkStrokeCompletion(currentPoint: { x: number; y: number }) {
    if (!this.currentStrokePathElement) return;

    const pathLength = this.currentStrokePathElement.getTotalLength();
    const progressPercentage = (this.currentPathProgress / pathLength) * 100;

    // Complete if reached 95% or more of the path
    if (progressPercentage >= 95) {
      this.completeCurrentStroke();
    }
  }

  private drawTracingStroke(point: { x: number; y: number }) {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Convert SVG coordinates (400x400) to canvas coordinates
    const canvasX = (point.x / 400) * canvas.width;
    const canvasY = (point.y / 400) * canvas.height;

    // Set drawing style
    ctx.strokeStyle = '#D946A6'; // Magenta color
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (!this.lastPoint) {
      // Start new stroke
      this.lastPoint = { x: canvasX, y: canvasY };
      ctx.beginPath();
      ctx.moveTo(canvasX, canvasY);
    } else {
      // Continue drawing
      ctx.beginPath();
      ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
      ctx.lineTo(canvasX, canvasY);
      ctx.stroke();
      this.lastPoint = { x: canvasX, y: canvasY };
    }
  }

  private drawFreeStroke(point: { x: number; y: number }) {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set drawing style - thicker stroke for writing mode
    ctx.strokeStyle = '#D946A6'; // Magenta color
    ctx.lineWidth = 18; // Thicker stroke for better visibility
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (!this.lastPoint) {
      // Start new stroke
      this.lastPoint = point;
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    } else {
      // Continue drawing
      ctx.beginPath();
      ctx.moveTo(this.lastPoint.x, this.lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      this.lastPoint = point;
    }

    // Keep track of drawing path for progress
    this.maskPath += `L ${point.x} ${point.y} `;

    // Calculate coverage and update progress
    this.updateFreeWritingProgress();
  }

  private updateFreeWritingProgress() {
    // Estimate progress based on mask path length
    // Simple heuristic: count the commands in the path
    const commands = this.maskPath.split(/[ML]/).filter(s => s.trim().length > 0);
    const estimatedProgress = Math.min(100, (commands.length / 150) * 100);

    this.traceProgress = Math.round(estimatedProgress);

    // Show celebration when nearly complete
    if (this.traceProgress >= 80 && !this.showCelebration) {
      this.showCelebration = true;
      setTimeout(() => {
        this.showCelebration = false;
      }, 2000);
    }
  }

  private calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private completeCurrentStroke() {
    const letterData = this.letterPaths[this.currentLetter] || this.letterPaths['A'];
    const currentStroke = letterData.strokes[this.currentStrokeIndex];

    if (!currentStroke) return;

    // Add the complete stroke path to permanent mask (100% revealed)
    if (this.currentStrokePathElement) {
      const pathLength = this.currentStrokePathElement.getTotalLength();
      let completePath = '';
      const stepSize = pathLength / 200;
      for (let i = 0; i <= pathLength; i += stepSize) {
        const pt = this.currentStrokePathElement.getPointAtLength(i);
        if (i === 0) {
          completePath += `M ${pt.x} ${pt.y} `;
        } else {
          completePath += `L ${pt.x} ${pt.y} `;
        }
      }
      this.maskPath += completePath;

      // Clean up temporary path element
      const svg = this.svgRef.nativeElement;
      if (this.currentStrokePathElement.parentNode === svg) {
        svg.removeChild(this.currentStrokePathElement);
      }
      this.currentStrokePathElement = null;
    }

    // Reset current stroke drawing
    this.currentStrokeMaskPath = '';
    this.hasStartedCurrentStroke = false;
    this.strokeStartPoint = null;
    this.lastPoint = null;
    this.isDrawing = false;
    this.showCursor = false;
    this.currentPathProgress = 0;

    // Mark stroke as completed
    this.completedStrokes[this.currentStrokeIndex] = true;

    // Move to next stroke
    this.currentStrokeIndex++;

    // Update progress
    this.traceProgress = Math.round((this.currentStrokeIndex / letterData.strokes.length) * 100);

    // Show next stroke or complete
    setTimeout(() => {
      this.updateCurrentStroke();
    }, 300);
  }

  private getPoint(event: MouseEvent | TouchEvent): { x: number; y: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    let clientX: number, clientY: number;

    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }

    if (this.isFreeWriting) {
      // For free writing mode, use canvas pixel coordinates
      const x = ((clientX - rect.left) / rect.width) * canvas.width;
      const y = ((clientY - rect.top) / rect.height) * canvas.height;
      return { x, y };
    } else {
      // For tracing mode, convert to SVG coordinates (400x400)
      const x = ((clientX - rect.left) / rect.width) * 400;
      const y = ((clientY - rect.top) / rect.height) * 400;
      return { x, y };
    }
  }

  private updateMask() {
    const svg = this.svgRef.nativeElement;
    const maskPath = svg.querySelector('#maskPath') as SVGPathElement;
    if (maskPath) {
      // Combine completed strokes + current drawing
      const fullPath = this.maskPath + this.currentStrokeMaskPath;
      maskPath.setAttribute('d', fullPath);
    }
  }

  private triggerCelebration() {
    if (this.showCelebration) return; // Prevent duplicate celebrations

    this.showCelebration = true;
    this.traceProgress = 100;

    // Add confetti-like effect
    const svg = this.svgRef.nativeElement;
    const grayLetter = svg.querySelector('#grayLetter');
    const arrowsGroup = svg.querySelector('#arrowsGroup');
    const guidePath = svg.querySelector('#guidePath');

    if (grayLetter) {
      grayLetter.classList.add('letter-complete');
    }

    // Hide guide elements since complete
    if (arrowsGroup) arrowsGroup.innerHTML = '';
    if (guidePath) guidePath.setAttribute('d', '');

    // Reset celebration after animation
    setTimeout(() => {
      this.showCelebration = false;
      if (grayLetter) {
        grayLetter.classList.remove('letter-complete');
      }
    }, 2000);
  }

  clearDrawing() {
    // Clear the canvas in both modes
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Clean up temporary path element if exists
    if (this.currentStrokePathElement) {
      const svg = this.svgRef.nativeElement;
      if (this.currentStrokePathElement.parentNode === svg) {
        svg.removeChild(this.currentStrokePathElement);
      }
      this.currentStrokePathElement = null;
    }

    // Reset everything and start from first stroke
    this.maskPath = '';
    this.currentStrokeMaskPath = '';
    if (!this.isFreeWriting) {
      this.updateMask();
    }
    this.lastPoint = null;
    this.strokeStartPoint = null;
    this.currentStrokeIndex = 0;
    this.traceProgress = 0;
    this.hasStartedCurrentStroke = false;
    this.isDrawing = false;
    this.showCursor = false;
    this.currentPathProgress = 0;

    const letterData = this.letterPaths[this.currentLetter] || this.letterPaths['A'];
    this.completedStrokes = new Array(letterData.strokes.length).fill(false);

    // Only update stroke indicators in guided mode
    if (!this.isFreeWriting) {
      this.updateCurrentStroke();
    }
  }

  showHint() {
    // Temporarily show the current stroke path more prominently
    const svg = this.svgRef.nativeElement;
    const guidePath = svg.querySelector('#guidePath') as SVGPathElement;

    if (guidePath) {
      // Make guide path visible with animated dashes
      guidePath.setAttribute('opacity', '1');
      guidePath.setAttribute('stroke-width', '8');
      guidePath.setAttribute('stroke', '#F59E0B');
      guidePath.setAttribute('stroke-dasharray', '15,5');

      // Restore after 2.5 seconds
      setTimeout(() => {
        guidePath.setAttribute('opacity', '0');
        guidePath.setAttribute('stroke-width', '3');
        guidePath.setAttribute('stroke', '#9CA3AF');
        guidePath.setAttribute('stroke-dasharray', 'none');
      }, 2500);
    }
  }

  goBack() {
    this.router.navigate(['/letters']);
  }
}
