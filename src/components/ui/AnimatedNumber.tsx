
import React from 'react';
import { useSpring, animated } from '@react-spring/web';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatValue?: (value: number) => string;
  formatter?: (value: number) => string; // Add this line to support both prop names
}

const AnimatedNumber = ({ 
  value,
  duration = 2000,
  formatValue = (val) => val.toFixed(2),
  formatter, // Add this prop
}: AnimatedNumberProps) => {
  // Use formatter if provided, otherwise use formatValue
  const formatFn = formatter || formatValue;
  
  // Start at 0 and animate to the actual value
  const { number } = useSpring({
    from: { number: 0 },
    number: value,
    delay: 200,
    config: { duration },
  });

  return (
    <animated.span>
      {number.to((val) => formatFn(val))}
    </animated.span>
  );
};

export default AnimatedNumber;
