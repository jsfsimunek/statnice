export const SUBJECTS = [
  {
    slug: 'geografie',
    name: 'Geografie',
    shortName: 'Geo',
    topicCount: 19,
    staticDataPrefix: 'okruh',
  },
  {
    slug: 'obcanska-vychova',
    name: 'Občanská výchova',
    shortName: 'OV',
    topicCount: 0,
    staticDataPrefix: null,
  },
]

export function getSubject(slug) {
  return SUBJECTS.find(subject => subject.slug === slug) ?? SUBJECTS[0]
}
