import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  AuthorStatistic,
  StatisticsComponent
} from './statistics';

describe('StatisticsComponent', () => {
  let component: StatisticsComponent;
  let fixture: ComponentFixture<StatisticsComponent>;

  const testStatistics: AuthorStatistic[] = [
    {
      id: 1,
      label: 'Total Books',
      value: '12',
      icon: '▤',
      indicator: '↗ +2',
      tone: 'gold'
    },
    {
      id: 2,
      label: 'Published Books',
      value: '8',
      icon: '✺',
      indicator: '◎ Stable',
      tone: 'green'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(
      StatisticsComponent
    );

    component = fixture.componentInstance;
    component.statistics = testStatistics;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should receive statistics', () => {
    expect(component.statistics.length).toBe(2);
  });

  it('should contain the total books value', () => {
    expect(component.statistics[0].value).toBe('12');
  });
});
