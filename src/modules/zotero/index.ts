import { confirm, MN, openUrl, selectIndex, showHUD } from "~/sdk"
import { CellViewType } from "~/enum"
import { defineConfig, Range, writeProfile } from "~/profile"
import {
  fetchItemByKey,
  fetchItemByTitle,
  genMetaData,
  getDocURL,
  updateURL,
  viewJSONOnline
} from "./utils"
import { ReturnData } from "./typings"
import { Addon } from "~/addon"

export default defineConfig({
  name: "Zotero",
  key: "zotero",
  intro:
    "从 Zotero 中获取元数据，并实现 MarignNote 和 Zotero 互相跳转。需要你注册 Zotero 帐号。",
  settings: [
    {
      key: "addURL",
      type: CellViewType.Switch,
      label: "添加 MN 回链",
      help: "将 URL 字段设置为当前文档的 MN 链接，仅笔记本模式下可用。"
    },
    {
      key: "showAPIKey",
      type: CellViewType.Switch,
      label: "显示/隐藏 API Key"
    },
    {
      key: "userID",
      type: CellViewType.Input,
      help: "Zotero User ID，点击获取。",
      link: "https://www.zotero.org/settings/keys",
      bind: ["showAPIKey", true]
    },
    {
      key: "APIKey",
      type: CellViewType.Input,
      help: "Zotero Private Key，点击创建。如果需要添加 MN 回链，请勾选 Allow write access。",
      link: "https://www.zotero.org/settings/keys/new",
      bind: ["showAPIKey", true]
    }
  ],
  actions: [
    {
      key: "fetchMetadata",
      type: CellViewType.ButtonWithInput,
      help: "输入需要获取的文档名称，获取成功后会自动写入当前文档的配置中。",
      option: ["使用当前文档名", "更新上次导入的条目", "确定"],
      label: "从 Zotero 导入元数据",
      method: async ({ content, option }) => {
        try {
          const { APIKey, userID } = self.globalProfile.zotero
          if (!APIKey) {
            showHUD("请设置 API Key")
            return
          }
          if (!userID) {
            showHUD("请设置 User ID")
            return
          }
          if (option === 0) {
            content =
              MN.studyController().readerController.currentDocumentController
                .document!.docTitle!
          }
          let data: ReturnData | undefined = undefined
          if (option === 1) {
            const { key } = self.docProfile.additional
            if (key) {
              const res = await fetchItemByKey(key)
              if (res) data = res
              else throw ""
            } else showHUD("没有导入过")
          } else {
            if (content) {
              const res = await fetchItemByTitle(content)
              if (res) {
                if (res.length) {
                  if (res.length === 1) {
                    if (
                      await confirm(
                        undefined,
                        `发现条目：「${res[0].data.title}」。是否导入？`
                      )
                    )
                      data = res[0]
                  } else {
                    const index = await selectIndex(
                      res.map(k => k.data.title),
                      undefined,
                      "搜索到以下条目，请选择需要导入的条目",
                      true
                    )
                    if (index !== -1) data = res[index]
                  }
                } else showHUD("没有找到该文档的元数据")
              } else throw ""
            } else showHUD("请输入文档名称")
          }

          if (data) {
            self.docProfile.additional.key = data.key
            self.docProfile.additional.webURL = data.links.alternate.href
            const metadata = genMetaData(data.data)
            Addon.zoteroVersion = metadata.version
            self.docProfile.additional.data = JSON.stringify(
              metadata,
              undefined,
              2
            )
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
        } catch (e) {
          showHUD("获取失败，请检查网络以及 API Key，User ID 是否正确", 3)
        }
      }
    },
    {
      key: "openZotero",
      type: CellViewType.Button,
      label: "在 Zotero 中查看",
      option: ["App", "Web"],
      help: "你可以在 Zotero App 或者 Web 端中查看或编辑该文档的元数据。编辑后需要重新导入。",
      method: ({ option }) => {
        const { key, webURL } = self.docProfile.additional
        if (key) {
          if (option === 0) {
            openUrl(`zotero://select/items/0_${key}`)
          } else {
            openUrl(webURL)
          }
        } else {
          showHUD("请先从 Zotero 中导入元数据")
        }
      }
    },
    {
      key: "viewMetadata",
      type: CellViewType.Button,
      label: "查看元数据内容和格式",
      help: "你可以在 OhMyMN 中使用模版引擎来调用元数据。在此之前，你可能需要了解一下当前文档元数据的格式和内容。",
      method: async () => {
        if (self.docProfile.additional.data)
          viewJSONOnline(JSON.parse(self.docProfile.additional.data))
        else {
          showHUD("请先从 Zotero 中导入元数据")
        }
      }
    }
  ]
})
