import {API_KEY} from "@/util/config";

export const GET = async (req: Request, {params}: { params: {locationId: string} }) => {
    const locationId = params.locationId;
    const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&days=3&q=id:${locationId}`);
    const data = await response.json();
    if (data?.current?.condition) {
        data.current.condition.icon = data.current.condition.icon.replace('//cdn.weatherapi.com/weather/64x64/', '')
    }
    (data?.forecast?.forecastday ?? []).forEach((day: any) => {
        if (day.day.condition) {
            day.day.condition.icon = day.day.condition.icon.replace('//cdn.weatherapi.com/weather/64x64/', '')
        }
        day.hour.forEach((hour: any) => {
            if (hour.condition) {
                hour.condition.icon = hour.condition.icon.replace('//cdn.weatherapi.com/weather/64x64/', '')
            }
        });
    });
    return Response.json(data);
}
