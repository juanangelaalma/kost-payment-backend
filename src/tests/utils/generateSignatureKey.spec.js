const generateSignatureKeyHash = require('../../utils/generateSignatureKey');

describe('generateSignatureKeyHas', () => {
  it('should return correct signature', () => {
    const orderId = 1285934739303
    const statusCode = 200
    const grossAmount = 10000

    const expectedSignature = '341cafc582e6f4496a6933059281c05590e3c8aaf5e294cbf026a57cc036aa9c2f514914264086786cce62f7f5b898a3c697f3ca1260e21f244adce003221e0d'
    const signatureKeyHas = generateSignatureKeyHash(orderId, statusCode, grossAmount)

    expect(signatureKeyHas).toEqual(expectedSignature)
  })
});