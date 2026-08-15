import { Component } from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.html',
  imports: [
    RouterLink
  ],
  styleUrl: './verify-email.scss'
})
export class VerifyEmail {

  email = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? 'user@example.com';
  }

  resendEmail(): void {
    console.log('Verification email resent');
  }
}
