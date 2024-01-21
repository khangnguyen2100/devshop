const getSelectData = (select: string[]) => {
  return Object.fromEntries(select.map(item => [item, 1]));
};
const getUnSelectData = (select: string[]) => {
  return Object.fromEntries(select.map(item => [item, 0]));
};

export { getSelectData, getUnSelectData };
