import lang from "./lang"
import { more, constModules, modules } from "./modules"
import { ModuleKeyType } from "./mergeMethod"
import { ISection, IConfig, IRow } from "./typings"
import { CellViewType } from "./enum"
import { serialSymbols } from "./utils"

const { addon, magicaction } = constModules

const genSection = (config: IConfig): ISection => {
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

const genDataSource = (configs: IConfig[], magicaction4card: IConfig) => {
  const dataSource: ISection[] = []
  const moduleNameList: { key: string[]; name: string[] } = {
    key: [],
    name: []
  }
  const actions4card =
    magicaction4card.actions?.map(k => ({
      ...k,
      module: "magicaction" as ModuleKeyType,
      moduleName: "MagicAction"
    })) ?? []
  configs.forEach(config => {
    dataSource.push(genSection(config))
    if (config.actions?.length)
      actions4card.push(
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

  const Action4CardSection = genSection(magicaction4card)
  Action4CardSection.rows.push(...actions4card)

  // 更新 quickSwitch 为 moduleList
  const [AddonSection] = dataSource
  for (const row of AddonSection.rows) {
    if (row.type == CellViewType.MuiltSelect && row.key == "quickSwitch")
      row.option = moduleNameList.name.map(
        (value, index) =>
          serialSymbols.hollow_circle_number[index] + " " + value
      )
  }

  dataSource.splice(1, 0, Action4CardSection)
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

export const { dataSource: dataSourcePreset, moduleNameList } = genDataSource(
  // @ts-ignore
  [addon, ...Object.values(modules)],
  magicaction
)
export const dataSourceIndex = genDataSourceIndex(dataSourcePreset)
