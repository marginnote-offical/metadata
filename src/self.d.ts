import {
  UIView,
  UIWindow,
  UITableView,
  ISection,
  UITableViewController
} from "~/typings"
import {
  IDocProfile,
  IGlobalProfile,
  INotebookProfile
} from "~/profile"

declare global {
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
