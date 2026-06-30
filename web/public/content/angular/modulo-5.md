## Reactive Forms

```ts
form = new FormGroup({
  nombre: new FormControl('', [Validators.required]),
  email: new FormControl('', [Validators.required, Validators.email]),
});
```

```html
<input [formControl]="form.controls.email" />
@if (form.controls.email.errors?.['email']) {
  <span class="error">Email inválido</span>
}
```

## Validadores asíncronos

```ts
function emailDisponibleValidator(servicio: UsuariosService): AsyncValidatorFn {
  return (control) => servicio.emailExiste(control.value).pipe(
    map(existe => existe ? { emailOcupado: true } : null)
  );
}

new FormControl('', { asyncValidators: [emailDisponibleValidator(servicio)] });
```

## FormArray dinámico

```ts
form = new FormGroup({
  telefonos: new FormArray([new FormControl('')]),
});

agregarTelefono() {
  (this.form.controls.telefonos as FormArray).push(new FormControl(''));
}
```

## Template-driven: cuándo sigue siendo válido

Para formularios muy simples (un solo campo de búsqueda, un toggle) `ngModel` puede ser más rápido de escribir. Para cualquier cosa con validación cruzada entre campos, arrays dinámicos o testing serio, Reactive Forms es la opción más predecible.
