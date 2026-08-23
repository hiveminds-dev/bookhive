import {
  Component,
  EventEmitter,
  Output
} from '@angular/core';

export interface CommunityDiscussion {
  id: number;
  author: string;
  initials: string;
  timeAgo: string;
  tag: string;
  title: string;
  description: string;
  likes: number;
  comments: number;
}

@Component({
  selector: 'app-trending-discussions',
  standalone: true,
  imports: [],
  templateUrl: './trending-discussions.html',
  styleUrl: './trending-discussions.scss'
})
export class TrendingDiscussions {

  @Output()
  readonly threadSelected =
    new EventEmitter<CommunityDiscussion>();

  @Output()
  readonly discussionLiked =
    new EventEmitter<CommunityDiscussion>();

  readonly discussions:
    CommunityDiscussion[] = [
    {
      id: 1,
      author: 'Amali Perera',
      initials: 'AP',
      timeAgo: '2 hours ago',
      tag: '#SinhalaLiterature',
      title:
        "Why 'Madol Doova' still resonates with modern Sri Lankan youth?",
      description:
        "Martin Wickramasinghe's masterpiece isn't just about childhood adventure; it's a profound look into the social fabric of rural Ceylon.",
      likes: 142,
      comments: 38
    },
    {
      id: 2,
      author: 'Kasun Jayawardena',
      initials: 'KJ',
      timeAgo: '5 hours ago',
      tag: '#TechTrends',
      title:
        'Is AI-assisted writing the end of authentic storytelling?',
      description:
        "With the rise of LLMs, I'm finding it harder to distinguish between human creativity and machine-generated plots. Let's talk about the soul of fiction.",
      likes: 89,
      comments: 56
    }
  ];

  viewThread(
    discussion: CommunityDiscussion
  ): void {
    this.threadSelected.emit(
      discussion
    );
  }

  likeDiscussion(
    discussion: CommunityDiscussion
  ): void {
    discussion.likes += 1;

    this.discussionLiked.emit(
      discussion
    );
  }
}
