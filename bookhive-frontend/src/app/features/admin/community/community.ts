import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideUsers } from '@lucide/angular';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [RouterLink, LucideUsers],
  templateUrl: './community.html',
  styleUrl: './community.scss',
})
export class Community {}
