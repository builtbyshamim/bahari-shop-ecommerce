import { tagTypes } from '../tag-types';
import { baseApi } from './baseApi';
const AUTH_URL = '/auth';
const USERS_URL = '/users';

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    adminLogin: build.mutation({
      query: (data) => ({
        url: `${AUTH_URL}/admin-login`,
        method: 'POST',
        data,
      }),
      invalidatesTags: [tagTypes.auth],
    }),
    registration: build.mutation({
      query: (data) => ({
        url: `${AUTH_URL}/register`,
        method: 'POST',
        data,
      }),
      invalidatesTags: [tagTypes.auth],
    }),
    createCompany: build.mutation({
      query: (formData) => ({
        url: `${AUTH_URL}/create-company`,
        method: 'POST',
        data: formData,
        contentType: 'multipart/form-data',
      }),
      invalidatesTags: [tagTypes.auth],
    }),

    fetchMe: build.query({
      query: () => ({
        url: `${USERS_URL}/profile`,
        method: 'GET',
      }),
      providesTags: [tagTypes.auth],
    }),

    updateProfile: build.mutation({
      query: (data) => ({
        url: `${USERS_URL}/update-profile`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: [tagTypes.auth],
    }),

    forgotPassword: build.mutation({
      query: (data) => ({
        url: `${AUTH_URL}/forgot-password`,
        method: 'POST',
        data,
      }),
      invalidatesTags: [tagTypes.auth],
    }),
    verifyOtp: build.mutation({
      query: (data) => ({
        url: `${AUTH_URL}/verify-otp`,
        method: 'POST',
        data,
      }),
      invalidatesTags: [tagTypes.auth],
    }),
    setNewPassword: build.mutation({
      query: (data) => ({
        url: `${AUTH_URL}/reset-password`,
        method: 'POST',
        data,
      }),
      invalidatesTags: [tagTypes.auth],
    }),
    changeNewPassword: build.mutation({
      query: (data) => ({
        url: `${USERS_URL}/change-password`,
        method: 'PATCH',
        data,
      }),
      invalidatesTags: [tagTypes.auth],
    }),

    saveFcmToken: build.mutation({
      query: (data: { fcmToken: string }) => ({
        url: '/notifications/fcm-token',
        method: 'POST',
        data,
      }),
    }),

    removeFcmToken: build.mutation({
      query: () => ({
        url: '/notifications/fcm-token',
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useFetchMeQuery,
  useUpdateProfileMutation,
  useForgotPasswordMutation,
  useVerifyOtpMutation,
  useSetNewPasswordMutation,
  useCreateCompanyMutation,
  useChangeNewPasswordMutation,
  useSaveFcmTokenMutation,
  useRemoveFcmTokenMutation,
} = authApi;
