import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideMessageSquare, LucideFlag, LucideUsers, LucideSearch } from '@lucide/angular';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [RouterLink, LucideMessageSquare, LucideFlag, LucideUsers, LucideSearch],
  templateUrl: './community.html',
  styleUrl: './community.scss',
})
export class Community {}
