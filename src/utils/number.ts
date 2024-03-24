const formatNumber = (number: number | string | null) => {
  if (!number) return '0';
  const parts = `${number}`.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const strNumber = parts.join(',');
  if (parts[parts.length - 1] === '') {
    return strNumber.substring(0, strNumber.length - 1);
  }
  // end
  return strNumber;
};
export { formatNumber };
