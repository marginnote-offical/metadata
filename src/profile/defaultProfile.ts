import { Addon } from "~/addon"
import { RewriteCase } from "./typings"

const defaultGlobalProfile = {
  addon: {
    panelControl: [],
    panelPosition: [0],
    panelHeight: [1],
    autoBackup: false,
    backupID: "",
    showMetaData: true
  },
  zotero: {
    test: false
  },
  magicaction: {},
  additional: {
    lastVision: Addon.version
  }
}

// Each document has a independent profile
const defaultDocProfile = {
  addon: {
    rest: [],
    pageOffset: "0"
  }
}

const defaultNotebookProfile = {
  addon: {
    profile: [0]
  }
}

export const rewriteSelection: RewriteCase[] = []

export { defaultGlobalProfile, defaultDocProfile, defaultNotebookProfile }
