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
  magicaction: {
    rest: []
  },
  additional: {
    lastVision: Addon.version
  }
}

// Each document has a independent profile
const defaultDocProfile = {
  addon: {
    rest: []
  }
}

const defaultNotebookProfile = {
  addon: {
    profile: [0]
  }
}

export const rewriteSelection: RewriteCase[] = []

export { defaultGlobalProfile, defaultDocProfile, defaultNotebookProfile }
