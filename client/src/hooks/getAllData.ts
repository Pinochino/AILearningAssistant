import { useQuery } from "@tanstack/react-query";
import handleApi from "../api/handleApi";

type orderType = "asc" | "desc";

interface IGetAllData {
    url: string;
    search?: string;
    order?: orderType;
    limit?: number;
    skip?: number;
    sortBy?: string;
    page?: number;
}

export default function getAllData({
    url,
    limit,
    order,
    page,
    search,
    skip,
    sortBy,
}: IGetAllData) {
    const { isPending, error, data } = useQuery({
        queryKey: ['repoData'],
        queryFn: () =>
            handleApi({ url: `url?limit=${limit}?order=${order}?search=${search}?skip=${skip}?`, method: 'GET' })
    })

    if (isPending) return 'Loading...'

    if (error) return 'An error has occurred: ' + error.message
}
