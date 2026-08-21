import {
  Component
} from '@angular/core';

export interface MonthlyView {
  month: string;
  value: number;
}

@Component({
  selector: 'app-views-chart',
  standalone: true,
  imports: [],
  templateUrl: './views-chart.html',
  styleUrl: './views-chart.scss'
})
export class ViewsChartComponent {

  readonly monthlyViews: MonthlyView[] = [
    {
      month: 'Jan',
      value: 12
    },
    {
      month: 'Feb',
      value: 28
    },
    {
      month: 'Mar',
      value: 41
    },
    {
      month: 'Apr',
      value: 58
    },
    {
      month: 'May',
      value: 82
    },
    {
      month: 'Jun',
      value: 112
    }
  ];

  readonly chartWidth = 500;

  readonly chartHeight = 240;

  readonly horizontalPadding = 30;

  readonly verticalPadding = 25;

  get maximumValue(): number {
    return Math.max(
      ...this.monthlyViews.map(
        item => item.value
      ),
      1
    );
  }

  get chartPoints(): string {
    const availableWidth =
      this.chartWidth -
      (this.horizontalPadding * 2);

    const availableHeight =
      this.chartHeight -
      (this.verticalPadding * 2);

    const lastIndex =
      Math.max(
        this.monthlyViews.length - 1,
        1
      );

    return this.monthlyViews
      .map((item, index) => {
        const x =
          this.horizontalPadding +
          (
            index *
            availableWidth /
            lastIndex
          );

        const y =
          this.chartHeight -
          this.verticalPadding -
          (
            item.value /
            this.maximumValue *
            availableHeight
          );

        return `${x},${y}`;
      })
      .join(' ');
  }

  get areaPoints(): string {
    const bottom =
      this.chartHeight -
      this.verticalPadding;

    const firstX = this.horizontalPadding;

    const lastX =
      this.chartWidth -
      this.horizontalPadding;

    return [
      `${firstX},${bottom}`,
      this.chartPoints,
      `${lastX},${bottom}`
    ].join(' ');
  }

  getPointX(index: number): number {
    const availableWidth =
      this.chartWidth -
      (this.horizontalPadding * 2);

    const lastIndex =
      Math.max(
        this.monthlyViews.length - 1,
        1
      );

    return (
      this.horizontalPadding +
      (
        index *
        availableWidth /
        lastIndex
      )
    );
  }

  getPointY(value: number): number {
    const availableHeight =
      this.chartHeight -
      (this.verticalPadding * 2);

    return (
      this.chartHeight -
      this.verticalPadding -
      (
        value /
        this.maximumValue *
        availableHeight
      )
    );
  }

  exportCsv(): void {
    const csvRows = [
      'Month,Views',
      ...this.monthlyViews.map(
        item =>
          `${item.month},${item.value}`
      )
    ];

    const csvContent =
      csvRows.join('\n');

    const blob = new Blob(
      [csvContent],
      {
        type:
          'text/csv;charset=utf-8;'
      }
    );

    const downloadUrl =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement('a');

    anchor.href = downloadUrl;
    anchor.download =
      'bookhive-monthly-views.csv';

    anchor.click();

    URL.revokeObjectURL(downloadUrl);
  }
}
