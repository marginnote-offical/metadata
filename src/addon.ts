import mainfest from "../mainfest"
import { MN } from "marginnote"
import type { SQLiteDatabase } from "marginnote"

class MNADDON {
  path!: string
  key = mainfest.key
  title = mainfest.title
  author = mainfest.author
  version = mainfest.version
  globalProfileKey = mainfest.profileKey.global
  docProfileKey = mainfest.profileKey.doc
  notebookProfileKey = mainfest.profileKey.notebook
  textColor = UIColor.blackColor()
  borderColor = UIColor.colorWithHexString(mainfest.color.border)
  buttonColor = UIColor.colorWithHexString(mainfest.color.button)
  github = mainfest.github
  forum = MN.isZH ? mainfest.forumZH : mainfest.forum
  doc = MN.isZH ? mainfest.docZH : mainfest.doc
  zoteroDB?: SQLiteDatabase
  lastVersion!: string
  zoteroVersion!: number
}

export const Addon = new MNADDON()
