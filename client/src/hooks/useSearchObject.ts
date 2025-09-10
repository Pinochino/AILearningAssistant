import { useSearchParams } from "react-router-dom";

export default function useSearchObject() {
    const [searchParams, setSearchParams] = useSearchParams();
    const searchParamsObject = Object.fromEntries([...searchParams]);
    
    return searchParamsObject;
}