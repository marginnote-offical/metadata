export const mainfest: Mainfest = {
  author: "MarginNote(ourongxing)",
  key: "metadata",
  title: "Metadata",
  version: "0.9.3",
  minMarginNoteVersion: "3.7.18",
  profileKey: {
    global: "metadata_profile_global",
    doc: "metadata_profile_doc",
    notebook: "metadata_profile_notebook"
  },
  color: {
    border: "#8A95A2",
    button: "#8A95A2"
  },
  github: "https://github.com/marginnoteapp/metadata",
  forumZH: "https://bbs.marginnote.cn/t/topic/20501",
  docZH: "https://ohmymn.marginnote.cn",
  doc: "https://ohmymn.marginnote.com",
  files: ["assets/logo.png", "assets/icon"]
}

interface Mainfest {
  key: string
  author: string
  title: string
  version: string
  github?: string
  minMarginNoteVersion: string
  profileKey: {
    global: string
    doc: string
    notebook: string
  }
  color: {
    border: string
    button: string
  }
  /** Chinese forum url */
  forumZH?: string
  forum?: string
  docZH?: string
  doc?: string
  files?: string[]
}
