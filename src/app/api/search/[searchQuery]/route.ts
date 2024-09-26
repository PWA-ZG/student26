import {API_KEY} from "@/util/config";

export const GET = async (req: Request, {params}: { params: {searchQuery: string} }) => {
    const searchQuery = params.searchQuery;
    console.log(`https://api.weatherapi.com/v1/search.json?key=${API_KEY}q=${searchQuery}`);
    const response = await fetch(`https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${searchQuery}`);
    const data = await response.json();
    return Response.json(data);
}
