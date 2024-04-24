const parseMonth = (month) => {
  const months = [
    'Januari', 'Februari', 'Maret', 'April',
    'Mei', 'Juni', 'Juli', 'Agustus',
    'September', 'Oktober', 'November', 'Desember'
  ]

  return months[month - 1]
}

module.exports = parseMonth