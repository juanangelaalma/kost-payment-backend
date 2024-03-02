const createApiResponse = require('../../utils/createApiResponse')

describe('createApiResponse.js', () => {
  it('should return success, data, message', () => {
    const response = createApiResponse(true, {
      name: 'John'
    }, 'Success')

    expect(response).toEqual({
      success: true,
      data: {
        name: 'John'
      },
      message: 'Success'
    })
  })
})