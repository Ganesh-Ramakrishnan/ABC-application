import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { LetterSelectionComponent } from './components/letter-selection/letter-selection';
import { TracingCanvasComponent } from './components/tracing-canvas/tracing-canvas';
import { ProgressComponent } from './components/progress/progress';
import { SettingsComponent } from './components/settings/settings';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'letters', component: LetterSelectionComponent },
  { path: 'trace/:letter', component: TracingCanvasComponent },
  { path: 'progress', component: ProgressComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '' }
];
