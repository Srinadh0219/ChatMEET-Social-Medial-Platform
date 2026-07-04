// src/components/CountdownTimer.tsx
import React, { useEffect, useState } from 'react';

interface Props {
  seconds: number;
}

const CountdownTimer: React.FC<Props> = ({ seconds }) => {
  const [time, setTime] = useState(seconds);

  useEffect(() => {
    if (time <= 0) return;
    const interval = setInterval(() => {
      setTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [time]);

  const mins = Math.floor(time / 60)
    .toString()
    .padStart(2, '0');
  const secs = (time % 60).toString().padStart(2, '0');

  return (
    <span className="countdown-timer" style={{ fontWeight: '600' }}>
      {mins}:{secs}
    </span>
  );
};

export default CountdownTimer;
