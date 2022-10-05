import { Addon } from "~/addon"
import { CellViewType } from "~/enum"
import { defineConfig } from "~/profile"

export default defineConfig({
  name: "Zotero",
  key: "zotero",
  link: Addon.forum,
  intro:
    "【仅 Mac】从 Zotro 中获取文档源数据。请确保安装了 Zotero，并且 Zotero 中有该文档的源数据。               ",
  settings: [
    {
      key: "test",
      type: CellViewType.Switch,
      label: "测试"
    }
  ],
  actions: [
    {
      key: "fetchMetaData",
      type: CellViewType.ButtonWithInput,
      help: "输入需要获取的文档名称，获取成功后会自动写入当前文档的配置中。",
      option: ["使用当前文档名", "确定"],
      label: "从 Zotero 获取元数据",
      method: () => {
        console.log("从 Zotero 获取元数据")
      }
    },
    {
      key: "openZotero",
      type: CellViewType.Button,
      label: "在 Zotero 中查看",
      help: "如果之前从 Zotero 中获取过元数据，会自动打开该文档的 Zotero 链接。",
      option: ["Reference", "First PDF"],
      method: () => {
        console.log()
      }
    }
  ]
})
