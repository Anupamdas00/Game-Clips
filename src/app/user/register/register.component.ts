import { Component } from '@angular/core';
import {  FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service'
import { EmailTaken } from '../validators/email-taken';
import { RegisterValidators } from '../validators/register-validators';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  name = new FormControl('', [Validators.required, Validators.minLength(3)]);
  email = new FormControl('', [Validators.required, Validators.email]);
  age = new FormControl('', [Validators.min(18), Validators.max(120)]);
  password = new FormControl('', [
    Validators.required,
    Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
  ]);
  confirm_password = new FormControl('', [Validators.required]);
  phoneNumber = new FormControl('', [
    Validators.required,
    Validators.minLength(15),
    Validators.maxLength(15),
  ]);

  inSubmition = false

  showAlert = false;
  alertmsg = 'Please wait, Account is being created!.';
  alertColor = 'blue';

  constructor(private auth: AuthService, private emailTaken: EmailTaken ) {}

  registerForm = new FormGroup({
    name: this.name,
    email: this.email,
    age: this.age,
    password: this.password,
    confirm_password: this.confirm_password,
    phoneNumber: this.phoneNumber,
  }, [RegisterValidators.match('password', 'confirm_passeword')], [this.emailTaken.validate]);

  async register() {
    this.showAlert = true;
    this.alertmsg = 'Please wait, Account is being created!.';
    this.alertColor = 'blue';
    this.inSubmition = true;

    const { email, password } = this.registerForm.value;

    try{
      await this.auth.createUser(this.registerForm.value)
      }
    catch(e){
      console.log(e);

      this.alertmsg = "Unexpected error occured! Please try again later."
      this.alertColor = 'red';
      this.inSubmition = false;

      return   
    }
    this.alertmsg = "Success! Your account has been created."
    this.alertColor = 'green'
  }
}
