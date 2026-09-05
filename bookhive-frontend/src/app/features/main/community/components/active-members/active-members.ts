import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

export interface ActiveMember {
  id: number;
  name: string;
  booksRead: number;
  image: string;
  following: boolean;
}

@Component({
  selector: 'app-active-members',
  standalone: true,
  imports: [],
  templateUrl: './active-members.html',
  styleUrl: './active-members.scss'
})
export class ActiveMembers {

  @Output()
  readonly followChanged =
    new EventEmitter<ActiveMember>();

  readonly members:
    ActiveMember[] = [
    {
      id: 1,
      name: 'Dr. Nimal S.',
      booksRead: 42,
      image:
        '/images/community/members/nimal.jpg',
      following: false
    },
    {
      id: 2,
      name: 'Inoka W.',
      booksRead: 28,
      image:
        '/images/community/members/inoka.jpg',
      following: false
    },
    {
      id: 3,
      name: 'Sahan Perera',
      booksRead: 15,
      image:
        '/images/community/members/sahan.jpg',
      following: false
    },
    {
      id: 4,
      name: 'Menaka K.',
      booksRead: 31,
      image:
        '/images/community/members/menaka.jpg',
      following: false
    }
  ];

  toggleFollow(
    member: ActiveMember
  ): void {
    member.following =
      !member.following;

    this.followChanged.emit(member);
  }
}
