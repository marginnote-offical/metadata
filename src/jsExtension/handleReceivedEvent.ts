import { Addon } from "~/addon"
import { layoutViewController } from "~/jsExtension/switchPanel"
import lang from "~/lang"
import { EventHandler } from "~/typings"
import { saveProfile } from "~/profile"
import { eventHandlerController, isThisWindow, showHUD } from "~/sdk"
import handleMagicAction from "./magicActionHandler"

export const eventHandlers = eventHandlerController(
  [
    Addon.key + "InputOver",
    Addon.key + "ButtonClick",
    Addon.key + "SelectChange",
    Addon.key + "SwitchChange",
    "AddonBroadcast"
  ],
  Addon.key
)

const onButtonClick: EventHandler = async sender => {
  if (!isThisWindow(sender)) return
  // For magicaction
  console.log("Click a button", "event")
  const { row } = sender.userInfo
  handleMagicAction(row)
}

const onSwitchChange: EventHandler = async sender => {
  if (!isThisWindow(sender)) return
  console.log("Switch the switch", "event")
  const { name, key, status } = sender.userInfo
  await saveProfile(name, key, status)
}

const onSelectChange: EventHandler = async sender => {
  if (!isThisWindow(sender)) return
  console.log("Change the selection", "event")
  const { name, key, selections } = sender.userInfo
  switch (key) {
    case "panelPosition":
      layoutViewController(undefined, selections[0])
      break
    case "panelHeight":
      layoutViewController(selections[0])
      break
  }
  await saveProfile(name, key, selections)
}

const onInputOver: EventHandler = async sender => {
  if (!isThisWindow(sender)) return
  console.log("Input", "event")
  const { name, key } = sender.userInfo
  let { content } = sender.userInfo
  showHUD(content ? lang.input_saved : lang.input_clear)
  switch (key) {
    case "pageOffset": {
      const [a, b] = content.split(/\s*-\s*/).map(k => Number(k))
      content = b === undefined ? content : String(a - b)
      break
    }
  }
  await saveProfile(name, key, content)
}

const onAddonBroadcast: EventHandler = async sender => {
  console.log("Addon broadcast", "event")
  const { message } = sender.userInfo
  const params = message.replace(new RegExp(`^${Addon.key}\\?`), "")
  if (message !== params) {
    // await handleURLScheme(params)
  }
}

export default {
  onInputOver,
  onButtonClick,
  onSelectChange,
  onSwitchChange,
  onAddonBroadcast
}
