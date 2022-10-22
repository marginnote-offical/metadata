import { Addon } from "~/addon"
import { ISection, CellViewType } from "~/typings"
import lang from "./lang"

export const more: ISection = {
  header: "More",
  key: "more",
  rows: [
    {
      type: CellViewType.PlainText,
      label: lang.intro_metadata,
      link: "https://github.com/marginnoteapp/metadata"
    },
    {
      type: CellViewType.PlainText,
      label: lang.website,
      link: Addon.doc
    },
    {
      type: CellViewType.PlainText,
      label: lang.core_team,
      link: Addon.github
    },
    {
      type: CellViewType.PlainText,
      label: lang.intro,
      link: Addon.github
    },
    {
      type: CellViewType.PlainText,
      label: "\n\n\n\n\n\n\n\n\n\n",
      link: ""
    }
  ]
}
