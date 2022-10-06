export interface ReturnData {
  key: string
  version: number
  links: {
    alternate: {
      href: string
      type: string
    }
  }
  data: Metadata
}

export interface Metadata {
  key: string
  version: number
  itemType: string
  title: string
  creators: {
    lastName?: string
    firstName?: string
    creatorType: string
    name?: string
  }[]
  abstractNote: string
  publicationTitle: string
  volume: string
  issue: string
  pages: string
  date: string
  series: string
  seriesTitle: string
  seriesText: string
  journalAbbreviation: string
  language: string
  DOI: string
  ISSN: string
  shortTitle: string
  url: string
  accessDate: string
  archive: string
  archiveLocation: string
  libraryCatalog: string
  callNumber: string
  rights: string
  extra: string
  tags: {
    tag: string
    type: number
  }[]
  collections: any[]
  dateAdded: string
  dateModified: string
}
