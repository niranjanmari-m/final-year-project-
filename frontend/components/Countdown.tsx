
import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';

interface CountdownProps {
  targetDate: string;
  primaryColor?: string;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate, primaryColor }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      
      if (isNaN(target)) return;

      const difference = target - now;
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {units.map((unit) => (
        <GlassCard key={unit.label} className="p-4 flex flex-col items-center justify-center space-y-1">
          <span className="text-2xl font-black text-blue-950 tracking-tighter tabular-nums">
            {unit.value.toString().padStart(2, '0')}
          </span>
          <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">
            {unit.label}
          </span>
        </GlassCard>
      ))}
    </div>
  );
};

export default Countdown;
