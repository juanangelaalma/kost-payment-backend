const BillService = require('../../services/bill.service');
const RoomService = require('../../services/room.service');

require('dotenv').config()

class CreateBillJob {
  schedule = process.env.CREATE_BILL_SCHEDULE || '0 9 * * *';

  async task() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const rooms = await RoomService.getRoomsStartingFromToday(startOfDay)

    console.log(`Creating bills for ${rooms.length} rooms`)

    rooms.forEach(async (room) => {
      BillService.createBillUser(room.userId, process.env.COST_PER_ROOM, new Date())
    })
  }
}

module.exports = CreateBillJob;
