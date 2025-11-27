import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email = '';
  password = '';
  errorMessage = '';
  registerMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.errorMessage = '';
    this.registerMessage = '';

    this.authService.login(this.email, this.password)
      .subscribe({
        next: (res) => {
          this.authService.saveToken(res.token);
          this.router.navigate(['/tasks']);
        },
        error: () => {
          this.errorMessage = 'Credenciais inválidas.';
        }
      });
  }

  onRegister() {
    this.errorMessage = '';
    this.registerMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Preenche email e password para registar.';
      return;
    }

    this.authService.register(this.email, this.password)
      .subscribe({
        next: () => {
          this.registerMessage = 'Conta criada com sucesso. Já podes fazer login.';
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Erro ao registar utilizador.';
        }
      });
  }
}