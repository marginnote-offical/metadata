import { Addon } from "~/addon"
import { RewriteCase } from "./typings"

const defaultGlobalProfile = {
  addon: {
    panelControl: [],
    panelPosition: [0],
    panelHeight: [1],
    autoBackup: false,
    backupID: ""
  },
  magicaction: {},
  zotero: {
    addURL: true,
    autoImport: false,
    customTitle: `(/^(.*)$/, "$1")`,
    userID: "",
    showAPIKey: false,
    APIKey: ""
  },
  additional: {
    lastVision: Addon.version
  }
}

// Each document has a independent profile
const defaultDocProfile = {
  addon: {
    pageOffset: "0",
    citeKey: "",
    reference: ""
  },
  additional: {
    key: "",
    webURL: "",
    rest: [],
    data: "",
    firstVisit: true
  }
}

const defaultNotebookProfile = {
  addon: {
    profile: [0]
  }
}

export const rewriteSelection: RewriteCase[] = []

export { defaultGlobalProfile, defaultDocProfile, defaultNotebookProfile }
