import lang from "~/lang"
import { PanelControl } from "~/modules/addon/typings"
import { checkInputCorrect, actions4card } from "~/mergeMethod"
import { IRowButton, MbBookNote } from "~/typings"
import { CellViewType, UIAlertViewStyle } from "~/enum"
import { getMNLinkValue, manageProfileAction } from "~/profile"
import {
  MN,
  showHUD,
  HUDController,
  getSelectNodes,
  getNodeTree,
  undoGroupingWithRefresh,
  popup
} from "~/sdk"
import { closePanel } from "./switchPanel"

export default async (type: "card" | "text", row: IRowButton) => {
  switch (row.type) {
    case CellViewType.ButtonWithInput:
      while (1) {
        const { option, content } = await popup(
          {
            title: row.label,
            message: row.help ?? "",
            type: UIAlertViewStyle.PlainTextInput,
            // It is better to have only two options, because then the last option will be automatically selected after the input
            buttons: row.option ? row.option : [lang.sure]
          },
          ({ alert, buttonIndex }) => ({
            content: alert.textFieldAtIndex(0).text,
            option: buttonIndex
          })
        )
        if (option === -1) return
        const text = content ? getMNLinkValue(content) : ""
        // Allowed to be empty
        if (text === "" || (text && (await checkInputCorrect(text, row.key)))) {
          await handleMagicAction({
            type,
            key: row.key,
            option,
            content: text
          })
          return
        }
      }
    case CellViewType.Button:
      const { option } = await popup(
        {
          title: row.label,
          message: row.help ?? "",
          type: UIAlertViewStyle.Default,
          buttons: row.option ?? [lang.sure]
        },
        ({ buttonIndex }) => ({
          option: buttonIndex
        })
      )
      if (option === -1) return
      await handleMagicAction({
        type,
        key: row.key,
        option
      })
  }
}

const handleMagicAction = async ({
  type,
  key,
  option,
  content = ""
}: {
  type: "card" | "text"
  key: string
  option: number
  content?: string
}) => {
  try {
    let nodes: MbBookNote[] = []
    key != "filterCard" &&
      self.globalProfile.addon.panelControl.includes(
        PanelControl.CompleteClose
      ) &&
      closePanel()

    nodes = getSelectNodes()
    if (key === "manageProfile") {
      if (option > 1) await manageProfileAction(nodes[0], option)
      else {
        if (!nodes.length) {
          showHUD(lang.not_select_card)
          return
        }
        await manageProfileAction(nodes[0], option)
      }
      return
    } else {
      if (!nodes.length) {
        showHUD(lang.not_select_card)
        return
      }
      // The need for the same level is to avoid the situation where both parent and descendant nodes are selected,
      // which leads to duplicate processing.
      const isHavingChildren = nodes.every(
        node =>
          nodes[0].parentNote === node.parentNote && node?.childNotes?.length
      )
    }
    switch (key) {
      default:
        // Promise can not be placed in undoGroupingWithRefresh()
        if (actions4card[key] instanceof Promise)
          actions4card[key]({
            content,
            nodes,
            option
          })
        else
          undoGroupingWithRefresh(
            () =>
              void actions4card[key]({
                content,
                nodes,
                option
              })
          )
    }
  } catch (err) {
    console.error(String(err))
  }
}
