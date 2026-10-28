// All personal content lives here. Replace every [BRACKETED] value.
import portrait from '../assets/placeholder-portrait.png'; // swap for your own portrait

export const site = {
  name: '[YOUR NAME]',
  initials: '[YN]',
  city: '[CITY]',
  year: '[YEAR]',
  mascotName: '[MASCOT NAME]',
  title: '[YOUR NAME], web app developer',
  description: '[One-sentence description for search and sharing.]',
  email: '[you@email.com]',
  github: 'https://github.com/[username]',
  linkedin: 'https://www.linkedin.com/in/[username]',
  cv: '/cv.pdf',
  nav: [
    { label: 'Start', href: '#start' },
    { label: 'Tales', href: '#tales' },
    { label: 'The teller', href: '#teller' },
    { label: 'Send a raven', href: '#raven' },
  ],
  hero: {
    eyebrow: 'Once upon a time',
    hint: 'Drag to turn it. Click a face.',
    tagline: 'I build web apps you can step into, poke at and play with.',
  },
  lantern: [
    { label: 'Tales', href: '#tales' },
    { label: 'Teller', href: '#teller' },
    { label: 'CV', href: '/cv.pdf', download: true },
    { label: 'Raven', href: '#raven' },
  ],
  tales: { eyebrow: 'Chapter one', title: 'Tales', intro: '[One line about selected work.]' },
  teller: {
    eyebrow: 'Chapter two',
    title: 'The teller',
    portrait,
    portraitAlt: '[Portrait of YOUR NAME]',
    bio: ['[Short bio, paragraph one.]', '[Short bio, paragraph two.]'],
    facts: [
      { label: 'Off the clock', value: '[Your answer]' },
      { label: 'Cannot work without', value: '[Your answer]' },
      { label: 'Next up', value: '[Your answer]' },
    ],
  },
  raven: {
    eyebrow: 'Epilogue',
    title: 'Send a raven',
    line: '[One line on what you are open to.]',
  },
  mascot: {
    start: ['Welcome. I\'m [MASCOT NAME], and I\'ll guide you through.', 'Drag the lantern to turn it. Each face opens a chapter.'],
    tales: ['These are [YOUR NAME]\'s web apps, told as short tales.', 'Each tale opens a full case study.'],
    teller: ['Here is the teller behind the tales.', 'Three small facts sit at the bottom.'],
    raven: ['The last page. The gold button is the email.', 'The CV is the third button.'],
  },
};
