import { Types } from 'mongoose';

export const delay = async (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

const getSelectData = (select: string[]) => {
  return Object.fromEntries(select.map(item => [item, 1]));
};
const getUnSelectData = (select: string[]) => {
  return Object.fromEntries(select.map(item => [item, 0]));
};
const removeUndefinedValues = (obj: object) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => {
      if (v !== undefined && v !== null) {
        return true;
      } else {
        return false;
      }
    }),
  );
};
const convertToObjectId = (id: string) => {
  return new Types.ObjectId(id);
};

export {
  getSelectData,
  getUnSelectData,
  removeUndefinedValues,
  convertToObjectId,
};
