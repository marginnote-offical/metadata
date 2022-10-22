import { confirm, MN, openUrl, selectIndex, showHUD } from "marginnote"
import { CellViewType } from "~/typings"
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
import { checkReplaceParam, extractArray, string2ReplaceParam } from "~/utils"

export default defineConfig({
  name: "Zotero",
  key: "zotero",
  intro:
    "从 Zotero 中获取元数据，并实现 MarignNote 和 Zotero 互相跳转。需要你注册 Zotero 帐号。",
  settings: [
    {
      key: "autoImport",
      type: CellViewType.Switch,
      label: "文档打开时自动导入",
      help: "在笔记本模式下首次打开文档自动检索并导入元数据。"
    },
    {
      key: "addURL",
      type: CellViewType.Switch,
      label: "添加 MN 回链",
      help: "将 URL 字段设置为当前文档的 MN 链接（笔记链接代替），仅笔记本模式下可用。"
    },
    {
      key: "customTitle",
      type: CellViewType.Input,
      help: "提取文档名称的部分内容作为检索 Zotero 数据的标题。提取结果会作为手动或自动检索的文档名称。",
      check({ input }) {
        checkReplaceParam(input)
      }
    },
    {
      key: "showAPIKey",
      type: CellViewType.Expland,
      label: ["点击显示密钥，不要让别人看到", "点击隐藏密钥，不要让别人看到"]
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
      help: "输入需要检索的文档名称，成功后会自动写入当前文档的配置中。",
      option: ["使用当前文档名", "更新上次导入的条目", "确定"],
      label: "从 Zotero 导入元数据",
      method: async ({ content, option }) => {
        try {
          const { APIKey, userID, customTitle } = self.globalProfile.zotero
          if (!APIKey) {
            showHUD("请设置 API Key")
            return
          }
          if (!userID) {
            showHUD("请设置 User ID")
            return
          }
          if (option === 0) {
            content = MN.currentDocumentController.document!.docTitle!
            if (customTitle) {
              const params = string2ReplaceParam(customTitle)
              const r = extractArray(content, params)[0]
              if (r) content = r
            }
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
                } else if (res.length === 0) throw "没有找到"
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
          const msg = String(e)
          showHUD(
            `检索失败：${
              msg ? msg : "请检查网络以及 API Key，User ID 是否正确"
            }`,
            3
          )
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
