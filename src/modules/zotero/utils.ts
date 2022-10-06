import { Addon } from "~/addon"
import { StudyMode } from "~/enum"
import { fetch, MN, openUrl } from "~/sdk"
import { MbBookNote } from "~/typings"
import { dateFormat } from "~/utils"
import { Metadata, ReturnData } from "./typings"

export async function fetchItemByTitle(title: string) {
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
  return res as ReturnData[]
}

export async function fetchItemByKey(key: string) {
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
