import { getNowYMD } from "../utils/Time"

export const convertNoteObjectToArray = (data: any) => {
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

export const recreateNoteWithDeleteingRow = (item: any, data: any) => {
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

  return {
    ...obj,
    ...beforeRow,
    ...afterRow,
  }
}

export const recreateNoteWithAddingRow = (
  data: any,
  item: any,
  newId: number
) => {
  const currentRowAfterId = item.afterId
  // 1. 現在行の下に新規行が作成される
  // afterIdを新規のidに変更
  const currentRow = {
    [item.id]: { ...item, afterId: newId },
  }
  // 2. 新規作成(beforeId: 現在行のid, afterId: 現在行の元afterId)
  const newRow = {
    [newId]: createNote(newId, item.id, currentRowAfterId),
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
  return {
    ...data,
    ...currentRow,
    ...newRow,
    ...afterRow,
  }
}

const createNote = (id: number, beforeId: number, afterId?: number) => {
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
