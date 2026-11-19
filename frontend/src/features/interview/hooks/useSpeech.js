import { useState, useEffect, useRef, useCallback } from "react";

/**
 * @description Custom hook for cross-browser Web Speech API (Text-to-Speech)
 */
export const useSpeech = () => {
    const [speakingId, setSpeakingId] = useState(null);
    const [isSupported, setIsSupported] = useState(false);
    const utteranceRef = useRef(null);

    useEffect(() => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            setIsSupported(true);
        }

        return () => {
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const stop = useCallback(() => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
        setSpeakingId(null);
    }, []);

    const speak = useCallback(
        (text, id) => {
            if (typeof window === "undefined" || !("speechSynthesis" in window)) {
                return;
            }

            // Toggle off if currently speaking the exact same text
            if (speakingId === id) {
                stop();
                return;
            }

            // Stop any ongoing utterance
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.95;
            utterance.pitch = 1.0;

            // Pick an English voice if available
            const voices = window.speechSynthesis.getVoices();
            if (voices && voices.length > 0) {
                const englishVoice =
                    voices.find(
                        (v) =>
                            v.lang.startsWith("en") &&
                            (v.name.includes("Natural") ||
                                v.name.includes("Google") ||
                                v.name.includes("Samantha"))
                    ) || voices.find((v) => v.lang.startsWith("en"));

                if (englishVoice) {
                    utterance.voice = englishVoice;
                }
            }

            utterance.onstart = () => {
                setSpeakingId(id);
            };

            utterance.onend = () => {
                setSpeakingId(null);
            };

            utterance.onerror = (e) => {
                if (e.error !== "interrupted" && e.error !== "canceled") {
                    console.warn("Speech synthesis error:", e);
                }
                setSpeakingId(null);
            };

            utteranceRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        },
        [speakingId, stop]
    );

    return {
        speak,
        stop,
        speakingId,
        isSupported,
    };
};
