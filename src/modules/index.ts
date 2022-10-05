import magicaction from "./magicaction"
import zotero from "./zotero"
import addon from "./addon"
import { CellViewType } from "~/enum"
import { ISection } from "~/typings"
import lang from "~/lang"

export const modules = { zotero }

export const constModules = { addon, magicaction }

export const more: ISection = {
  header: "More",
  key: "more",
  rows: [
    {
      type: CellViewType.PlainText,
      label: "本插件为 OhMyMN 系列插件。",
      link: "https://ohmymn.marginnote.cn"
    },
    {
      type: CellViewType.PlainText,
      label: lang.more.website,
      link: "https://ohmymn.marginnote.cn"
    },
    {
      type: CellViewType.PlainText,
      label: lang.more.core_team,
      link: "https://github.com/marginnoteapp/ohmymn"
    },
    {
      type: CellViewType.PlainText,
      label: lang.more.intro,
      link: "https://github.com/marginnoteapp/ohmymn"
    },
    {
      type: CellViewType.PlainText,
      label: "\n\n\n\n\n\n\n\n\n\n",
      link: ""
    }
  ]
}
