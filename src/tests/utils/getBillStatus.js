const getBillStatus = (bill) => {
  if (bill.payments.some(payment => payment.status === 'paid')) {
    return 'paid'
  }

  if (bill.payments.some(payment => payment.status === 'pending')) {
    return 'pending'
  }

  return 'unpaid'
}

module.exports = getBillStatus