import type { ISection } from "~/typings"
import type { UITableView, UIWindow, UITableViewController } from "marginnote"
import type { IDocProfile, IGlobalProfile, INotebookProfile } from "./profile"

declare global {
  const dev: typeof import("marginnote")["dev"]
  const self: {
    addon?: {
      key: string
      title: string
    }
    panel: {
      status: boolean
      lastOpenPanel: number
      lastClickButton: number
      lastReaderViewWidth: number
    }
    useConsole?: boolean
    isFirstOpenDoc: boolean
    backupWaitTimes: number | undefined
    webView: UIWebView
    view: UIView
    window: UIWindow
    docmd5: string | undefined
    noteid: string
    notebookid: string
    tableView: UITableView
    docProfile: IDocProfile
    globalProfile: IGlobalProfile
    notebookProfile: INotebookProfile
    dataSource: ISection[]
    allGlobalProfile: IGlobalProfile[]
    allDocProfile: Record<string, IDocProfile>
    allNotebookProfile: Record<string, INotebookProfile>
    settingViewController: UITableViewController
    popoverController: UIPopoverController
  }
}
