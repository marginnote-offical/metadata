import {
  confirm,
  HUDController,
  openUrl,
  selectIndex,
  setLocalDataByKey,
  showHUD
} from "marginnote"
import { CellViewType } from "~/typings"
import { defineConfig, Range, readProfile } from "~/profile"
import {
  fetchAll,
  fetchItemByKey,
  fetchItemByTitle,
  genMetaData,
  viewJSONOnline,
  writeMetadata
} from "./utils"
import { ReturnedData } from "./typings"
import { checkReplaceParam, extractArray } from "~/utils"
import { Addon } from "~/addon"

export default defineConfig({
  name: "Zotero",
  key: "zotero",
  intro:
    "从 Zotero 中获取元数据，并实现 MarignNote 和 Zotero 互相跳转。需要你注册 Zotero 帐号。",
  settings: [
    {
      key: "autoImport",
      type: CellViewType.Switch,
      label: "文档打开时自动导入"
    },
    {
      key: "noNeedConfirm",
      type: CellViewType.Switch,
      label: "自动导入不需要确认",
      bind: ["autoImport", true]
    },
    {
      key: "dirMatch",
      type: CellViewType.Input,
      help: "使用正则表达式匹配需要自动导入的文档文件夹，匹配成功则自动导入。",
      bind: ["autoImport", true]
    },
    {
      key: "useTemp",
      type: CellViewType.Switch,
      label: "导入时使用缓存",
      help: "开启后在下次导入时会自动缓存 Zotero 中所有条目的数据。可以大幅节省导入时间。如果需要刷新缓存，可以重新开关该选项。"
    },
    {
      key: "addURL",
      type: CellViewType.Switch,
      label: "添加 MN 回链",
      help: "成功导入后自动在 Zotero 中添加一个 MN 笔记本链接的附件"
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
      key: "fetchAll",
      type: CellViewType.Button,
      label: "更新已导入的数据",
      help: "更新已导入的文档元数据，无视缓存。",
      option: ["更新当前文档", "更新所有文档"],
      async method({ option }) {
        if (!MN.currentDocmd5) return
        HUDController.show("正在更新数据，请稍候...")
        try {
          if (option === 1) {
            const res = await fetchAll()
            if (res) {
              Object.values(self.allDocProfile).forEach(profile => {
                if (profile.additional.key) {
                  const item = res.find(k => k.key === profile.additional.key)
                  if (item) {
                    const metadata = genMetaData(item.data)
                    if (
                      /^.*Citation Key:\s*([^\n]+)\n*.*$/gs.test(metadata.extra)
                    ) {
                      profile.additional.citeKey = metadata.extra.replace(
                        /^.*Citation Key:\s*([^\n]+)\n*.*$/gs,
                        "$1"
                      )
                    }

                    profile.additional.data = JSON.stringify(
                      metadata,
                      undefined,
                      2
                    )
                  }
                }
              })
              setLocalDataByKey(self.allDocProfile, Addon.docProfileKey)
              readProfile({
                range: Range.Doc,
                docmd5: MN.currentDocmd5
              })
            } else throw ""
          } else {
            const { key } = self.docProfile.additional
            if (key) {
              const res = await fetchItemByKey(key)
              HUDController.hidden()
              if (res) {
                await writeMetadata(res, MN.currentDocmd5)
                showHUD("导入成功")
              } else throw ""
            } else throw "还没有导入过"
          }
          HUDController.hidden("更新成功")
        } catch (e) {
          const msg = String(e)
          dev.error(e)
          HUDController.hidden(
            `更新失败：${
              msg ? msg : "请检查网络以及 API Key，User ID 是否正确"
            }`
          )
        }
      }
    },
    {
      key: "fetchMetadata",
      type: CellViewType.ButtonWithInput,
      help: "输入需要检索的文档名称，成功后会自动写入当前文档的配置中。",
      option: ["使用当前文档名", "确定"],
      label: "从 Zotero 中导入",
      method: async ({ content: docTitle, option }) => {
        try {
          if (!MN.currentDocmd5) return
          if (option === 0) {
            docTitle = MN.currentDocumentController.document!.docTitle!
            const { customTitle: params } = self.tempProfile.replaceParam
            if (params?.length) {
              const r = extractArray(docTitle, params)[0]
              if (r) docTitle = r
            }
          }
          if (docTitle) {
            HUDController.show("正在检索，请稍候...")
            const res = await fetchItemByTitle(docTitle)
            HUDController.hidden()
            if (res) {
              let data: ReturnedData | undefined = undefined
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
              if (data) {
                await writeMetadata(data, MN.currentDocmd5)
                showHUD("导入成功")
              }
            } else throw ""
          } else showHUD("请输入需要检索的文档名称")
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
      key: "openInZotero",
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
      async method() {
        const { data } = self.docProfile.additional
        if (data) viewJSONOnline(JSON.parse(data))
        else {
          showHUD("请先从 Zotero 中导入元数据")
        }
      }
    }
  ]
})
