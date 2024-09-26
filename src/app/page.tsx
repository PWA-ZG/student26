'use client';

import {useEffect, useRef, useState} from "react";
import {Everything} from "@/components/everything";

export default function Home() {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);
    return isClient ? <Everything/> : <></>;
}
