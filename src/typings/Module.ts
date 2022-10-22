import { IAllProfile } from "~/profile"
import { NodeNote } from "marginnote"
import { CellViewType } from "."
import { AllModuleKeyUnion } from "~/merged"

export type IConfig<T extends AllModuleKeyUnion | null = null> = {
  name: string
  key: T extends AllModuleKeyUnion ? T : string
  intro: string
  link?: string
  settings: ISetting<
    T extends AllModuleKeyUnion ? IAllProfile[T] : Record<string, any>
  >[]
  actions?: IAction<IActionMethod>[]
}

/** Help must be set before using link */
// eslint-disable-next-line @typescript-eslint/ban-types
type HelpLink = XOR<{ help: string; link?: string }, {}>

type Bind<T> = {
  bind?: MaybeArray<
    MaybeArray<
      | [PickKeyByValue<T, number[]>, number | number[]]
      | [PickKeyByValue<T, boolean>, boolean]
    >
  >
}

type HelpLinkLabel = HelpLink & {
  label: string
}

export type ISettingInlineInput<T> = {
  key: PickKeyByValue<T, string>
  type: CellViewType.InlineInput
  check?: ICheckMethod
} & HelpLinkLabel &
  Bind<T>

export type ISettingInput<T> = {
  key: PickKeyByValue<T, string>
  type: CellViewType.Input
  help: string
  link?: string
  check?: ICheckMethod
} & Bind<T>

export type ISettingSwitch<T> = {
  key: PickKeyByValue<T, boolean>
  type: CellViewType.Switch
} & HelpLinkLabel &
  Bind<T>

export type ISettingExpland<T> = {
  key: PickKeyByValue<T, boolean>
  type: CellViewType.Expland
  label: [string, string]
} & Bind<T>

export type ISettingSelect<T> = {
  key: PickKeyByValue<T, number[]>
  type: CellViewType.Select | CellViewType.MuiltSelect
  option: string[]
} & HelpLinkLabel &
  Bind<T>

export type ISetting<T> =
  | ISettingInput<T>
  | ISettingSelect<T>
  | ISettingSwitch<T>
  | ISettingInlineInput<T>
  | ISettingExpland<T>

export type IAction<T extends IActionMethod> = {
  key: string
  label: string
  type: CellViewType.Button | CellViewType.ButtonWithInput
  /** auto generate. value is module's key*/
  module?: string
  /** auto generate. value is module's name*/
  moduleName?: string
  option?: string[]
  help?: string
  method: T
  check?: ICheckMethod
}

export type IActionMethod = ({
  content,
  nodes,
  option
}: {
  content: string
  nodes: NodeNote[]
  option: number
}) => any

export type ICheckMethod = ({ input }: { input: string }) => MaybePromise<void>
