import { Addon } from "~/addon"
import { MN } from "~/sdk"
import { CellViewType } from "~/enum"
import { defineConfig } from "~/profile"
import { lang } from "./lang"

const { label, help, option } = lang
export default defineConfig({
  name: Addon.title,
  key: "addon",
  link: lang.link,
  intro: lang.intro + Addon.version,
  settings: [
    {
      help: help.profile,
      key: "profile",
      type: CellViewType.Select,
      option: option.profile,
      label: label.profile
    },
    {
      key: "panelPosition",
      type: CellViewType.Select,
      option: option.panel_position,
      label: label.panel_position
    },
    {
      key: "panelHeight",
      type: CellViewType.Select,
      option: option.panel_height,
      label: label.panel_height
    },
    {
      key: "panelControl",
      type: CellViewType.MuiltSelect,
      option: option.panle_control,
      label: label.panle_control
    },
    {
      key: "autoBackup",
      type: CellViewType.Switch,
      label: label.auto_backup
    },
    {
      key: "backupID",
      type: CellViewType.Input,
      help: "输入备份卡片链接，请确保该卡片有子卡片，否则无法写入。子卡片越多越好。",
      bind: ["autoBackup", true],
      check: ({ input }) => {
        const noteid = input.replace("marginnote3app://note/", "")
        if (noteid === input) throw "不是卡片链接"
        const node = MN.db.getNoteById(noteid)
        if (!node) throw "卡片不存在"
        if (!node.childNotes?.length) throw "卡片没有子卡片"
      }
    }
  ]
})
