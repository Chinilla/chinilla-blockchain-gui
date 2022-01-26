import { createApi } from '@reduxjs/toolkit/query/react';
import chinillaLazyBaseQuery from './chinillaLazyBaseQuery';

export const baseQuery = chinillaLazyBaseQuery({});

export default createApi({
  reducerPath: 'chinillaApi',
  baseQuery,
  endpoints: () => ({}),
});
