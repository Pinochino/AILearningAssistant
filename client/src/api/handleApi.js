import axiosClient from "./axiosClient.js"

const handleApi = ({ url, method = "GET", data, ...props }) => {
    return axiosClient({
        url,
        method,
        data,
        ...props
    })
}
export default handleApi