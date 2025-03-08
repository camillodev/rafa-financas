
import React, { useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatValue?: (value: number) => string;
}

const AnimatedNumber = ({ 
  value,
  duration = 2000,
  formatValue = (val) => val.toFixed(2),
}: AnimatedNumberProps) => {
  // Start at 0 and animate to the actual value
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    delay: 200,
    config: { duration },
  });

  return (
    <animated.span>
      {number.to((val) => formatValue(val))}
    </animated.span>
  );
};

export default AnimatedNumber;
