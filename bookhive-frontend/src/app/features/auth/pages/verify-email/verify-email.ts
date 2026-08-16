import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  LucideArrowLeft,
  LucideCheck,
  LucideInfo,
  LucideMail,
  LucideRefreshCw,
} from '@lucide/angular';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.html',
  imports: [RouterLink, LucideArrowLeft, LucideCheck, LucideInfo, LucideMail, LucideRefreshCw],
  styleUrl: './verify-email.scss',
})
export class VerifyEmail {
  readonly logoPath = 'assets/bookhive-logo.png';
  email = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? 'user@example.com';
  }

  resendEmail(): void {
    console.log('Verification email resent');
  }
}
