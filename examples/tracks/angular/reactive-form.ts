// Formularios reactivos (Módulo 5): validación síncrona, asíncrona y estado del formulario.
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

// Validador personalizado: las contraseñas deben coincidir. Angular reactive forms
// no tiene un validador "confirmar contraseña" incorporado, así que se compone uno
// a nivel de grupo (no de campo individual), porque necesita leer dos controles.
function contraseñasCoincidenValidator(grupo: AbstractControl): ValidationErrors | null {
  const clave = grupo.get('clave')?.value;
  const confirmacion = grupo.get('confirmacion')?.value;
  return clave === confirmacion ? null : { contraseñasNoCoinciden: true };
}

@Component({
  selector: 'app-registro-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="enviar()">
      <input formControlName="email" type="email" placeholder="Email" />
      @if (form.get('email')?.invalid && form.get('email')?.touched) {
        <p>Email inválido.</p>
      }

      <input formControlName="clave" type="password" placeholder="Contraseña" />
      <input formControlName="confirmacion" type="password" placeholder="Confirmar contraseña" />
      @if (form.hasError('contraseñasNoCoinciden') && form.get('confirmacion')?.touched) {
        <p>Las contraseñas no coinciden.</p>
      }

      <button [disabled]="form.invalid">Registrarse</button>
    </form>
  `,
})
export class RegistroFormComponent {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      clave: ['', [Validators.required, Validators.minLength(8)]],
      confirmacion: ['', Validators.required],
    },
    { validators: contraseñasCoincidenValidator }
  );

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log('Formulario válido:', this.form.value);
  }
}
