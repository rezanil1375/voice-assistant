"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";

const Chronometer = forwardRef((props, ref) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else if (!isRunning && time !== 0) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRunning, time]);
  const handleTime = (e: boolean) => {
    setIsRunning(e);
  };
  const resetTime = () => {
    setTime(0);
  };
  useImperativeHandle(ref, () => {
    return {
      handleTime,
      resetTime,
    };
  });
  const formatTime = (time: number) => {
    const milliseconds = `0${Math.floor((time % 1000) / 10)}`.slice(-2);
    const seconds = `0${Math.floor((time / 1000) % 60)}`.slice(-2);
    const minutes = `0${Math.floor((time / 60000) % 60)}`.slice(-2);
    return `${minutes} : ${seconds} : ${milliseconds}`;
  };

  return (
    <div>
      <div className="flex items-center justify-center">{formatTime(time)}</div>
    </div>
  );
});

export default Chronometer;
