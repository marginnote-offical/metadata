import { ModuleKeyType } from "~/merged"
import { requiredModules } from "~/modules"
import { IConfig, ISection, IRow, CellViewType } from "~/typings"
import { serialSymbols } from "~/utils"
import { more } from "./more"

const genSection = (config: IConfig<ModuleKeyType>): ISection => {
  const rows: IRow[] = [
    {
      type: CellViewType.PlainText,
      label: config.intro,
      link: config.link
    }
  ]
  for (const setting of config.settings) {
    //@ts-ignore magic hack
    rows.push(setting)
    if (setting.help) {
      switch (setting.type) {
        case CellViewType.MuiltSelect:
        case CellViewType.Select:
        case CellViewType.Switch:
          rows.push({
            type: CellViewType.PlainText,
            label: "↑ " + setting.help,
            link: setting.link,
            bind: setting.bind
          })
          break
        case CellViewType.InlineInput:
        case CellViewType.Input:
          rows.push({
            type: CellViewType.PlainText,
            label: "↑ " + setting.help,
            link: setting.link,
            bind: setting.bind
          })
      }
    }
  }
  return {
    header: config.name,
    key: config.key as ModuleKeyType,
    rows
  }
}

const genDataSource = (
  configs: IConfig<ModuleKeyType>[],
  magicaction: IConfig<"magicaction">
) => {
  const dataSource: ISection[] = []
  const moduleNameList: { key: string[]; name: string[] } = {
    key: [],
    name: []
  }
  const actions =
    magicaction.actions?.map(k => ({
      ...k,
      module: "magicaction" as ModuleKeyType,
      moduleName: "MagicAction"
    })) ?? []
  configs.forEach(config => {
    dataSource.push(genSection(config))
    if (config.actions?.length)
      actions.push(
        ...config.actions.map(k => ({
          ...k,
          moduleName: config.name,
          module: config.key as ModuleKeyType,
          help: k.help
        }))
      )
  })
  dataSource.forEach((sec, index) => {
    if (index) {
      moduleNameList.key.push(sec.key)
      moduleNameList.name.push(sec.header)
    }
  })

  const ActionSection = genSection(magicaction as IConfig<ModuleKeyType>)
  ActionSection.rows.push(...actions)

  // 更新 quickSwitch 为 moduleList
  const [AddonSection] = dataSource
  for (const row of AddonSection.rows) {
    if (row.type == CellViewType.MuiltSelect && row.key == "quickSwitch")
      row.option = moduleNameList.name.map(
        (value, index) =>
          serialSymbols.hollow_circle_number[index] + " " + value
      )
  }

  dataSource.splice(1, 0, ActionSection)
  dataSource.push(more)
  return {
    dataSource,
    moduleNameList
  }
}

function genDataSourceIndex(dataSource: ISection[]) {
  return dataSource.reduce((acc, sec, secIndex) => {
    acc[sec.key] = sec.rows.reduce((acc, row, rowIndex) => {
      if (row.type != CellViewType.PlainText) {
        acc[row.key] = [secIndex, rowIndex]
      }
      return acc
    }, {} as Record<string, [number, number]>)
    return acc
  }, {} as Record<ModuleKeyType, Record<string, [number, number]>>)
}

const { addon, magicaction, zotero } = requiredModules
export const { dataSource: defaultDataSource, moduleNameList } = genDataSource(
  [addon, zotero] as IConfig<ModuleKeyType>[],
  magicaction
)
export const dataSourceIndex = genDataSourceIndex(defaultDataSource)
