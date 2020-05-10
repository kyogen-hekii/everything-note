import React, { Component } from "react"
import { createSelector } from "reselect"
import _ from "lodash"
import { createNoteArr, createdData, deletedData } from "../services/Note"
import { getNowYMD } from "../utils/Time"

const selfReactions = {
  1: "☆",
  2: "👍",
  3: "↓",
} as any
const displaySelfReaction = (id: number) => {
  return selfReactions[id]
}

const categories = {
  1: "健康",
  2: "食事",
} as any
const displayCategory = (id: number) => {
  return categories[id]
}

export default class NotePage extends Component {
  state: any = {
    activeId: 1,
    data: this.initNote(),
  }
  // #region handler
  handleKeyDownOnText = (data: any, item: any) => (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.which === 13) {
      // enter
      e.preventDefault()
      const newId =
        Math.max.apply(
          null,
          Object.keys(data).map((key) => Number(key))
        ) + 1
      const newData = createdData(data, item, newId)
      this.setState({ data: newData, activeId: newId })
    }
    if (e.which === 38) {
      // up
      item.beforeId && this.setState({ activeId: item.beforeId })
    }
    if (e.which === 40) {
      // down
      item.afterId && this.setState({ activeId: item.afterId })
    }
    if (e.which === 46) {
      // delete
      if (item.content) return
      this.setState({ data: deletedData(item, data) })
      // 下にフォーカス
      item.afterId && this.setState({ activeId: item.afterId })
    }
    if (e.which === 8) {
      // backspace
      if (item.content) return
      e.preventDefault()
      this.setState({ data: deletedData(item, data) })
      // 上にフォーカス
      this.setState({
        activeId: item.beforeId ? item.beforeId : item.afterId,
      })
    }
  }
  handleChangeText = (data: any, item: any) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target
    this.setState({
      data: {
        ...data,
        [item.id]: { ...item, content: value },
      },
    })
  }
  handleChangeSelectSelfReaction = (data: any, item: any) => (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { value } = e.target
    if (item.selfReactionId.some((id: number) => id === Number(value))) {
      return
    }
    this.setState({
      data: {
        ...data,
        [item.id]: {
          ...item,
          selfReactionId: item.selfReactionId.concat(value),
        },
      },
    })
  }
  handleChangeSelectCategory = (data: any, item: any) => (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { value } = e.target
    if (item.categoryId.some((id: number) => id === Number(value))) {
      return
    }
    this.setState({
      data: {
        ...data,
        [item.id]: {
          ...item,
          categoryId: item.categoryId.concat(value),
        },
      },
    })
  }
  // #endregion

  private initNote() {
    const data = {} as any
    for (let i = 1; i <= 1000; i++) {
      data[i] = {
        id: Number(i),
        content: `markdown note${i}`,
        beforeId: Number(i - 1),
        afterId: Number(i + 1),
        categoryId: [1],
        selfReactionId: [1],
        updatedTime: getNowYMD(),
      }
    }
    return data
  }

  // #region render
  render() {
    const { activeId, data } = this.state
    return (
      <>
        {!_.isEmpty(data) &&
          createNoteArr(data).map((item) => {
            return (
              <div
                key={item.id}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <div style={{ flexGrow: 1 }}>
                  {item.updatedTime}
                  {item.selfReactionId.map((id: number) =>
                    displaySelfReaction(id)
                  )}
                  <select
                    value=""
                    onChange={this.handleChangeSelectSelfReaction(data, item)}
                  >
                    <option value=""></option>
                    {Object.keys(selfReactions).map((key: any) => (
                      <option value={key} key={key}>
                        {selfReactions[key]}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flexGrow: 3 }}>
                  {activeId === item.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={item.content}
                      // NG: persistすると入力できない?
                      // value=item.contentと_.debounceが共存できない?
                      // onChange={_.flowRight(
                      //   _.debounce((e: any) => {
                      //     this.handleOnChange(e, item)
                      //   }, 300),
                      //   this.persistEvent
                      // )}
                      // NG: debounceでエラーが出てどうしていいかわからない
                      // This synthetic event is reused for performance reasons.
                      // A component is changing a controlled input of type text to be uncontrolled.
                      // [参考](https://stackoverflow.com/questions/35435074/using-debouncer-with-react-event)
                      onChange={this.handleChangeText(data, item)}
                      onKeyDown={this.handleKeyDownOnText(data, item)}
                    />
                  ) : (
                    <div
                      onClick={() => {
                        this.setState({ activeId: item.id })
                      }}
                      style={{ minHeight: "1rem" }}
                    >
                      {item.content}
                    </div>
                  )}
                </div>
                <div style={{ flexGrow: 1 }}>
                  {item.categoryId.map((id: number, index: number) => (
                    <React.Fragment key={id}>
                      {index !== 0 && ", "}
                      {displayCategory(id)}
                    </React.Fragment>
                  ))}
                  <select
                    value=""
                    onChange={this.handleChangeSelectCategory(data, item)}
                  >
                    <option value=""></option>
                    {Object.keys(categories).map((key: any) => (
                      <option value={key} key={key}>
                        {categories[key]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )
          })}
      </>
    )
  }
  // #endregion
}
