import {
  recreateNoteWithAddingRow,
  recreateNoteWithDeleteingRow,
} from "../services/Note"

// const getFirstLineId = (lines: any) => {
//   const firstLine: any = Object.values(lines).filter((obj: any) => {
//     return obj.beforeId === 0
//   })[0]
//   return firstLine.id
// }

// const getNextLineId = (lines: any, currentId: number) => {
//   const nextLine: any = Object.values(lines).filter((obj: any) => {
//     return obj.id === currentId
//   })[0]
//   return nextLine.id
// }

const getLastLineId: (lines: any, lineId: number) => number | number = (
  lines: any,
  lineId: number
) => {
  const line = lines[lineId]
  if (line.afterId) {
    return getLastLineId(lines, line.afterId)
  }
  return lineId
}

const lines = {
  1: {
    id: 1,
    beforeId: 2,
    afterId: 3,
    content: "hello 1",
    categories: [],
  },
  2: {
    id: 2,
    beforeId: 0,
    afterId: 1,
    content: "hello 2",
    categories: [],
  },
  3: {
    id: 3,
    beforeId: 1,
    afterId: 0,
    content: "hello 3",
    categories: [],
  },
}

describe("test: ", () => {
  const firstLineId = 2
  const lastLineId = getLastLineId(lines, firstLineId)
  it("lastLineId is ...", () => {
    expect(lastLineId).toBe(3)
  })
  const addedLineId = lastLineId + 1
  const linesAfterAdded = recreateNoteWithAddingRow(
    lines,
    lines[firstLineId],
    addedLineId
  )
  it("created newLine to 2", () => {
    expect(linesAfterAdded[addedLineId].beforeId).toBe(2)
    expect(linesAfterAdded[addedLineId].afterId).toBe(1)
  })
  const linesAfterDeleted = recreateNoteWithDeleteingRow(
    linesAfterAdded[firstLineId],
    linesAfterAdded
  )
  it("deleted firstLine", () => {
    expect(linesAfterDeleted[addedLineId].beforeId).toBe(0)
    expect(linesAfterDeleted[addedLineId].afterId).toBe(1)
  })
})
