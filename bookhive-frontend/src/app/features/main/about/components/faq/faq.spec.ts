import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  Faq
} from './faq';

describe(
  'Faq',
  () => {

    let component: Faq;

    let fixture:
      ComponentFixture<Faq>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [
          Faq
        ]
      }).compileComponents();

      fixture =
        TestBed.createComponent(Faq);

      component = fixture.componentInstance;

      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it(
      'should contain three questions',
      () => {
        expect(component.questions.length)
          .toBe(3);
      }
    );

    it(
      'should open selected question',
      () => {
        const question =
          component.questions[0];

        component.toggleQuestion(question);

        expect(
          component.questions[0].isOpen
        ).toBe(true);
      }
    );
  }
);
