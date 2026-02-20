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

  // Pen customization options
  penColor: string = '#F97316'; // Default orange
  penWidth: number = 18; // Default width
  availableColors: { color: string; name: string }[] = [
    { color: '#F97316', name: 'Pink' },
    { color: '#3B82F6', name: 'Blue' },
    { color: '#10B981', name: 'Green' },
    { color: '#F59E0B', name: 'Orange' },
    { color: '#8B5CF6', name: 'Purple' },
    { color: '#EF4444', name: 'Red' },
    { color: '#000000', name: 'Black' }
  ];
  availableWidths: number[] = [12, 18, 24, 30];

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

    // Subscribe to route param changes for prev/next navigation
    this.route.paramMap.subscribe(params => {
      const letter = params.get('letter') || 'A';
      if (letter !== this.currentLetter) {
        this.currentLetter = letter;
        this.clearDrawing();
        setTimeout(() => {
          this.setupLetter();
          this.setupDrawing();
        }, 100);
      }
    });
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
            path: 'M 200 60 L 125 280',
            startPoint: { x: 200, y: 60 },
            endPoint: { x: 125, y: 280 },
            direction: '↙'
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
            path: 'M 110 55 L 110 345',
            startPoint: { x: 110, y: 55 },
            endPoint: { x: 110, y: 345 },
            direction: '↓'
          },
          {
            path: 'M 110 55 L 200 55 Q 280 55 280 127.5 Q 280 200 200 200 L 110 200',
            startPoint: { x: 110, y: 55 },
            endPoint: { x: 110, y: 200 },
            direction: '⟳'
          },
          {
            path: 'M 110 200 L 200 200 Q 280 200 280 272.5 Q 280 345 200 345 L 110 345',
            startPoint: { x: 110, y: 200 },
            endPoint: { x: 110, y: 345 },
            direction: '⟳'
          }
        ]
      },
      'C': {
        strokes: [
          {
            path: 'M 280 100 Q 280 55 200 55 Q 80 55 80 200 Q 80 345 200 345 Q 280 345 280 300',
            startPoint: { x: 280, y: 100 },
            endPoint: { x: 280, y: 300 },
            direction: '↶'
          }
        ]
      },
      'D': {
        strokes: [
          {
            path: 'M 100 55 L 100 345',
            startPoint: { x: 100, y: 55 },
            endPoint: { x: 100, y: 345 },
            direction: '↓'
          },
          {
            path: 'M 100 55 L 200 55 Q 300 55 300 200 Q 300 345 200 345 L 100 345',
            startPoint: { x: 100, y: 55 },
            endPoint: { x: 100, y: 345 },
            direction: '⟳'
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
            path: 'M 280 100 Q 280 80 200 80 Q 100 80 100 200 Q 100 320 200 320 Q 300 320 300 260 L 300 200 L 200 200',
            startPoint: { x: 280, y: 100 },
            endPoint: { x: 200, y: 200 },
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
            path: 'M 200 80 L 200 280 Q 200 320 160 320 Q 120 320 120 280',
            startPoint: { x: 200, y: 80 },
            endPoint: { x: 120, y: 280 },
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
            path: 'M 80 66 L 80 334',
            startPoint: { x: 80, y: 66 },
            endPoint: { x: 80, y: 334 },
            direction: '↓'
          },
          {
            path: 'M 80 66 L 200 196',
            startPoint: { x: 80, y: 66 },
            endPoint: { x: 200, y: 196 },
            direction: '↘'
          },
          {
            path: 'M 200 196 L 320 66',
            startPoint: { x: 200, y: 196 },
            endPoint: { x: 320, y: 66 },
            direction: '↗'
          },
          {
            path: 'M 320 66 L 320 334',
            startPoint: { x: 320, y: 66 },
            endPoint: { x: 320, y: 334 },
            direction: '↓'
          }
        ]
      },
      'N': {
        strokes: [
          {
            path: 'M 100 66 L 100 334',
            startPoint: { x: 100, y: 66 },
            endPoint: { x: 100, y: 334 },
            direction: '↓'
          },
          {
            path: 'M 100 66 L 300 334',
            startPoint: { x: 100, y: 66 },
            endPoint: { x: 300, y: 334 },
            direction: '↘'
          },
          {
            path: 'M 300 334 L 300 66',
            startPoint: { x: 300, y: 334 },
            endPoint: { x: 300, y: 66 },
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
            path: 'M 100 66 L 100 334',
            startPoint: { x: 100, y: 66 },
            endPoint: { x: 100, y: 334 },
            direction: '↓'
          },
          {
            path: 'M 100 80 L 210 80 Q 246 80 246 128 Q 246 176 210 176 L 100 176',
            startPoint: { x: 100, y: 80 },
            endPoint: { x: 100, y: 176 },
            direction: '⟳'
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
            path: 'M 260 300 L 320 354',
            startPoint: { x: 260, y: 300 },
            endPoint: { x: 320, y: 354 },
            direction: '↘'
          }
        ]
      },
      'R': {
        strokes: [
          {
            path: 'M 100 66 L 100 334',
            startPoint: { x: 100, y: 66 },
            endPoint: { x: 100, y: 334 },
            direction: '↓'
          },
          {
            path: 'M 100 80 L 190 80 C 276 80 276 186 190 186 L 100 186',
            startPoint: { x: 100, y: 80 },
            endPoint: { x: 100, y: 186 },
            direction: '→'
          },
          {
            path: 'M 190 200 L 280 334',
            startPoint: { x: 190, y: 200 },
            endPoint: { x: 280, y: 334 },
            direction: '↘'
          }
        ]
      },
      'S': {
        strokes: [
          {
            path: 'M 256 110 Q 256 80 200 80 Q 124 80 124 138 Q 124 200 200 200 Q 276 200 276 262 Q 276 320 200 320 Q 144 320 144 290',
            startPoint: { x: 256, y: 110 },
            endPoint: { x: 144, y: 290 },
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
            path: 'M 100 80 L 100 280 Q 100 340 200 340 Q 300 340 300 280 L 300 80',
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
      },
      // Numbers 0-9
      '0': {
        strokes: [
          {
            path: 'M 200 80 Q 100 80 100 200 Q 100 320 200 320 Q 300 320 300 200 Q 300 80 200 80',
            startPoint: { x: 200, y: 80 },
            endPoint: { x: 200, y: 80 },
            direction: '↶'
          }
        ]
      },
      '1': {
        strokes: [
          {
            path: 'M 160 106 L 200 80',
            startPoint: { x: 160, y: 106 },
            endPoint: { x: 200, y: 80 },
            direction: '↗'
          },
          {
            path: 'M 200 80 L 200 320',
            startPoint: { x: 200, y: 80 },
            endPoint: { x: 200, y: 320 },
            direction: '↓'
          },
          {
            path: 'M 140 320 L 260 320',
            startPoint: { x: 140, y: 320 },
            endPoint: { x: 260, y: 320 },
            direction: '→'
          }
        ]
      },
      '2': {
        strokes: [
          {
            path: 'M 100 120 Q 100 80 200 80 Q 300 80 300 120 Q 300 180 200 220 L 100 320 L 300 320',
            startPoint: { x: 100, y: 120 },
            endPoint: { x: 300, y: 320 },
            direction: '↷'
          }
        ]
      },
      '3': {
        strokes: [
          {
            path: 'M 100 100 Q 140 80 200 80 Q 300 80 300 130 Q 300 180 200 200',
            startPoint: { x: 100, y: 100 },
            endPoint: { x: 200, y: 200 },
            direction: '⟳'
          },
          {
            path: 'M 200 200 Q 300 200 300 270 Q 300 320 200 320 Q 140 320 100 300',
            startPoint: { x: 200, y: 200 },
            endPoint: { x: 100, y: 300 },
            direction: '⟳'
          }
        ]
      },
      '4': {
        strokes: [
          {
            path: 'M 260 80 L 260 320',
            startPoint: { x: 260, y: 80 },
            endPoint: { x: 260, y: 320 },
            direction: '↓'
          },
          {
            path: 'M 260 80 L 100 240',
            startPoint: { x: 260, y: 80 },
            endPoint: { x: 100, y: 240 },
            direction: '↙'
          },
          {
            path: 'M 100 240 L 260 240',
            startPoint: { x: 100, y: 240 },
            endPoint: { x: 260, y: 240 },
            direction: '→'
          }
        ]
      },
      '5': {
        strokes: [
          {
            path: 'M 280 80 L 120 80',
            startPoint: { x: 280, y: 80 },
            endPoint: { x: 120, y: 80 },
            direction: '←'
          },
          {
            path: 'M 120 80 L 120 170',
            startPoint: { x: 120, y: 80 },
            endPoint: { x: 120, y: 170 },
            direction: '↓'
          },
          {
            path: 'M 120 170 Q 200 150 250 190 Q 290 230 250 290 Q 200 330 120 300',
            startPoint: { x: 120, y: 170 },
            endPoint: { x: 120, y: 300 },
            direction: '⟳'
          }
        ]
      },
      '6': {
        strokes: [
          {
            path: 'M 280 110 Q 240 80 180 80 Q 100 80 100 200 Q 100 320 200 320 Q 300 320 300 260 Q 300 200 200 200 Q 100 200 100 200',
            startPoint: { x: 280, y: 110 },
            endPoint: { x: 100, y: 200 },
            direction: '↶'
          }
        ]
      },
      '7': {
        strokes: [
          {
            path: 'M 100 80 L 300 80',
            startPoint: { x: 100, y: 80 },
            endPoint: { x: 300, y: 80 },
            direction: '→'
          },
          {
            path: 'M 300 80 L 180 320',
            startPoint: { x: 300, y: 80 },
            endPoint: { x: 180, y: 320 },
            direction: '↙'
          }
        ]
      },
      '8': {
        strokes: [
          {
            path: 'M 200 200 Q 100 200 100 130 Q 100 80 200 80 Q 300 80 300 130 Q 300 200 200 200',
            startPoint: { x: 200, y: 200 },
            endPoint: { x: 200, y: 200 },
            direction: '↶'
          },
          {
            path: 'M 200 200 Q 100 200 100 270 Q 100 320 200 320 Q 300 320 300 270 Q 300 200 200 200',
            startPoint: { x: 200, y: 200 },
            endPoint: { x: 200, y: 200 },
            direction: '↷'
          }
        ]
      },
      '9': {
        strokes: [
          {
            path: 'M 300 200 Q 300 200 200 200 Q 100 200 100 130 Q 100 80 200 80 Q 300 80 300 200 Q 300 320 220 320 Q 140 320 120 290',
            startPoint: { x: 300, y: 200 },
            endPoint: { x: 120, y: 290 },
            direction: '↷'
          }
        ]
      },
      // Lowercase letters a-z
      'a': {
        strokes: [
          {
            path: 'M 280 160 Q 280 120 200 120 Q 120 120 120 200 Q 120 280 200 280 Q 280 280 280 200',
            startPoint: { x: 280, y: 160 },
            endPoint: { x: 280, y: 200 },
            direction: '↶'
          },
          {
            path: 'M 280 120 L 280 280',
            startPoint: { x: 280, y: 120 },
            endPoint: { x: 280, y: 280 },
            direction: '↓'
          }
        ]
      },
      'b': {
        strokes: [
          {
            path: 'M 120 60 L 120 280',
            startPoint: { x: 120, y: 60 },
            endPoint: { x: 120, y: 280 },
            direction: '↓'
          },
          {
            path: 'M 120 160 Q 120 120 200 120 Q 280 120 280 200 Q 280 280 200 280 Q 120 280 120 240',
            startPoint: { x: 120, y: 160 },
            endPoint: { x: 120, y: 240 },
            direction: '⟳'
          }
        ]
      },
      'c': {
        strokes: [
          {
            path: 'M 280 160 Q 260 120 200 120 Q 120 120 120 200 Q 120 280 200 280 Q 260 280 280 240',
            startPoint: { x: 280, y: 160 },
            endPoint: { x: 280, y: 240 },
            direction: '↶'
          }
        ]
      },
      'd': {
        strokes: [
          {
            path: 'M 280 160 Q 280 120 200 120 Q 120 120 120 200 Q 120 280 200 280 Q 280 280 280 240',
            startPoint: { x: 280, y: 160 },
            endPoint: { x: 280, y: 240 },
            direction: '↶'
          },
          {
            path: 'M 280 60 L 280 280',
            startPoint: { x: 280, y: 60 },
            endPoint: { x: 280, y: 280 },
            direction: '↓'
          }
        ]
      },
      'e': {
        strokes: [
          {
            path: 'M 120 200 L 280 200 Q 280 120 200 120 Q 120 120 120 200 Q 120 280 200 280 Q 260 280 280 250',
            startPoint: { x: 120, y: 200 },
            endPoint: { x: 280, y: 250 },
            direction: '→'
          }
        ]
      },
      'f': {
        strokes: [
          {
            path: 'M 260 100 Q 260 60 200 60 Q 160 60 160 100 L 160 280',
            startPoint: { x: 260, y: 100 },
            endPoint: { x: 160, y: 280 },
            direction: '↓'
          },
          {
            path: 'M 120 160 L 220 160',
            startPoint: { x: 120, y: 160 },
            endPoint: { x: 220, y: 160 },
            direction: '→'
          }
        ]
      },
      'g': {
        strokes: [
          {
            path: 'M 280 160 Q 280 120 200 120 Q 120 120 120 200 Q 120 280 200 280 Q 280 280 280 200',
            startPoint: { x: 280, y: 160 },
            endPoint: { x: 280, y: 200 },
            direction: '↶'
          },
          {
            path: 'M 280 120 L 280 340 Q 280 380 200 380 Q 140 380 120 340',
            startPoint: { x: 280, y: 120 },
            endPoint: { x: 120, y: 340 },
            direction: '↓'
          }
        ]
      },
      'h': {
        strokes: [
          {
            path: 'M 120 60 L 120 280',
            startPoint: { x: 120, y: 60 },
            endPoint: { x: 120, y: 280 },
            direction: '↓'
          },
          {
            path: 'M 120 180 Q 120 120 200 120 Q 280 120 280 180 L 280 280',
            startPoint: { x: 120, y: 180 },
            endPoint: { x: 280, y: 280 },
            direction: '⟳'
          }
        ]
      },
      'i': {
        strokes: [
          {
            path: 'M 200 120 L 200 280',
            startPoint: { x: 200, y: 120 },
            endPoint: { x: 200, y: 280 },
            direction: '↓'
          }
        ]
      },
      'j': {
        strokes: [
          {
            path: 'M 220 120 L 220 340 Q 220 380 160 380 Q 120 380 120 340',
            startPoint: { x: 220, y: 120 },
            endPoint: { x: 120, y: 340 },
            direction: '↓'
          }
        ]
      },
      'k': {
        strokes: [
          {
            path: 'M 120 60 L 120 280',
            startPoint: { x: 120, y: 60 },
            endPoint: { x: 120, y: 280 },
            direction: '↓'
          },
          {
            path: 'M 260 120 L 120 200',
            startPoint: { x: 260, y: 120 },
            endPoint: { x: 120, y: 200 },
            direction: '↙'
          },
          {
            path: 'M 120 200 L 280 280',
            startPoint: { x: 120, y: 200 },
            endPoint: { x: 280, y: 280 },
            direction: '↘'
          }
        ]
      },
      'l': {
        strokes: [
          {
            path: 'M 200 60 L 200 280',
            startPoint: { x: 200, y: 60 },
            endPoint: { x: 200, y: 280 },
            direction: '↓'
          }
        ]
      },
      'm': {
        strokes: [
          {
            path: 'M 80 120 L 80 280',
            startPoint: { x: 80, y: 120 },
            endPoint: { x: 80, y: 280 },
            direction: '↓'
          },
          {
            path: 'M 80 160 Q 80 120 140 120 Q 200 120 200 160 L 200 280',
            startPoint: { x: 80, y: 160 },
            endPoint: { x: 200, y: 280 },
            direction: '⟳'
          },
          {
            path: 'M 200 160 Q 200 120 260 120 Q 320 120 320 160 L 320 280',
            startPoint: { x: 200, y: 160 },
            endPoint: { x: 320, y: 280 },
            direction: '⟳'
          }
        ]
      },
      'n': {
        strokes: [
          {
            path: 'M 120 120 L 120 280',
            startPoint: { x: 120, y: 120 },
            endPoint: { x: 120, y: 280 },
            direction: '↓'
          },
          {
            path: 'M 120 180 Q 120 120 200 120 Q 280 120 280 180 L 280 280',
            startPoint: { x: 120, y: 180 },
            endPoint: { x: 280, y: 280 },
            direction: '⟳'
          }
        ]
      },
      'o': {
        strokes: [
          {
            path: 'M 200 120 Q 120 120 120 200 Q 120 280 200 280 Q 280 280 280 200 Q 280 120 200 120',
            startPoint: { x: 200, y: 120 },
            endPoint: { x: 200, y: 120 },
            direction: '↶'
          }
        ]
      },
      'p': {
        strokes: [
          {
            path: 'M 120 120 L 120 360',
            startPoint: { x: 120, y: 120 },
            endPoint: { x: 120, y: 360 },
            direction: '↓'
          },
          {
            path: 'M 120 160 Q 120 120 200 120 Q 280 120 280 200 Q 280 280 200 280 Q 120 280 120 240',
            startPoint: { x: 120, y: 160 },
            endPoint: { x: 120, y: 240 },
            direction: '⟳'
          }
        ]
      },
      'q': {
        strokes: [
          {
            path: 'M 280 160 Q 280 120 200 120 Q 120 120 120 200 Q 120 280 200 280 Q 280 280 280 240',
            startPoint: { x: 280, y: 160 },
            endPoint: { x: 280, y: 240 },
            direction: '↶'
          },
          {
            path: 'M 280 120 L 280 360',
            startPoint: { x: 280, y: 120 },
            endPoint: { x: 280, y: 360 },
            direction: '↓'
          }
        ]
      },
      'r': {
        strokes: [
          {
            path: 'M 140 120 L 140 280',
            startPoint: { x: 140, y: 120 },
            endPoint: { x: 140, y: 280 },
            direction: '↓'
          },
          {
            path: 'M 140 160 Q 140 120 200 120 Q 240 120 240 150',
            startPoint: { x: 140, y: 160 },
            endPoint: { x: 240, y: 150 },
            direction: '⟳'
          }
        ]
      },
      's': {
        strokes: [
          {
            path: 'M 260 150 Q 240 120 200 120 Q 140 120 140 160 Q 140 200 200 200 Q 260 200 260 240 Q 260 280 200 280 Q 160 280 140 250',
            startPoint: { x: 260, y: 150 },
            endPoint: { x: 140, y: 250 },
            direction: '↶'
          }
        ]
      },
      't': {
        strokes: [
          {
            path: 'M 200 60 L 200 260 Q 200 280 230 280',
            startPoint: { x: 200, y: 60 },
            endPoint: { x: 230, y: 280 },
            direction: '↓'
          },
          {
            path: 'M 130 120 L 260 120',
            startPoint: { x: 130, y: 120 },
            endPoint: { x: 260, y: 120 },
            direction: '→'
          }
        ]
      },
      'u': {
        strokes: [
          {
            path: 'M 120 100 L 120 220 Q 120 280 200 280 Q 280 280 280 220',
            startPoint: { x: 120, y: 100 },
            endPoint: { x: 280, y: 220 },
            direction: '↓'
          },
          {
            path: 'M 280 100 L 280 280',
            startPoint: { x: 280, y: 100 },
            endPoint: { x: 280, y: 280 },
            direction: '↓'
          }
        ]
      },
      'v': {
        strokes: [
          {
            path: 'M 100 120 L 200 280',
            startPoint: { x: 100, y: 120 },
            endPoint: { x: 200, y: 280 },
            direction: '↘'
          },
          {
            path: 'M 200 280 L 300 120',
            startPoint: { x: 200, y: 280 },
            endPoint: { x: 300, y: 120 },
            direction: '↗'
          }
        ]
      },
      'w': {
        strokes: [
          {
            path: 'M 80 120 L 140 280',
            startPoint: { x: 80, y: 120 },
            endPoint: { x: 140, y: 280 },
            direction: '↘'
          },
          {
            path: 'M 140 280 L 200 180',
            startPoint: { x: 140, y: 280 },
            endPoint: { x: 200, y: 180 },
            direction: '↗'
          },
          {
            path: 'M 200 180 L 260 280',
            startPoint: { x: 200, y: 180 },
            endPoint: { x: 260, y: 280 },
            direction: '↘'
          },
          {
            path: 'M 260 280 L 320 120',
            startPoint: { x: 260, y: 280 },
            endPoint: { x: 320, y: 120 },
            direction: '↗'
          }
        ]
      },
      'x': {
        strokes: [
          {
            path: 'M 120 120 L 280 280',
            startPoint: { x: 120, y: 120 },
            endPoint: { x: 280, y: 280 },
            direction: '↘'
          },
          {
            path: 'M 280 120 L 120 280',
            startPoint: { x: 280, y: 120 },
            endPoint: { x: 120, y: 280 },
            direction: '↙'
          }
        ]
      },
      'y': {
        strokes: [
          {
            path: 'M 140 120 L 140 220 Q 140 260 200 260 Q 260 260 260 220 L 260 120',
            startPoint: { x: 140, y: 120 },
            endPoint: { x: 260, y: 120 },
            direction: '↓'
          },
          {
            path: 'M 260 120 L 260 340 Q 260 380 200 380 Q 140 380 120 340',
            startPoint: { x: 260, y: 120 },
            endPoint: { x: 120, y: 340 },
            direction: '↓'
          }
        ]
      },
      'z': {
        strokes: [
          {
            path: 'M 120 120 L 280 120',
            startPoint: { x: 120, y: 120 },
            endPoint: { x: 280, y: 120 },
            direction: '→'
          },
          {
            path: 'M 280 120 L 120 280',
            startPoint: { x: 280, y: 120 },
            endPoint: { x: 120, y: 280 },
            direction: '↙'
          },
          {
            path: 'M 120 280 L 280 280',
            startPoint: { x: 120, y: 280 },
            endPoint: { x: 280, y: 280 },
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
        path: 'M 100 320 L 100 80 L 190 80 C 276 80 276 186 190 186 L 100 186 M 190 200 L 280 334'
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

    // Create a temporary path element to track progress (completely invisible)
    this.currentStrokePathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.currentStrokePathElement.setAttribute('d', currentStroke.path);
    this.currentStrokePathElement.setAttribute('stroke', 'none');
    this.currentStrokePathElement.setAttribute('fill', 'none');
    this.currentStrokePathElement.setAttribute('opacity', '0');
    this.currentStrokePathElement.style.display = 'none';
    this.currentStrokePathElement.style.visibility = 'hidden';
    this.currentStrokePathElement.style.pointerEvents = 'none';
    svg.appendChild(this.currentStrokePathElement);

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
    // In tracing mode, we don't draw on the canvas anymore
    // The mask reveal system handles showing the magenta color
    // This function now only updates the lastPoint for tracking

    const canvas = this.canvasRef.nativeElement;

    // Convert SVG coordinates (400x400) to canvas coordinates
    const canvasX = (point.x / 400) * canvas.width;
    const canvasY = (point.y / 400) * canvas.height;

    // Just update lastPoint for tracking, no visible stroke
    this.lastPoint = { x: canvasX, y: canvasY };
  }

  private drawFreeStroke(point: { x: number; y: number }) {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set drawing style - use selected pen color and width
    ctx.strokeStyle = this.penColor;
    ctx.lineWidth = this.penWidth;
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
    // Calculate progress based on actual canvas coverage
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get the image data to analyze coverage
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Count pixels that have been drawn (non-transparent pixels)
    let drawnPixels = 0;
    for (let i = 3; i < data.length; i += 4) {
      // Check alpha channel - if > 0, pixel has been drawn
      if (data[i] > 0) {
        drawnPixels++;
      }
    }

    // Calculate total pixels
    const totalPixels = canvas.width * canvas.height;

    // For free writing, we expect about 5-10% coverage to be "complete" writing
    // (since letters don't fill the entire canvas)
    // Set target coverage to around 8% for a well-written letter
    const targetCoverage = 0.08;
    const currentCoverage = drawnPixels / totalPixels;
    const estimatedProgress = Math.min(100, (currentCoverage / targetCoverage) * 100);

    this.traceProgress = Math.round(estimatedProgress);

    // Show celebration when nearly complete
    if (this.traceProgress >= 90 && !this.showCelebration) {
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

  readonly uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  readonly lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  readonly numberLetters = '0123456789'.split('');

  get letterGroup(): string[] {
    return this.currentLetterGroup;
  }

  private get currentLetterGroup(): string[] {
    if (this.lowercaseLetters.includes(this.currentLetter)) {
      return this.lowercaseLetters;
    } else if (this.numberLetters.includes(this.currentLetter)) {
      return this.numberLetters;
    }
    return this.uppercaseLetters;
  }

  goToPreviousLetter() {
    const group = this.currentLetterGroup;
    const idx = group.indexOf(this.currentLetter);
    if (idx > 0) {
      const prevLetter = group[idx - 1];
      this.router.navigate(['/trace', prevLetter], {
        queryParams: this.isFreeWriting ? { mode: 'writing' } : {}
      });
    }
  }

  goToNextLetter() {
    const group = this.currentLetterGroup;
    const idx = group.indexOf(this.currentLetter);
    if (idx < group.length - 1) {
      const nextLetter = group[idx + 1];
      this.router.navigate(['/trace', nextLetter], {
        queryParams: this.isFreeWriting ? { mode: 'writing' } : {}
      });
    }
  }

  get isFirstLetter(): boolean {
    const group = this.currentLetterGroup;
    return group.indexOf(this.currentLetter) === 0;
  }

  get isLastLetter(): boolean {
    const group = this.currentLetterGroup;
    return group.indexOf(this.currentLetter) === group.length - 1;
  }

  goToLetter(letter: string) {
    this.router.navigate(['/trace', letter], {
      queryParams: this.isFreeWriting ? { mode: 'writing' } : {}
    });
  }

  // Pen customization methods
  selectColor(color: string) {
    this.penColor = color;
  }

  selectWidth(width: number) {
    this.penWidth = width;
  }

  // Word / phonetic info for bottom card
  private wordMap: Record<string, { word: string; phonetic: string; sound: string }> = {
    A: { word: 'Apple',   phonetic: '/ˈæp.əl/',  sound: 'Ah-Ah-Apple'  },
    B: { word: 'Bear',    phonetic: '/bɛr/',      sound: 'Buh-Buh-Bear'  },
    C: { word: 'Cat',     phonetic: '/kæt/',      sound: 'Kuh-Kuh-Cat'   },
    D: { word: 'Dog',     phonetic: '/dɒɡ/',      sound: 'Duh-Duh-Dog'   },
    E: { word: 'Egg',     phonetic: '/ɛɡ/',       sound: 'Eh-Eh-Egg'     },
    F: { word: 'Fish',    phonetic: '/fɪʃ/',      sound: 'Fuh-Fuh-Fish'  },
    G: { word: 'Goat',    phonetic: '/ɡoʊt/',     sound: 'Guh-Guh-Goat'  },
    H: { word: 'Hat',     phonetic: '/hæt/',      sound: 'Huh-Huh-Hat'   },
    I: { word: 'Igloo',   phonetic: '/ˈɪɡ.luː/', sound: 'Ih-Ih-Igloo'  },
    J: { word: 'Jam',     phonetic: '/dʒæm/',     sound: 'Juh-Juh-Jam'   },
    K: { word: 'Kite',    phonetic: '/kaɪt/',     sound: 'Kuh-Kuh-Kite'  },
    L: { word: 'Lion',    phonetic: '/ˈlaɪ.ən/', sound: 'Luh-Luh-Lion'  },
    M: { word: 'Moon',    phonetic: '/muːn/',     sound: 'Muh-Muh-Moon'  },
    N: { word: 'Nest',    phonetic: '/nɛst/',     sound: 'Nuh-Nuh-Nest'  },
    O: { word: 'Owl',     phonetic: '/aʊl/',      sound: 'Ow-Ow-Owl'     },
    P: { word: 'Pig',     phonetic: '/pɪɡ/',      sound: 'Puh-Puh-Pig'   },
    Q: { word: 'Queen',   phonetic: '/kwiːn/',    sound: 'Kwuh-Kwuh-Queen'},
    R: { word: 'Rose',    phonetic: '/roʊz/',     sound: 'Ruh-Ruh-Rose'  },
    S: { word: 'Sun',     phonetic: '/sʌn/',      sound: 'Suh-Suh-Sun'   },
    T: { word: 'Tree',    phonetic: '/triː/',     sound: 'Tuh-Tuh-Tree'  },
    U: { word: 'Under',   phonetic: '/ˈʌn.dər/', sound: 'Uh-Uh-Under'   },
    V: { word: 'Van',     phonetic: '/væn/',      sound: 'Vuh-Vuh-Van'   },
    W: { word: 'Wolf',    phonetic: '/wʊlf/',     sound: 'Wuh-Wuh-Wolf'  },
    X: { word: 'X-Ray',   phonetic: '/ˈɛks.reɪ/',sound: 'Eks-Eks-X-Ray' },
    Y: { word: 'Yak',     phonetic: '/jæk/',      sound: 'Yuh-Yuh-Yak'   },
    Z: { word: 'Zebra',   phonetic: '/ˈziː.brə/',sound: 'Zuh-Zuh-Zebra' },
    a: { word: 'apple',   phonetic: '/ˈæp.əl/',  sound: 'Ah-Ah-Apple'   },
    b: { word: 'ball',    phonetic: '/bɔːl/',     sound: 'Buh-Buh-Ball'  },
    c: { word: 'cat',     phonetic: '/kæt/',      sound: 'Kuh-Kuh-Cat'   },
    d: { word: 'dog',     phonetic: '/dɒɡ/',      sound: 'Duh-Duh-Dog'   },
    e: { word: 'egg',     phonetic: '/ɛɡ/',       sound: 'Eh-Eh-Egg'     },
    f: { word: 'frog',    phonetic: '/frɒɡ/',     sound: 'Fuh-Fuh-Frog'  },
    g: { word: 'goat',    phonetic: '/ɡoʊt/',     sound: 'Guh-Guh-Goat'  },
    h: { word: 'hen',     phonetic: '/hɛn/',      sound: 'Huh-Huh-Hen'   },
    i: { word: 'ice',     phonetic: '/aɪs/',      sound: 'Ih-Ih-Ice'     },
    j: { word: 'jug',     phonetic: '/dʒʌɡ/',     sound: 'Juh-Juh-Jug'   },
    k: { word: 'key',     phonetic: '/kiː/',      sound: 'Kuh-Kuh-Key'   },
    l: { word: 'lamp',    phonetic: '/læmp/',     sound: 'Luh-Luh-Lamp'  },
    m: { word: 'map',     phonetic: '/mæp/',      sound: 'Muh-Muh-Map'   },
    n: { word: 'net',     phonetic: '/nɛt/',      sound: 'Nuh-Nuh-Net'   },
    o: { word: 'owl',     phonetic: '/aʊl/',      sound: 'Ow-Ow-Owl'     },
    p: { word: 'pen',     phonetic: '/pɛn/',      sound: 'Puh-Puh-Pen'   },
    q: { word: 'queen',   phonetic: '/kwiːn/',    sound: 'Kwuh-Queen'    },
    r: { word: 'rat',     phonetic: '/ræt/',      sound: 'Ruh-Ruh-Rat'   },
    s: { word: 'sun',     phonetic: '/sʌn/',      sound: 'Suh-Suh-Sun'   },
    t: { word: 'top',     phonetic: '/tɒp/',      sound: 'Tuh-Tuh-Top'   },
    u: { word: 'up',      phonetic: '/ʌp/',       sound: 'Uh-Uh-Up'      },
    v: { word: 'van',     phonetic: '/væn/',      sound: 'Vuh-Vuh-Van'   },
    w: { word: 'web',     phonetic: '/wɛb/',      sound: 'Wuh-Wuh-Web'   },
    x: { word: 'x-ray',  phonetic: '/ˈɛks.reɪ/',sound: 'Eks-X-Ray'     },
    y: { word: 'yak',     phonetic: '/jæk/',      sound: 'Yuh-Yuh-Yak'   },
    z: { word: 'zero',    phonetic: '/ˈzɪr.oʊ/', sound: 'Zuh-Zuh-Zero'  },
    '0': { word: 'Zero',  phonetic: '/ˈzɪr.oʊ/', sound: 'Zero'          },
    '1': { word: 'One',   phonetic: '/wʌn/',      sound: 'One'           },
    '2': { word: 'Two',   phonetic: '/tuː/',      sound: 'Two'           },
    '3': { word: 'Three', phonetic: '/θriː/',     sound: 'Three'         },
    '4': { word: 'Four',  phonetic: '/fɔːr/',     sound: 'Four'          },
    '5': { word: 'Five',  phonetic: '/faɪv/',     sound: 'Five'          },
    '6': { word: 'Six',   phonetic: '/sɪks/',     sound: 'Six'           },
    '7': { word: 'Seven', phonetic: '/ˈsɛv.ən/', sound: 'Seven'         },
    '8': { word: 'Eight', phonetic: '/eɪt/',      sound: 'Eight'         },
    '9': { word: 'Nine',  phonetic: '/naɪn/',     sound: 'Nine'          },
  };

  getWordInfo() {
    return this.wordMap[this.currentLetter] || { word: this.currentLetter, phonetic: '', sound: '' };
  }

  getWordFirst(): string {
    const w = this.getWordInfo().word;
    return w.charAt(0);
  }

  getWordRest(): string {
    const w = this.getWordInfo().word;
    return w.slice(1);
  }

  getPhonetic(): string {
    return this.getWordInfo().phonetic;
  }

  getSoundText(): string {
    return '"' + this.getWordInfo().sound + '"';
  }

  get starScore(): number {
    return this.completedStrokes.filter(Boolean).length * 4;
  }

  private funFactMap: Record<string, string> = {
    A: 'A is the 1st letter & most used vowel in English!',
    B: 'B makes a soft "buh" sound, like a bouncing ball!',
    C: 'C can sound like "k" in cat or "s" in city!',
    D: 'D is for dance — feel the rhythm when you write it!',
    E: 'E is the most used letter in English!',
    F: 'F sounds like air rushing through your teeth!',
    G: 'G can be hard like "go" or soft like "gem"!',
    H: 'H is a silent helper in words like "ghost"!',
    I: 'I is a vowel that can be long or short!',
    J: 'J makes the "juh" sound, like jumping for joy!',
    K: 'K is often silent before N, like in "knee"!',
    L: 'L flows smoothly — your tongue touches the top!',
    M: 'M hums! Try saying "mmm" — that\'s the M sound!',
    N: 'N is a nasal sound — air goes through your nose!',
    O: 'O is a round letter that makes a round sound!',
    P: 'P is a "popping" sound made with both lips!',
    Q: 'Q almost always needs a U beside it!',
    R: 'R is tricky — it\'s called a "rhotic" sound!',
    S: 'S makes a hissing sound, like a sneaky snake!',
    T: 'T is one of the most common letters in English!',
    U: 'U is a vowel with both long and short sounds!',
    V: 'V vibrates! Touch your throat and say "vvv"!',
    W: 'W is called "double-u" — two U\'s together!',
    X: 'X can sound like "ks" or even "z" in xylophone!',
    Y: 'Y can be a vowel too, like in "gym" or "baby"!',
    Z: 'Z is the last letter — the end of the alphabet!',
    a: 'Lowercase a is one of the trickiest letters to write!',
    b: 'Watch out — b and d look similar but are different!',
    c: 'C is like a circle that didn\'t quite close up!',
    d: 'D is like a b but facing the other way!',
    e: 'Lowercase e starts from the middle — try it!',
    f: 'F has a cross — don\'t forget that little line!',
    g: 'Lowercase g has a tail that drops below the line!',
    h: 'H starts tall and then dips down like a hill!',
    i: 'Don\'t forget the dot on the i!',
    j: 'J also gets a dot — and a curly tail!',
    k: 'K has two diagonal strokes — like kicking legs!',
    l: 'L is the simplest — just one tall straight line!',
    m: 'M has two humps — like a camel!',
    n: 'N has just one hump — like a hill!',
    o: 'O is a perfect circle — can you draw it?',
    p: 'P has a tail that drops below the line!',
    q: 'Q also drops below — with a tail on the right!',
    r: 'Lowercase r is like a tiny bump!',
    s: 'S curves twice — one up, one down!',
    t: 'T is a tall stick with a little cross!',
    u: 'U is like a little cup that holds water!',
    v: 'V is a sharp dip down and back up!',
    w: 'W is like two V\'s joined together!',
    x: 'X is two lines crossing in the middle!',
    y: 'Y drops its tail below the line!',
    z: 'Z uses three strokes — top, diagonal, bottom!',
    '0': 'Zero was invented in ancient India!',
    '1': 'One is the only number that divides everything!',
    '2': 'Two is the only even prime number!',
    '3': 'Three sides make a triangle — a strong shape!',
    '4': 'Four seasons, four directions — 4 is everywhere!',
    '5': 'High five! 5 fingers on each hand!',
    '6': 'Six is a perfect number in mathematics!',
    '7': 'Lucky 7 is the most popular favorite number!',
    '8': 'Eight looks like the infinity sign on its side!',
    '9': 'Nine is 3 × 3 — the square of three!',
  };

  getFunFact(): string {
    return this.funFactMap[this.currentLetter] || 'Keep practising — you\'re doing great!';
  }

  getLetterPosition(): string {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const nums  = '0123456789';
    const ui = upper.indexOf(this.currentLetter);
    if (ui !== -1) return `Letter ${ui + 1} of 26`;
    const li = lower.indexOf(this.currentLetter);
    if (li !== -1) return `Letter ${li + 1} of 26`;
    const ni = nums.indexOf(this.currentLetter);
    if (ni !== -1) return `Number ${ni} of 0–9`;
    return '';
  }

  getStrokeCount(): number {
    const letter = this.currentLetter;
    const paths = (this as any).letterPaths as { [key: string]: LetterPath };
    return paths[letter]?.strokes?.length ?? 0;
  }

  getCompletedStrokeCount(): number {
    return this.completedStrokes.filter(Boolean).length;
  }

  getNextLetter(): string {
    const group = this.currentLetterGroup;
    const idx = group.indexOf(this.currentLetter);
    return idx < group.length - 1 ? group[idx + 1] : '';
  }

  getEncouragement(): string {
    if (this.traceProgress === 0) return 'Start tracing! You can do it! 🚀';
    if (this.traceProgress < 30) return 'Great start! Keep going! 💪';
    if (this.traceProgress < 60) return 'Halfway there! Looking good! ⭐';
    if (this.traceProgress < 90) return 'Almost done! Stay focused! 🎯';
    return 'Amazing! You nailed it! 🎉';
  }
}
