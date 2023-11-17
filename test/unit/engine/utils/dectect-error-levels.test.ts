import { expect } from 'chai'
import { detectErrorLevel } from '../../../../src/engine/utils'
import { ContentModelDivergedError } from '../../../../src/engine/errors'

describe('detectErrorLevels', () => {
  it("Should return level 'error' for an unknown error", () => {
    const unknownError = new Error('Unknown error')
    expect(detectErrorLevel(unknownError)).to.equal('error')
  })

  it("Should return level 'warn' for known error", () => {
    const error = new ContentModelDivergedError(['some-content-model'])
    expect(detectErrorLevel(error)).to.equal('warning')
  })
})
