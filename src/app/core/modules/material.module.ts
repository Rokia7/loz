import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';

const MODULES = [
  MatButtonModule,
  MatDialogModule,
  MatFormFieldModule,
  MatRippleModule,
  MatSelectModule,
  MatSnackBarModule,
  MatTooltipModule,
  MatTreeModule,
];

@NgModule({
  imports: [
    ...MODULES,
  ],
  exports: [
    ...MODULES,
  ]
})
export class MaterialComponentsModule {	}
