"use client";
import { useState, useEffect } from "react";

export function useTypingAnimation(text: string, speed = 60, startDelay = 300) {
    const [displayed, setDisplayed] = useState("");
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const delay = setTimeout(() => setStarted(true), startDelay);
        return () => clearTimeout(delay);
    }, [startDelay]);

    useEffect(() => {
        if (!started) return;
        if (displayed.length >= text.length) return;
        const t = setTimeout(() => {
            setDisplayed(text.slice(0, displayed.length + 1));
        }, speed);
        return () => clearTimeout(t);
    }, [displayed, text, speed, started]);

    return displayed;
}
