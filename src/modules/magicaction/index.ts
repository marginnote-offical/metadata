import { CellViewType } from "~/typings"
import { defineConfig } from "~/profile"
import { lang } from "./lang"

export default defineConfig({
  name: "MagicAction",
  key: "magicaction",
  intro: lang.intro,
  settings: [],
  actions: [
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
