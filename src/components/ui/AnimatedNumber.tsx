
import { useSpring, animated } from '@react-spring/web';
import { useEffect } from 'react';

export interface AnimatedNumberProps {
  value: number;
  formatter?: (value: number) => string;
  duration?: number;
  delay?: number;
  className?: string;
}

const AnimatedNumber = ({
  value,
  formatter = (val: number) => val.toString(),
  duration = 800,
  delay = 0,
  className
}: AnimatedNumberProps) => {
  const { number } = useSpring({
    from: { number: 0 },
    to: { number: value },
    delay,
    config: { duration }
  });

  return (
    <animated.span className={className}>
      {number.to(val => formatter(val))}
    </animated.span>
  );
};

export default AnimatedNumber;
