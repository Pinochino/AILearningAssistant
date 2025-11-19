import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { handleApi } from "../api/handleApi"

export function useGetUsers(searchTerm: string) {
  const {
    data: users,
    isLoading: userLoading,
    error: errorUser
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await handleApi({ 
        url: '/users/list', 
        method: 'GET', 
        withCredentials: true 
      })
      return res?.data.data
    },
    select: (data) => {
      if (!searchTerm) return data;
      const searchLower = searchTerm.toLowerCase();
      return data.filter((user: any) => 
        (user.username?.toLowerCase().includes(searchLower) ||
         user.name?.toLowerCase().includes(searchLower))
      );
    },
    placeholderData: keepPreviousData
  })

  return users
}

export function useFetchCountUserByUserRole() {

  const {
    data: userCount,
    isLoading: userCountLoading,
    error: userCountError
  } = useQuery({
    queryKey: ['studentCount'],
    queryFn: async () => {
      const res = await handleApi({ url: `/users/count-by-role/STUDENT`, method: 'GET' })
      return res.data
    }
  })

  return userCount
}

export function useFetchCountUserByTeacherRole() {
  const { data } = useQuery({
    queryKey: ['teacherCount'],
    queryFn: async () => {
      const res = await handleApi({ url: `/users/count-by-role/TEACHER`, method: 'GET' })
      const payload = res.data
      const value = (payload?.data ?? payload?.count) as number | undefined
      return typeof value === 'number' ? value : 0
    }
  })

  return data
}