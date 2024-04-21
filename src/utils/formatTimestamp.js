const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);

  
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  const dayName = days[date.getDay()];
  const dateNumber = date.getDate();
  const monthName = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const formattedDate = `${dayName}, ${dateNumber} ${monthName} ${year} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} WIB`;

  return formattedDate;
}

module.exports = formatTimestamp;