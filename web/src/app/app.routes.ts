import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./study/study-page').then(m => m.StudyPageComponent),
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./catalog/course-catalog').then(m => m.CourseCatalogComponent),
  },
  {
    path: 'laboratorio/floci',
    loadComponent: () => import('./cloud/cloud-classic').then(m => m.CloudClassicComponent),
  },
  {
    path: 'curso/:trackId',
    loadComponent: () => import('./course/course-shell').then(m => m.CourseShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: '0' },
      { path: ':moduleId', loadComponent: () => import('./course/lesson-viewer').then(m => m.LessonViewerComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
