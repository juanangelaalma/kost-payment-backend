const formatTimestamp = require("../../utils/formatTimestamp");

describe('formatTimestamp', () => {
  it('should return formatted timestamp', () => {
    const timestamp = new Date('2024-04-21T14:00:00Z');

    // mengatur ke default UTC
    const defaultTime = timestamp.getUTCHours() - 7;
    timestamp.setUTCHours(defaultTime);

    const result = formatTimestamp(timestamp);

    expect(result).toEqual('Minggu, 21 April 2024 14:00 WIB');
  });

  it('should return formatted timestamp', () => {
    const timestamp = new Date('1999-04-21T08:10:00Z');

    // mengatur ke default UTC
    const defaultTime = timestamp.getUTCHours() - 7;
    timestamp.setUTCHours(defaultTime);

    const result = formatTimestamp(timestamp);

    expect(result).toEqual('Rabu, 21 April 1999 08:10 WIB');
  });
});