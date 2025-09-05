// @ts-ignore;
import React, { useState, useEffect, memo } from 'react';
// @ts-ignore;
import { Badge } from '@/components/ui';
// @ts-ignore;
import { Clock } from 'lucide-react';

export const CountdownTimer = memo(({
  minutes = 15,
  onComplete,
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  return <Badge variant="warning" className={`flex items-center gap-1 ${className}`}>
      <Clock className="w-4 h-4" />
      {formatTime(timeLeft)}
    </Badge>;
});