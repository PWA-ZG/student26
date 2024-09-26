import {useEffect, useRef, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {nameForCode} from "@/util/weatherCodeMapping";
import moment from "moment/moment";
import Image from "next/image";

export function Everything() {
    const [previousSearches, setPreviousSearches] = useState(JSON.parse(localStorage.getItem('previousSearches') ?? '[]') as {
        name: string,
        id: number,
        data: any
    }[])
    useEffect(() => {
        console.log(previousSearches)
        if (!localStorage) return;
        if (!selectedId && previousSearches.length) {
            setSelectedId(previousSearches[0].id)
        }
        localStorage.setItem('previousSearches', JSON.stringify(previousSearches))
        console.log('saved')
    }, [previousSearches])
    const [searching, setSearching] = useState(false)
    const [videoType, setVideoType] = useState('sunnyClear')
    const [delayedSearchingDissapear, setDelayedSearchingDissapear] = useState(false)
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearching(delayedSearchingDissapear);
        }, !delayedSearchingDissapear ? 300 : 0);
        return () => {
            clearTimeout(handler);
        };
    }, [delayedSearchingDissapear]);
    const [searchResults, setSearchResults] = useState([] as { name: string, id: number }[])
    const inputRef = useRef<HTMLInputElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [delayedSearchTerm, setDelayedSearchTerm] = useState('');
    const [selectedId, setSelectedId] = useState(null as number | null);
    const [weatherData, setWeatherData] = useState(null as any);
    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchTerm(delayedSearchTerm);
        }, 300);
        return () => {
            clearTimeout(handler);
        };
    }, [delayedSearchTerm]);

    const requestGeolocation = async () => {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        const coordinates = `${position.coords.latitude},${position.coords.longitude}`;
        setDelayedSearchTerm(coordinates);
        inputRef.current?.focus();
    }
    const pickLocation = (result: { name: string, id: number }) => () => {
        setDelayedSearchTerm('');
        setSelectedId(result.id);
    }

    useEffect(() => {
        if (searchTerm && searchTerm.length > 2) {
            fetch(`/api/search/${searchTerm}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        alert(JSON.stringify(data.error, null, 2));
                        return;
                    }
                    setSearchResults(data);
                });
        } else {
            setSearchResults(previousSearches);
        }
    }, [searchTerm])

    useEffect(() => {
        const sId = selectedId;
        if (sId) {
            setWeatherData(null)
            setTimeout(() => {
                const cachedResult = previousSearches.find((r: any) => r.id === sId)
                if (cachedResult && cachedResult.data) {
                    setWeatherData(cachedResult.data);
                }
                fetch(`/api/forecast/${sId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.error) {
                            alert(JSON.stringify(data.error, null, 2));
                            return;
                        }
                        setWeatherData(data);
                        const result = {
                            id: sId, name: data.location.name, data: {
                                ...data,
                                location: {
                                    ...data.location,
                                    name: `${data.location.name} (offline)`
                                }
                            }
                        };
                        setPreviousSearches([result, ...previousSearches.filter((r: any) => r.id !== result.id)])
                    });
            }, 700);
        }
        ;
    }, [selectedId]);

    useEffect(() => {
        if (weatherData) {
            setVideoType(nameForCode(weatherData.current.condition.code))
        }
    }, [weatherData]);

    const shareLocation = async () => {
        const url = window.location.href;
        if (!navigator.share) {
            try {
                await navigator.clipboard.writeText(url);
                alert('Your browser does not support share window, link copied to clipboard.');
            } catch (err) {
                alert('Your browser does not support share window, and clipboard write failed.');
            }
            return;
        }
        try {
            await navigator.share({
                url: url,
            });
        } catch (err) {
            // alert(err);
            // alert(err);
        }
    }

    useEffect(() => {
        function randomNotification() {
            const notifTitle = "Severe weather mock alert"
            const notifBody = `Thunderstorm warning in your area!`;
            const options = {
                body: notifBody,
            };
            setTimeout(() => {
                new Notification(notifTitle, options);
            }, 7000);
        }

        Notification.requestPermission().then((result) => {
            if (result === "granted") {
                randomNotification();
            }
        });
    }, []);

    const current_epoch = Math.round((new Date()).getTime() / 1000);

    return (
        <>
            {<video
                className={"absolute z-[-1] min-w-full min-h-full object-cover transition-opacity ease-in-out duration-700 " + (weatherData ? "opacity-100" : "opacity-0")}
                autoPlay loop muted
                src={`/weatherScenes/${videoType}.mp4`}
            />}
            <main className="flex min-h-screen flex-col items-center justify-between p-24">
                <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
                    <div className="relative w-full max-w-xl">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" aria-hidden="true"
                                 xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M8 15.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Zm11.707 2.793-4-4a1 1 0 0 0-1.414 1.414l4 4a1 1 0 0 0 1.414-1.414Z"/>
                            </svg>
                        </div>
                        <input type="text" id="voice-search" onBlur={() => setDelayedSearchingDissapear(false)}
                               onFocus={() => setDelayedSearchingDissapear(true)}
                               className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5"
                               placeholder="Search City, US Zipcode, UK Postcode, IP address ..."
                               onChange={(e) => setDelayedSearchTerm(e.target.value)}
                               value={delayedSearchTerm}
                               ref={inputRef}
                               required/>
                        <button type="button" className="absolute inset-y-0 end-0 flex items-center pe-3"
                                onClick={requestGeolocation}>
                            <svg className="w-4 h-4 text-gray-500 hover:text-gray-900 "
                                 xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="m7.164 3.805-4.475.38L.327 6.546a1.114 1.114 0 0 0 .63 1.89l3.2.375 3.007-5.006ZM11.092 15.9l.472 3.14a1.114 1.114 0 0 0 1.89.63l2.36-2.362.38-4.475-5.102 3.067Zm8.617-14.283A1.613 1.613 0 0 0 18.383.291c-1.913-.33-5.811-.736-7.556 1.01-1.98 1.98-6.172 9.491-7.477 11.869a1.1 1.1 0 0 0 .193 1.316l.986.985.985.986a1.1 1.1 0 0 0 1.316.193c2.378-1.3 9.889-5.5 11.869-7.477 1.746-1.745 1.34-5.643 1.01-7.556Zm-3.873 6.268a2.63 2.63 0 1 1-3.72-3.72 2.63 2.63 0 0 1 3.72 3.72Z"/>
                            </svg>
                        </button>
                        {weatherData &&
                            <button type="button" className="absolute inset-y-0 -end-12 flex items-center pe-3"
                                    onClick={shareLocation}
                            >
                                <svg className="w-6 h-6 text-gray-800" aria-hidden="true"
                                     xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="m5.953 7.467 6.094-2.612m.096 8.114L5.857 9.676m.305-1.192a2.581 2.581 0 1 1-5.162 0 2.581 2.581 0 0 1 5.162 0ZM17 3.84a2.581 2.581 0 1 1-5.162 0 2.581 2.581 0 0 1 5.162 0Zm0 10.322a2.581 2.581 0 1 1-5.162 0 2.581 2.581 0 0 1 5.162 0Z"/>
                                </svg>
                            </button>}


                        <div id="dropdown-search"
                             className={`mt-4${!searching || !searchResults.length ? ' hidden' : ''} z-10 absolute bg-white divide-y divide-gray-100 rounded-lg shadow w-44`}>
                            <ul className="py-2 text-sm text-gray-700" aria-labelledby="states-button">
                                {searchResults.map((result, index) => (
                                    <li key={index}>
                                        <button type="button"
                                                onClick={pickLocation(result)}
                                                className="inline-flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            <div className="inline-flex items-center">
                                                {result.name}
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {weatherData
                    ? (
                        <div className='mt-4 w-full items-center justify-between font-mono text-sm lg:flex'>
                            <div
                                className="w-full max-w-screen-sm bg-white p-10 rounded-xl ring-8 ring-white ring-opacity-40">
                                <div className="flex justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-6xl font-bold">{weatherData.current.temp_c}°</span>
                                        <span
                                            className="font-semibold mt-1 text-gray-500">{weatherData.location.name}<br/>
                                    (Last updated: {moment(weatherData.current.last_updated).fromNow()})</span>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <Image
                                            src={`/weatherIcons/${weatherData.current.condition.icon}`}
                                            alt={weatherData.current.condition.text}
                                            width={128}
                                            height={128}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between mt-12">
                                    {weatherData.forecast.forecastday[0].hour.filter((h: any) => current_epoch < h.time_epoch).slice(0, 5).map((hour: any, index: any) => (
                                        <div className="flex flex-col items-center" key={index}>
                                            <span className="font-semibold text-lg">{hour.temp_c}°</span>
                                            <Image
                                                src={`/weatherIcons/${hour.condition.icon}`}
                                                alt={hour.condition.text}
                                                width={64}
                                                height={64}
                                            />
                                            <span
                                                className="font-semibold mt-1 text-sm">{hour.time.split(' ')[1]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div
                                className="flex flex-col space-y-6 w-full max-w-screen-sm bg-white p-10 rounded-xl ring-8 ring-white ring-opacity-40">
                                {weatherData.forecast.forecastday.map((day: any, index: any) => (
                                    <div className="flex justify-between items-center" key={index}>
                                        <span
                                            className="font-semibold text-lg w-1/4">{moment(day.date).format('ddd, DD MMM')}</span>
                                        <div className="flex items-center justify-end w-1/4 pr-10">
                                            <span className="font-semibold">{day.day.daily_chance_of_rain}%</span>
                                            <svg className="w-6 h-6 fill-current ml-1" viewBox="0 0 16 20"
                                                 version="1.1"
                                                 xmlns="http://www.w3.org/2000/svg">
                                                <g transform="matrix(1,0,0,1,-4,-2)">
                                                    <path
                                                        d="M17.66,8L12.71,3.06C12.32,2.67 11.69,2.67 11.3,3.06L6.34,8C4.78,9.56 4,11.64 4,13.64C4,15.64 4.78,17.75 6.34,19.31C7.9,20.87 9.95,21.66 12,21.66C14.05,21.66 16.1,20.87 17.66,19.31C19.22,17.75 20,15.64 20,13.64C20,11.64 19.22,9.56 17.66,8ZM6,14C6.01,12 6.62,10.73 7.76,9.6L12,5.27L16.24,9.65C17.38,10.77 17.99,12 18,14C18.016,17.296 14.96,19.809 12,19.74C9.069,19.672 5.982,17.655 6,14Z"
                                                        style={{fillRule: "nonzero"}}/>
                                                </g>
                                            </svg>
                                        </div>
                                        <Image
                                            src={`/weatherIcons/${day.day.condition.icon}`}
                                            alt={day.day.condition.text}
                                            width={32}
                                            height={32}
                                        />
                                        <span
                                            className="font-semibold text-lg w-1/4 text-right">{day.day.mintemp_c}° / {day.day.maxtemp_c}°</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div
                            className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:lg:h-[360px] z-[-1]">
                            <Image
                                className="relative"
                                src="/assets/icons/transparentweather.png"
                                alt="NRPPZWeather Logo"
                                width={180}
                                height={180}
                                priority
                            />
                        </div>
                    )}
                <footer>NRPPZWeather</footer>
            </main>
        </>
    )
}
