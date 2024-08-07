"use client";

import { useState, useEffect, useRef, useReducer } from "react";
import Timer, { TimerRef } from "@/app/ui/timer";
import { TrashIcon } from "@heroicons/react/24/outline";
import { Data, Action } from "@/app/models";

function reducer(state: Data, { payload }: Action): Data {
  switch (payload.type) {
    case "SET_RESPONSE_MODE":
      return { ...state, responseMode: payload.data };
    case "SET_IS_RECORDING":
      return { ...state, recording: payload.data };
    case "SET_RESPONSE":
      return { ...state, response: payload.data };
    case "SET_AUDIO_URL":
      return { ...state, audioUrl: payload.data };
  }
}
export default function useAssistant() {
  const data: Data = {
    responseMode: "text",
    recording: false,
    response: "",
    audioUrl: "",
  };
  const [state, dispatch] = useReducer(reducer, data);
  const { responseMode, recording, response, audioUrl } = state;
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<TimerRef>(null);

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

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
          dispatch({
            payload: {
              data: audioUrl,
              type: "SET_AUDIO_URL",
            },
          });
          audioChunksRef.current = [];
          setTimeout(() => {
            audioRef.current?.play();
          }, 3000);
        } else {
          dispatch({
            payload: {
              data: "This is a textual response.",
              type: "SET_RESPONSE",
            },
          });
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
          dispatch({
            payload: { data: true, type: "SET_IS_RECORDING" },
          });
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      console.log("browser not supported!");
    }
  };

  const stopRecording = () => {
    dispatch({
      payload: { data: false, type: "SET_IS_RECORDING" },
    });
  };

  const clearData = () => {
    dispatch({
      payload: {
        data: "",
        type: "SET_AUDIO_URL",
      },
    });
    dispatch({
      payload: {
        data: "",
        type: "SET_RESPONSE",
      },
    });
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
            onChange={() => {
              dispatch({
                payload: { type: "SET_RESPONSE_MODE", data: "text" },
              });
            }}
          />
          Text
        </label>
        <label>
          <input
            type="radio"
            name="responseMode"
            value="audio"
            checked={responseMode === "audio"}
            onChange={() => {
              dispatch({
                payload: { type: "SET_RESPONSE_MODE", data: "audio" },
              });
            }}
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
