import React, { Component } from "react"
import { createSelector } from "reselect"
import _ from "lodash"

// #region util
function getNowYMD() {
  var dt = new Date()
  var y = dt.getFullYear()
  var m = ("00" + (dt.getMonth() + 1)).slice(-2)
  var d = ("00" + dt.getDate()).slice(-2)
  var result = y + "/" + m + "/" + d
  return result
}
// #endregion

const displayNote = (data: any) => {
  const count = Object.keys(data).length
  const arr = new Array(count)
  for (let i = 0; i < count; i++) {
    if (i === 0) {
      arr[i] = Object.values(data).filter(
        (item: any) => Number(item.beforeId) === 0
      )[0]
      continue
    }
    arr[i] = Object.values(data).filter(
      (item: any) => item.id === arr[i - 1].afterId
    )[0]
  }
  return arr
}

const newData = (id: number, beforeId: number, afterId?: number) => {
  return {
    id: id,
    content: "",
    beforeId: beforeId,
    afterId: afterId ? afterId : 0,
    categoryId: [],
    selfReactionId: [],
    updatedTime: getNowYMD(),
  }
}

const selfReaction = {
  1: "☆",
  2: "👍",
  3: "↓",
} as any
const displaySelfReaction = (id: number) => {
  return selfReaction[id]
}

const category = {
  1: "健康",
  2: "食事",
} as any
const displayCategory = (id: number) => {
  return category[id]
}

export default class NotePage extends Component {
  state: any = {
    activeId: 1,
    data: this.initNote(),
  }
  persistEvent = (e: any) => {
    e.persist()
    e.preventDefault()
    return e
  }

  handleOnChange = (e: any, item: any) => {
    const { data } = this.state
    this.setState({
      data: {
        ...data,
        [item.id]: { ...item, content: e.target?.value },
      },
    })
  }
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

  private handleKeyDownOnText(
    data: any,
    item: any
  ): ((event: React.KeyboardEvent<HTMLInputElement>) => void) | undefined {
    return (e) => {
      if (e.which === 13) {
        e.preventDefault()
        const newId =
          Math.max.apply(
            null,
            Object.keys(data).map((key) => Number(key))
          ) + 1
        const currentRowAfterId = item.afterId
        // 1. 現在行の下に新規行が作成される
        // afterIdを新規のidに変更
        const currentRow = {
          [item.id]: { ...item, afterId: newId },
        }
        // 2. 新規作成(beforeId: 現在行のid, afterId: 現在行の元afterId)
        const newRow = {
          [newId]: newData(newId, item.id, currentRowAfterId),
        }
        // 3. afterIdの行が持つbeforeIdを新規のidに変更
        const afterRow = currentRowAfterId
          ? {
              [currentRowAfterId]: {
                ...data[currentRowAfterId],
                beforeId: newId,
              },
            }
          : {}
        this.setState({
          data: {
            ...data,
            ...currentRow,
            ...newRow,
            ...afterRow,
          },
          activeId: newId,
        })
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

        this.deleteRow(item, data)
        // 下
        item.afterId && this.setState({ activeId: item.afterId })
      }

      if (e.which === 8) {
        // backspace
        if (item.content) return

        e.preventDefault()
        this.deleteRow(item, data)
        // 上
        //item.beforeId && this.setState({ activeId: item.beforeId })
        this.setState({
          activeId: item.beforeId ? item.beforeId : item.afterId,
        })
      }
    }
  }

  private deleteRow(item: any, data: any) {
    const beforeRow = item.beforeId
      ? {
          [item.beforeId]: {
            ...data[item.beforeId],
            afterId: item.afterId,
          },
        }
      : {}
    const afterRow = item.afterId
      ? {
          [item.afterId]: {
            ...data[item.afterId],
            beforeId: item.beforeId,
          },
        }
      : {}
    const { [item.id]: hoge, ...obj } = data
    this.setState({
      data: {
        ...obj,
        ...beforeRow,
        ...afterRow,
      },
    })
  }

  private handleChangeText(
    data: any,
    item: any
  ): ((event: React.ChangeEvent<HTMLInputElement>) => void) | undefined {
    return (e: any) => {
      const { value } = e.target
      this.setState({
        data: {
          ...data,
          [item.id]: { ...item, content: value },
        },
      })
    }
  }

  private handleChangeSelectSelfReaction(
    item: any,
    data: any
  ): ((event: React.ChangeEvent<HTMLSelectElement>) => void) | undefined {
    return (e: any) => {
      const { value } = e.target
      if (item.selfReactionId.some((id: number) => id === Number(value))) {
        return
      }
      this.setState({
        data: {
          ...data,
          [item.id]: {
            ...item,
            ...{
              selfReactionId: item.selfReactionId.concat(value),
            },
          },
        },
      })
    }
  }
  private handleChangeSelectCategory(
    item: any,
    data: any
  ): ((event: React.ChangeEvent<HTMLSelectElement>) => void) | undefined {
    return (e: any) => {
      const { value } = e.target
      if (item.categoryId.some((id: number) => id === Number(value))) {
        return
      }
      this.setState({
        data: {
          ...data,
          [item.id]: {
            ...item,
            ...{
              categoryId: item.categoryId.concat(value),
            },
          },
        },
      })
    }
  }

  // #region render
  render() {
    const { activeId, data } = this.state
    return (
      <>
        {!_.isEmpty(data) &&
          displayNote(data).map((item) => {
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
                    onChange={this.handleChangeSelectSelfReaction(item, data)}
                  >
                    <option value=""></option>
                    {Object.keys(selfReaction).map((key: any) => (
                      <option value={key} key={key}>
                        {selfReaction[key]}
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
                    onChange={this.handleChangeSelectCategory(item, data)}
                  >
                    <option value=""></option>
                    {Object.keys(category).map((key: any) => (
                      <option value={key} key={key}>
                        {category[key]}
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
