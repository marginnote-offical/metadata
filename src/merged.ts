import lang from "./JSExtension/lang"
import { showHUD } from "marginnote"
import { requiredModules } from "./modules"
import { ICheckMethod, IActionMethod } from "./typings"
import { IAllProfile } from "./profile"
export type ModuleKeyType = Exclude<keyof IAllProfile, "additional">
export type DataSourceSection = ModuleKeyType | "more"

export const { actions, checkers } = Object.values(requiredModules).reduce(
  (acc, module) => {
    module.settings.length &&
      module.settings.forEach(k => {
        if ("check" in k) {
          acc.checkers[k.key] = k["check"]!
        }
      })
    module.actions?.length &&
      module.actions.forEach(k => {
        acc.actions[k.key] = k.method
        if ("check" in k) {
          acc.checkers[k.key] = k["check"]!
        }
      })
    return acc
  },
  {
    actions: {} as Record<string, IActionMethod>,
    checkers: {} as Record<string, ICheckMethod>
  }
)

export async function checkInputCorrect(
  input: string,
  key: string
): Promise<boolean> {
  try {
    if (checkers[key]) {
      await checkers[key]({ input })
    }
  } catch (err) {
    showHUD(err ? String(err) : lang.input_error, 3)
    return false
  }
  return true
}
