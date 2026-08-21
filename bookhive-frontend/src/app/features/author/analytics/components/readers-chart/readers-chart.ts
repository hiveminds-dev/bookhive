import {
  Component
} from '@angular/core';

export interface MonthlyDownload {
  month: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-readers-chart',
  standalone: true,
  imports: [],
  templateUrl: './readers-chart.html',
  styleUrl: './readers-chart.scss'
})
export class ReadersChartComponent {

  readonly monthlyDownloads:
    MonthlyDownload[] = [
    {
      month: 'Jan',
      value: 32,
      color: '#ded8c5'
    },
    {
      month: 'Feb',
      value: 45,
      color: '#d2c9a7'
    },
    {
      month: 'Mar',
      value: 61,
      color: '#c3b88c'
    },
    {
      month: 'Apr',
      value: 55,
      color: '#b1a267'
    },
    {
      month: 'May',
      value: 79,
      color: '#968333'
    },
    {
      month: 'Jun',
      value: 92,
      color: '#806900'
    }
  ];

  get maximumValue(): number {
    return Math.max(
      ...this.monthlyDownloads.map(
        item => item.value
      ),
      1
    );
  }

  getBarHeight(value: number): number {
    return (
      value /
      this.maximumValue
    ) * 100;
  }
}
