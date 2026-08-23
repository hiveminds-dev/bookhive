import {
  Component
} from '@angular/core';

export interface MissionItem {
  id: number;
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-our-mission',
  standalone: true,
  imports: [],
  templateUrl: './our-mission.html',
  styleUrl: './our-mission.scss'
})
export class OurMission {

  readonly missionItems: MissionItem[] = [
    {
      id: 1,
      icon: '▣',
      title: 'Read',
      description:
        'Curating a world-class selection of literature and research for the modern scholar.'
    },
    {
      id: 2,
      icon: '≡',
      title: 'Publish',
      description:
        'Empowering creators with powerful, intuitive tools to share their stories globally.'
    },
    {
      id: 3,
      icon: '♙',
      title: 'Connect',
      description:
        'Building a vibrant ecosystem where readers and authors engage in meaningful dialogue.'
    }
  ];
}
