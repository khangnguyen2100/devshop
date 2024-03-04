import { ObjectId } from 'mongoose';

type TPaginationQuery = {
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
  select?: string[];
  unSelect?: string[];
};
type TPagination = {
  page: number;
  limit: number;
  total: number;
};
type ObjectIdCustom = ObjectId | string;
type MongoTimestamps = {
  createdAt: string;
  updatedAt: string;
};

export { TPagination, TPaginationQuery, MongoTimestamps, ObjectIdCustom };
