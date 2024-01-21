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

export { TPagination, TPaginationQuery };
