"use client";

import { useState, useEffect, useRef, RefObject } from "react";
import Timer, { TimerRef } from "@/app/ui/timer";
import { TrashIcon } from "@heroicons/react/24/outline";

export default function useAssistant() {
  const [responseMode, setResponseMode] = useState<"text" | "audio">("text");
  const [recording, setRecording] = useState<boolean>(false);
  const [response, setResponse] = useState<string>("");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioUrl, setAudioUrl] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<TimerRef>(null);

  useEffect(() => {
    if (recording && mediaRecorder) {
      timerRef.current?.resetTime();
      timerRef.current?.handleTime(recording);
      mediaRecorder.start();
    } else if (!recording && mediaRecorder) {
      timerRef.current?.handleTime(recording);
      mediaRecorder.stop();
    }
  }, [recording, mediaRecorder]);

  useEffect(() => {
    if (mediaRecorder) {
      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        const data = event.data;
        audioChunksRef.current = [];
        audioChunksRef.current.push(data);
      };

      mediaRecorder.onstop = () => {
        if (responseMode === "audio") {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/wav",
          });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioUrl);
          audioChunksRef.current = [];
          setTimeout(() => {
            audioRef.current?.play();
          }, 3000);
        } else {
          setResponse("This is a textual response.");
        }
      };
    }
  }, [mediaRecorder, responseMode]);

  const startRecording = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const recorder = new MediaRecorder(stream);
          setMediaRecorder(recorder);
          setRecording(true);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      console.log("browser not supported!");
    }
  };

  const stopRecording = () => {
    setRecording(false);
  };

  const clearData = () => {
    setAudioUrl("");
    setResponse("");
    timerRef.current?.resetTime();
  };

  return (
    <div className="p-6 flex justify-around items-center flex-col bg-gray-800 rounded-lg w-2/5 h-screen mx-auto">
      <h1 className="text-2xl font-bold mb-4">Voice Assistant</h1>
      <div className="mb-4">
        <label className="mr-4">
          <input
            type="radio"
            name="responseMode"
            value="text"
            checked={responseMode === "text"}
            onChange={() => setResponseMode("text")}
          />
          Text
        </label>
        <label>
          <input
            type="radio"
            name="responseMode"
            value="audio"
            checked={responseMode === "audio"}
            onChange={() => setResponseMode("audio")}
          />
          Audio
        </label>
      </div>
      <button
        className="w-11 h-11 rounded-full border-2 border-white flex items-center justify-center"
        onClick={recording ? stopRecording : startRecording}
      >
        <div
          className={`transition-all ease-in duration-200 ${
            !recording
              ? "rounded-full w-9 h-9 bg-red-600 "
              : "rounded-sm w-5 h-5 bg-red-600 "
          }`}
        ></div>
      </button>
      <div className="flex justify-center items-center">
        <div
          className={`w-2 h-2 rounded-full mx-2 bg-red-500 ${
            recording && "animate-blink"
          }`}
        ></div>
        <Timer ref={timerRef} />
      </div>
      <button onClick={() => {}}>
        {(audioUrl || response) && (
          <TrashIcon onClick={clearData} className="w-5 md:w-6" />
        )}
      </button>
      {responseMode === "text" && response && (
        <p className="mt-4 text-lg">{response}</p>
      )}
      {responseMode === "audio" && audioUrl && (
        <audio ref={audioRef} src={audioUrl} controls>
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
}
