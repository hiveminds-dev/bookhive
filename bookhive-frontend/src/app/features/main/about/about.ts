import {
  Component
} from '@angular/core';

import {
  Hero
} from './components/hero/hero';

import {
  OurStory
} from './components/our-story/our-story';

import {
  OurMission
} from './components/our-mission/our-mission';

import {
  WhyBookhive
} from './components/why-bookhive/why-bookhive';

import {
  Statistics
} from './components/statistics/statistics';

import {
  CoreValues
} from './components/core-values/core-values';

import {
  Faq
} from './components/faq/faq';

import {
  Cta
} from './components/cta/cta';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    Hero,
    OurStory,
    OurMission,
    WhyBookhive,
    Statistics,
    CoreValues,
    Faq,
    Cta
  ],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {
}
