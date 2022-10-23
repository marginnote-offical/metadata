import {
  alert,
  defineLifeCycleHandler,
  MN,
  openUrl,
  popup,
  showHUD,
  StudyMode
} from "marginnote"
import { Addon } from "~/addon"
import { defaultDataSource } from "~/dataSource"
import lang from "./lang"
import { autoImportMetadata } from "~/modules/zotero/utils"
import {
  defaultDocProfile,
  defaultGlobalProfile,
  defaultNotebookProfile,
  Range,
  readProfile,
  removeProfile,
  writeProfile
} from "~/profile"
import SettingViewController from "~/SettingViewController"
import { deepCopy } from "~/utils"
import { gestureHandlers } from "./handleGestureEvent"
import { eventHandlers } from "./handleReceivedEvent"
import { closePanel, layoutViewController } from "./switchPanel"

/**
 * Addon life cycle
 * If you close the window directly, it will not trigger the closing of notebooks and documents
 * 1. Addon connected
 * 2. Open a new window
 * 3. Open a notebook
 * 4. Open a document
 * 5. Close a notebook
 * 6. Close a document
 * 7. Close a window
 */

export default defineLifeCycleHandler({
  instanceMethods: {
    sceneWillConnect() {
      self.useConsole = true
      dev.log("Open a new window", "lifeCycle")
      // Multiple windows will share global variables, so they need to be saved to self.
      self.panel = {
        status: false,
        lastOpenPanel: 0,
        lastClickButton: 0,
        lastReaderViewWidth: 0
      }
      self.addon = {
        key: Addon.key,
        title: Addon.title
      }
      self.isFirstOpenDoc = true
      self.globalProfile = deepCopy(defaultGlobalProfile)
      self.docProfile = deepCopy(defaultDocProfile)
      self.notebookProfile = deepCopy(defaultNotebookProfile)
      self.dataSource = deepCopy(defaultDataSource)

      self.settingViewController = SettingViewController.new()
      self.settingViewController.addon = self.addon
      self.settingViewController.dataSource = self.dataSource
      self.settingViewController.globalProfile = self.globalProfile
      self.settingViewController.docProfile = self.docProfile
      self.settingViewController.notebookProfile = self.notebookProfile
    },
    notebookWillOpen(notebookid: string) {
      if (MN.studyController.studyMode === StudyMode.review) return
      if (MN.db.getNotebookById(notebookid)?.documents?.length === 0) {
        alert(lang.no_doc)
        return
      }
      dev.log("Open a notebook", "lifeCycle")
      if (!self.isFirstOpenDoc) {
        readProfile({
          range: Range.Notebook,
          notebookid
        })
      }
      // Add hooks, aka observers
      eventHandlers.add()
      gestureHandlers().add()
    },
    async documentDidOpen(docmd5: string) {
      if (MN.studyController.studyMode === StudyMode.review) return
      // Switch document, read doc profile
      if (self.isFirstOpenDoc) {
        dev.log("First open a document", "lifeCycle")
        self.isFirstOpenDoc = false
        readProfile({
          range: Range.All,
          docmd5,
          notebookid: MN.currnetNotebookid!
        })
      } else {
        readProfile({
          range: Range.Doc,
          docmd5
        })
      }
      dev.log("Open a document", "lifeCycle")
      await autoImportMetadata()
    },
    notebookWillClose(notebookid: string) {
      if (MN.studyController.studyMode === StudyMode.review) return
      if (MN.db.getNotebookById(notebookid)?.documents?.length === 0) return
      dev.log("Close a notebook", "lifeCycle")
      writeProfile({
        range: Range.Notebook,
        notebookid
      })
      closePanel()
      // Remove hooks, aka observers
      eventHandlers.remove()
      gestureHandlers().remove()
    },
    documentWillClose(docmd5: string) {
      if (MN.studyController.studyMode === StudyMode.review) return
      writeProfile({
        range: Range.Doc,
        docmd5
      })
      dev.log("Close a document", "lifeCycle")
    },
    // Not triggered on ipad
    sceneDidDisconnect() {
      dev.log("Close a window", "lifeCycle")
      if (MN.isMac && MN.currentDocmd5 && MN.currnetNotebookid) {
        writeProfile({
          range: Range.All,
          docmd5: MN.currentDocmd5,
          notebookid: MN.currnetNotebookid
        })
      }
    },
    sceneWillResignActive() {
      // or go to the background
      dev.log("Window is inactivation", "lifeCycle")
      if (!MN.isMac && MN.currentDocmd5 && MN.currnetNotebookid) {
        writeProfile({
          range: Range.All,
          docmd5: MN.currentDocmd5,
          notebookid: MN.currnetNotebookid
        })
      }
    },
    sceneDidBecomeActive() {
      !MN.isMac && layoutViewController()
      // or go to the foreground
      dev.log("Window is activated", "lifeCycle")
    }
  },
  classMethods: {
    async addonWillDisconnect() {
      dev.log("Addon disconected", "lifeCycle")
      const { option } = await popup(
        {
          title: Addon.title,
          message: lang.uninstall.have_bugs,
          buttons: lang.uninstall.$options2
        },
        ({ buttonIndex }) => ({
          option: buttonIndex
        })
      )
      switch (option) {
        case 0: {
          removeProfile()
          // clear to be a new scene
          self.isFirstOpenDoc = true
          // could not get the value of self.window
          showHUD(lang.uninstall.profile_reset, 2)
          break
        }
        case 1: {
          Addon.forum && openUrl(Addon.forum)
        }
      }
    },
    addonDidConnect() {
      dev.log("Addon connected", "lifeCycle")
    }
  }
})
