import {
  Component
} from '@angular/core';

export interface CoreValue {
  id: number;
  title: string;
  description: string;
}

@Component({
  selector: 'app-core-values',
  standalone: true,
  imports: [],
  templateUrl: './core-values.html',
  styleUrl: './core-values.scss'
})
export class CoreValues {

  readonly values: CoreValue[] = [
    {
      id: 1,
      title: 'Knowledge',
      description:
        'We believe information should be accurate, curated, and accessible to all.'
    },
    {
      id: 2,
      title: 'Innovation',
      description:
        'Pushing the boundaries of what a digital library can provide to users.'
    },
    {
      id: 3,
      title: 'Community',
      description:
        'The soul of HiveMinds is the connection between those who write and those who read.'
    },
    {
      id: 4,
      title: 'Accessibility',
      description:
        'A commitment to universal design, ensuring everyone can participate in literature.'
    }
  ];
}
