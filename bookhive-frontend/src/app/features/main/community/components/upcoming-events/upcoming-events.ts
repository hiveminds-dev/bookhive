import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

export interface CommunityEvent {
  id: number;
  title: string;
  host: string;
  date: string;
  time: string;
  location: string;
  image: string;
  buttonText: string;
  featured: boolean;
}

@Component({
  selector: 'app-upcoming-events',
  standalone: true,
  imports: [],
  templateUrl: './upcoming-events.html',
  styleUrl: './upcoming-events.scss'
})
export class UpcomingEvents {

  @Output()
  readonly eventSelected =
    new EventEmitter<CommunityEvent>();

  readonly events:
    CommunityEvent[] = [
    {
      id: 1,
      title:
        'Sunday Classics Soirée',
      host:
        'The Old Library Club',
      date:
        'May 12',
      time:
        '4:00 PM',
      location:
        'Colombo 07',
      image:
        '/images/community/sunday-classics.png',
      buttonText:
        'Join Event',
      featured: true
    },
    {
      id: 2,
      title:
        'Tech Read Meetup: Web3',
      host:
        'DevReads LK',
      date:
        'May 15',
      time:
        '6:30 PM',
      location:
        'Zoom Online',
      image:
        '/images/community/tech-read-meetup.png',
      buttonText:
        'Register Now',
      featured: false
    }
  ];

  selectEvent(
    event: CommunityEvent
  ): void {
    this.eventSelected.emit(event);
  }
}
