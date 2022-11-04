import {
  confirm,
  fetch,
  HUDController,
  openUrl,
  selectIndex,
  showHUD,
  StudyMode
} from "marginnote"
import { Addon } from "~/addon"
import { writeProfile, Range } from "~/profile"
import { dateFormat, extractArray } from "~/utils"
import type { Metadata, ReturnedData } from "./typings"

export async function fetchAll() {
  const { APIKey, userID, useTemp } = self.globalProfile.zotero
  if (!APIKey) throw "请设置 API Key"
  if (!userID) throw "请设置 User ID"
  const res = (await fetch(`https://api.zotero.org/users/${userID}/items`, {
    method: "GET",
    headers: {
      "Zotero-API-Key": APIKey,
      "Zotero-API-Version": "3"
    },
    search: {
      itemType: "-attachment"
    }
  }).then(res => res.json())) as ReturnedData[] | undefined
  if (res) {
    if (useTemp) {
      Addon.tempReturnedData = res
      self.globalProfile.additional.temp = JSON.stringify(res)
    }
    return res
  }
}

export async function fetchItemByTitle(title: string) {
  const { APIKey, userID, useTemp } = self.globalProfile.zotero
  if (!APIKey) throw "请设置 API Key"
  if (!userID) throw "请设置 User ID"
  if (useTemp) {
    const { temp } = self.globalProfile.additional
    if (!Addon.tempReturnedData && temp)
      Addon.tempReturnedData = JSON.parse(temp)
    if (Addon.tempReturnedData) {
      const t = Addon.tempReturnedData.filter(k => k.data.title.includes(title))
      if (t.length) return t
    } else {
      const res = await fetchAll()
      const t = res?.filter(k => k.data.title.includes(title))
      if (t?.length) return t
    }
  }
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

  return res as ReturnedData[]
}

export async function fetchItemByKey(key: string) {
  const { APIKey, userID } = self.globalProfile.zotero
  if (!APIKey) throw "请设置 API Key"
  if (!userID) throw "请设置 User ID"
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
  return res as ReturnedData
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

export async function addAttachmentURL(parentKey: string) {
  if (
    !MN.notebookController ||
    MN.studyController.studyMode !== StudyMode.study ||
    !MN.currnetNotebookid
  )
    return
  const { APIKey, userID } = self.globalProfile.zotero
  const { attachmentKey, attachmentVersion } = self.docProfile.additional
  if (!APIKey) throw "请设置 API Key"
  if (!userID) throw "请设置 User ID"
  try {
    const url = getDocURL()
    const notebookTitle = MN.db.getNotebookById(
      MN.notebookController.notebookId!
    )?.title
    if (url && notebookTitle) {
      if (attachmentKey) {
        await fetch(
          `https://api.zotero.org/users/${userID}/items/${attachmentKey}`,
          {
            method: "PATCH",
            headers: {
              "Zotero-API-Key": APIKey,
              "If-Unmodified-Since-Version": attachmentVersion,
              "Zotero-API-Version": "3"
            },
            json: {
              title: `MarginNote Notebook: ${notebookTitle}`,
              url
            }
          }
        )
        const { version } = await fetchItemByKey(attachmentKey)
        self.docProfile.additional.attachmentVersion = String(version)
      } else {
        const res = (await fetch(
          `https://api.zotero.org/users/${userID}/items`,
          {
            method: "POST",
            headers: {
              "Zotero-API-Key": APIKey,
              "Zotero-Write-Token": NSUUID.UUID()
                .UUIDString()
                .replace(/-/g, ""),
              "Zotero-API-Version": "3"
            },
            json: [
              {
                itemType: "attachment",
                linkMode: "linked_url",
                parentItem: parentKey,
                title: `MarginNote Notebook: ${notebookTitle}`,
                accessDate: "",
                url,
                note: "",
                tags: [],
                collections: [],
                relations: {},
                contentType: "",
                charset: ""
              }
            ]
          }
        ).then(res => res.json())) as {
          successful?: {
            "0": {
              key: string
              version: number
            }
          }
        }
        if (res.successful?.[0]) {
          self.docProfile.additional.attachmentKey = res.successful![0].key
          self.docProfile.additional.attachmentVersion = String(
            res.successful![0].version
          )
        }
      }
    }
  } catch (e) {
    dev.error(e)
  }
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
  if (
    MN.studyController.studyMode !== StudyMode.study ||
    !MN.currentDocmd5 ||
    MN.currentDocmd5 === "00000000" ||
    !MN.currnetNotebookid
  )
    return
  const notebook = MN.db.getNotebookById(MN.currnetNotebookid)!
  const note = notebook.notes?.find(
    k => k.docMd5 === MN.currentDocmd5 && k.modifiedDate
  )
  return note?.noteId
    ? `marginnote3app://note/${note.noteId}`
    : `marginnote3app://notebook/${MN.currnetNotebookid}`
}

export async function autoImportMetadata() {
  try {
    const { autoImport, APIKey, userID, noNeedConfirm } =
      self.globalProfile.zotero
    const { firstVisit } = self.docProfile.additional
    if (
      !MN.currentDocmd5 ||
      MN.currentDocmd5 === "00000000" ||
      !autoImport ||
      !firstVisit
    )
      return
    if (!APIKey) throw "请设置 API Key"
    if (!userID) throw "请设置 User ID"
    const { dirMatch } = self.tempProfile.regArray
    const pathFile = "~/" + MN.currentDocumentController.document!.pathFile!
    const dir = pathFile.split("/").slice(0, -1).join("/")
    if (
      !pathFile.endsWith(".pdf") ||
      (dirMatch && !dirMatch.some(k => k.every(h => h.test(dir))))
    )
      return
    self.docProfile.additional.firstVisit = false
    let docTitle = MN.currentDocumentController.document!.docTitle!
    const { customTitle: params } = self.tempProfile.replaceParam
    if (params?.length) {
      const r = extractArray(docTitle, params)[0]
      if (r) docTitle = r
    }
    HUDController.show("正在检索")
    const res = await fetchItemByTitle(docTitle)
    HUDController.hidden()
    let data: ReturnedData | undefined = undefined
    if (res) {
      if (res.length === 1) {
        if (
          noNeedConfirm ||
          (await confirm(
            undefined,
            `发现条目：「${res[0].data.title}」。是否导入？`
          ))
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
      await writeMetadata(data, MN.currentDocmd5)
      showHUD(`导入成功：${data.data.title}`)
    }
  } catch (e) {
    const msg = String(e)
    showHUD(
      `检索失败：${msg ? msg : "请检查网络以及 API Key，User ID 是否正确。"}`,
      3
    )
  }
}

export async function writeMetadata(data: ReturnedData, docmd5: string) {
  self.docProfile.additional.key = data.key
  self.docProfile.additional.webURL = data.links.alternate.href
  const metadata = genMetaData(data.data)
  if (/^.*Citation Key:\s*([^\n]+)\n*.*$/gs.test(metadata.extra)) {
    self.docProfile.additional.citeKey = metadata.extra.replace(
      /^.*Citation Key:\s*([^\n]+)\n*.*$/gs,
      "$1"
    )
  }
  self.docProfile.additional.data = JSON.stringify(metadata, undefined, 2)
  writeProfile({
    range: Range.Doc,
    docmd5
  })

  if (self.globalProfile.zotero.addURL) {
    await addAttachmentURL(metadata.key)
  }
}
