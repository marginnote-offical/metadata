import { CellViewType } from "~/enum"
import { defineConfig } from "~/profile"
import { doc } from "~/utils"
import { lang } from "./lang"

export default defineConfig({
  name: "MagicAction",
  key: "magicaction",
  intro: lang.intro,
  settings: [],
  actions4card: [
    {
      key: "manageProfile",
      type: CellViewType.Button,
      label: lang.manage_profile.label,
      option: lang.manage_profile.$option4,
      help: lang.manage_profile.help,
      method: () => {
        console.log()
      }
    }
  ]
})
