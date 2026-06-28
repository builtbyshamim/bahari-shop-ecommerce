import { axiosBaseQuery } from "@/helpers/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { tagTypesList } from "./tag-types";

export const baseApi = createApi({
    reducerPath: "baseApi",
    baseQuery: axiosBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
    }),
    endpoints: () => ({}),
    tagTypes: tagTypesList,
});
