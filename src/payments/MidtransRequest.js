const midtransClient = require('midtrans-client');
const { midtransServerKey, midtransClientKey } = require('../config/payments');

class MidtransRequest {
    constructor({ payment_type, order_id, amount, item_details, customer_details }) {
        this.core = new midtransClient.CoreApi({
            isProduction: false,
            serverKey: midtransServerKey,
            clientKey: midtransClientKey
        })
        this.payment_type = payment_type
        this.order_id = order_id
        this.amount = amount
        this.item_details = item_details
        this.customer_details = customer_details
    }
}

module.exports = MidtransRequest