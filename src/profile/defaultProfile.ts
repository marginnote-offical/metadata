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
    addURL: false,
    noNeedConfirm: false,
    autoImport: false,
    useTemp: false,
    dirMatch: "/.+/",
    customTitle: `(/^(.+)$/, "$1")`,
    userID: "",
    showAPIKey: false,
    APIKey: ""
  },
  additional: {
    temp: "",
    lastVision: Addon.version
  }
}

// Each document has a independent profile
const defaultDocProfile = {
  addon: {
    pageOffset: "0",
    reference: ""
  },
  additional: {
    rest: [],
    key: "",
    webURL: "",
    data: "",
    attachmentKey: "",
    attachmentVersion: "",
    citeKey: "",
    firstVisit: true
  }
}

const defaultNotebookProfile = {
  addon: {
    profile: [0]
  }
}

export const defaultTempProfile = {
  replaceParam: {
    customTitle: []
  },
  regArray: {
    dirMatch: []
  }
}

export const customKey = [
  ...Object.keys(defaultTempProfile.regArray),
  ...Object.keys(defaultTempProfile.replaceParam)
]

export const rewriteSelection: RewriteCase[] = []

export { defaultGlobalProfile, defaultDocProfile, defaultNotebookProfile }
