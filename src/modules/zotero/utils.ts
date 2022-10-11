import {
  confirm,
  fetch,
  HUDController,
  MbBookNote,
  MN,
  openUrl,
  selectIndex,
  showHUD,
  StudyMode
} from "marginnote"
import { Addon } from "~/addon"
import { Range, writeProfile } from "~/profile"
import { dateFormat, extractArray, string2ReplaceParam } from "~/utils"
import type { Metadata, ReturnData } from "./typings"

export async function fetchItemByTitle(title: string) {
  HUDController.show("正在检索")
  const { APIKey, userID } = self.globalProfile.zotero
  const res = await fetch(`https://api.zotero.org/users/${userID}/items`, {
    method: "GET",
    headers: {
      "Zotero-API-Key": APIKey,
      "Zotero-API-Version": "3"
    },
    search: {
      q: title,
      itemType: "-attachment"
    }
  }).then(res => res.json())
  HUDController.hidden()
  return res as ReturnData[]
}

export async function fetchItemByKey(key: string) {
  HUDController.show("正在检索")
  const { APIKey, userID } = self.globalProfile.zotero
  const res = await fetch(
    `https://api.zotero.org/users/${userID}/items/${key}`,
    {
      method: "GET",
      headers: {
        "Zotero-API-Key": APIKey,
        "Zotero-API-Version": "3"
      }
    }
  ).then(res => res.json())
  HUDController.hidden()
  return res as ReturnData
}

export function genMetaData(data: Metadata) {
  return {
    ...data,
    dateAdded: dateFormat(new Date(data.dateAdded)),
    dateModified: dateFormat(new Date(data.dateModified)),
    accessDate: dateFormat(new Date(data.accessDate)),
    tags:
      data.tags
        ?.map(k => k.tag.split(" "))
        .flat()
        .map(k => `#${k}`)
        .join(" ") ?? "",
    authors:
      data.creators
        ?.filter(k => k.creatorType === "author")
        .map(
          k => k.name ?? [k.firstName, k.lastName].filter(k => k).join(" ")
        ) ?? []
  }
}

export function updateURL(key: string, url: string) {
  const { APIKey, userID } = self.globalProfile.zotero
  fetch(`https://api.zotero.org/users/${userID}/items/${key}`, {
    method: "PATCH",
    headers: {
      "Zotero-API-Key": APIKey,
      "If-Unmodified-Since-Version": String(Addon.zoteroVersion),
      "Zotero-API-Version": "3"
    },
    json: {
      url
    }
  }).then(res => res.json())
}

export async function viewJSONOnline(json: any) {
  const res = await fetch("https://jsonhero.io/api/create.json", {
    method: "POST",
    json: {
      title: "Metadata",
      content: json
    }
  }).then(k => k.json())
  openUrl(res.location)
}

export function getDocURL() {
  if (MN.studyController().studyMode !== StudyMode.study) return
  const notebook = MN.db.getNotebookById(self.notebookid)!
  const note =
    MN.studyController().notebookController.mindmapView.mindmapNodes?.reduce(
      (acc, k) => {
        if (k.note.docMd5 === self.docmd5 && k.note.modifiedDate) {
          if (acc?.modifiedDate) {
            if (acc.modifiedDate < k.note.modifiedDate) return k.note
          } else return k.note
        }
        return acc
      },
      undefined as undefined | MbBookNote
    )
  return note?.noteId
    ? `marginnote3app://note/${note.noteId}`
    : `marginnote3app://notebook/${notebook.topicId}`
}

export async function autoImportMetadata() {
  try {
    const { autoImport, APIKey, userID, customTitle } =
      self.globalProfile.zotero
    const { firstVisit } = self.docProfile.additional
    if (autoImport && APIKey && userID && firstVisit) {
      self.docProfile.additional.firstVisit = false
      let title =
        MN.studyController().readerController.currentDocumentController
          .document!.docTitle!
      if (customTitle) {
        const params = string2ReplaceParam(customTitle)
        const r = extractArray(title, params)[0]
        if (r) title = r
      }
      const res = await fetchItemByTitle(title)
      let data: ReturnData | undefined = undefined
      if (res) {
        if (res.length === 1) {
          if (
            await confirm(
              undefined,
              `发现条目：「${res[0].data.title}」。是否导入？`
            )
          )
            data = res[0]
        } else if (res.length > 1) {
          const index = await selectIndex(
            res.map(k => k.data.title),
            undefined,
            "检索到以下条目，请选择需要导入的条目",
            true
          )
          if (index !== -1) data = res[index]
        } else if (res.length === 0) {
          throw "没有找到"
        }
      } else throw ""
      if (data) {
        self.docProfile.additional.key = data.key
        self.docProfile.additional.webURL = data.links.alternate.href
        const metadata = genMetaData(data.data)
        Addon.zoteroVersion = metadata.version
        self.docProfile.additional.data = JSON.stringify(metadata, undefined, 2)
        writeProfile({
          range: Range.Doc,
          docmd5: self.docmd5!
        })
        const url = getDocURL()
        url && updateURL(metadata.key, url)
        if (await confirm(undefined, "导入成功，是否查看其具体内容？")) {
          viewJSONOnline(metadata)
        }
      }
    }
  } catch (e) {
    const msg = String(e)
    showHUD(
      `检索失败：${msg ? msg : "请检查网络以及 API Key，User ID 是否正确。"}`,
      3
    )
  }
}
