import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl  } from '@angular/forms';
import { BaseService } from '../../../../core/services/baseService/base-service.service';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../../environments/environmentDev';
import { Router, RouterModule } from '@angular/router';
import { LocalStorageService } from '../../../../core/services/localStorage/local-storage.service';

@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  registrationForm: FormGroup;
  loading = false;
  constructor(private fb: FormBuilder, private baseService: BaseService, private messageService: MessageService, private router: Router,  private localStorageService: LocalStorageService) {
    this.registrationForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },{
      validators: this.passwordsMatchValidator
    });
  }

  ngOnInit() {
    if (this.localStorageService.getToken()) {
      const token = this.localStorageService.decodeToken(this.localStorageService.getToken()!);
      if (token.role === 'admin') {
        this.router.navigate(['admin/home']);
      }
      else if(token.role === 'amazone'){
        this.router.navigate(['amazone/home']);
      }
    }
  }

  passwordsMatchValidator(control: AbstractControl) {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordsMismatch: true });
    } else {
      control.get('confirmPassword')?.setErrors(null);
    }
  }
  onSubmit() {
    this.loading = true;
    if (this.registrationForm.valid) {
      this.baseService.postWithoutToken(`${environment.endPoint.register}`,this.registrationForm.value).subscribe(
        (response) => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: ' Inscription reussie \n Vous serez rediriger sur la page de connexion' });
          this.registrationForm.reset();
          this.router.navigate(['']);
          this.loading = false;
        },
        (error) => {

          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Echec de l\'inscription' });
          this.loading = false;
        }
      )
    }
  }
}
