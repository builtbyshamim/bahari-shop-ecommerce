// redux/api/userApi.ts
import { baseApi } from '../baseApi';
import { tagTypes } from '../tag-types';

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    registerUser: build.mutation({
      query: (data) => ({
        url: `/users/register`,
        method: 'POST',
        data,
      }),
      invalidatesTags: [tagTypes.auth],
    }),

    loginUser: build.mutation({
      query: (data) => ({
        url: `/auth/user-login`,
        method: 'POST',
        data,
      }),
      invalidatesTags: [tagTypes.auth],
    }),

    getProfile: build.query({
      query: () => ({
        url: `/users/profile`,
        method: 'GET',
      }),
      providesTags: [tagTypes.user], // auth নয়, user tag
    }),

    updateProfile: build.mutation({
      query: (data) => ({
        url: `/users/update-profile`,
        method: 'PATCH', // ✅ POST থেকে PATCH
        data,
      }),
      invalidatesTags: [tagTypes.user],
    }),

    changePassword: build.mutation({
      query: (data) => ({
        url: `/users/change-password`,
        method: 'PATCH',
        data,
      }),
    }),

    saveFcmToken: build.mutation({
      query: (data: { fcmToken: string }) => ({
        url: `/notifications/fcm-token`,
        method: 'POST',
        data,
      }),
    }),

    removeFcmToken: build.mutation({
      query: () => ({
        url: `/notifications/fcm-token`,
        method: 'DELETE',
      }),
    }),

    googleLogin: build.mutation({
      query: (data: { accessToken: string }) => ({
        url: `/auth/google`,
        method: 'POST',
        data,
      }),
      invalidatesTags: [tagTypes.auth],
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useSaveFcmTokenMutation,
  useRemoveFcmTokenMutation,
  useGoogleLoginMutation,
} = userApi;
