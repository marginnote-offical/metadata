import {
  defineGestureHandlers,
  gestureHandlerController,
  initGesture,
  MN,
  UISwipeGestureRecognizerDirection
} from "marginnote"
import { PanelControl } from "~/modules/addon/typings"
import { closePanel } from "./switchPanel"

// Not support Mac
// Cannot access self unless use function
export const gestureHandlers = () =>
  gestureHandlerController([
    {
      view: self.settingViewController.tableView!,
      gesture: initGesture.tap(1, 2, "DoubleClickOnTableView")
    }
  ])

export default defineGestureHandlers({
  onDoubleClickOnTableView() {
    const { panelControl } = self.globalProfile.addon
    if (panelControl.includes(PanelControl.DoubleClickClose)) closePanel()
  }
})
