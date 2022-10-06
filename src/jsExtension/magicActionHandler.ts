import lang from "~/lang"
import { PanelControl } from "~/modules/addon/typings"
import { checkInputCorrect, actions } from "~/mergeMethod"
import { IRowButton, MbBookNote } from "~/typings"
import { CellViewType, UIAlertViewStyle } from "~/enum"
import { getMNLinkValue, manageProfileAction } from "~/profile"
import { showHUD, getSelectNodes, popup } from "~/sdk"
import { closePanel } from "./switchPanel"

export default async (row: IRowButton, option?: number, content?: string) => {
  if (option !== undefined && content !== undefined) {
    // Allowed to be empty
    if (
      content === "" ||
      (content && (await checkInputCorrect(content, row.key)))
    ) {
      await handleMagicAction({
        key: row.key,
        option,
        content
      })
      return
    }
  } else if (option !== undefined) {
    await handleMagicAction({ key: row.key, option })
  } else
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
          if (
            text === "" ||
            (text && (await checkInputCorrect(text, row.key)))
          ) {
            await handleMagicAction({
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
          key: row.key,
          option
        })
    }
}

const handleMagicAction = async ({
  key,
  option,
  content = ""
}: {
  key: string
  option: number
  content?: string
}) => {
  try {
    let nodes: MbBookNote[] = []
    self.globalProfile.addon.panelControl.includes(
      PanelControl.CompleteClose
    ) && closePanel()

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
      actions[key]({
        content,
        option
      })
    }
  } catch (err) {
    console.error(String(err))
  }
}
