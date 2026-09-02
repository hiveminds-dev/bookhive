import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './community.html',
  styleUrl: './community.scss',
})
export class Community {}
