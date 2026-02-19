import { useMemo } from 'react';
import type { MusicKey } from '@/pages/MusicTheoryApp';

interface CircleOfFifthsProps {
  activeKey: MusicKey | null;
}

const majorKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
const minorKeys = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m', 'Fm', 'Cm', 'Gm', 'Dm'];

export default function CircleOfFifths({ activeKey }: CircleOfFifthsProps) {
  const activeIndex = useMemo(() => {
    if (!activeKey) return -1;
    return majorKeys.findIndex((key) => key === activeKey.note);
  }, [activeKey]);

  const getNeighbors = (index: number): number[] => {
    if (index === -1) return [];
    const prev = (index - 1 + 12) % 12;
    const next = (index + 1) % 12;
    return [prev, next];
  };

  const neighbors = getNeighbors(activeIndex);

  const renderKey = (key: string, index: number, isMinor: boolean = false) => {
    const angle = (index * 30 - 90) * (Math.PI / 180);
    const radius = isMinor ? 120 : 180;
    const x = 250 + radius * Math.cos(angle);
    const y = 250 + radius * Math.sin(angle);

    const isActive = activeIndex === index;
    const isNeighbor = neighbors.includes(index);

    return (
      <g key={`${key}-${isMinor}`} className="transition-all duration-500 ease-out">
        <circle
          cx={x}
          cy={y}
          r={isMinor ? 28 : 32}
          fill={isActive ? 'oklch(var(--primary))' : isNeighbor ? 'oklch(var(--accent))' : 'oklch(var(--muted))'}
          stroke={isActive ? 'oklch(var(--primary-foreground))' : 'oklch(var(--border))'}
          strokeWidth={isActive ? 3 : 1}
          className="transition-all duration-500 ease-out"
          style={{
            transform: isActive ? 'scale(1.1)' : 'scale(1)',
            transformOrigin: `${x}px ${y}px`,
          }}
        />
        {isActive && (
          <circle
            cx={x}
            cy={y}
            r={isMinor ? 35 : 40}
            fill="none"
            stroke="oklch(var(--primary))"
            strokeWidth="2"
            opacity="0.3"
            className="animate-pulse"
          />
        )}
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={isActive || isNeighbor ? 'oklch(var(--primary-foreground))' : 'oklch(var(--foreground))'}
          fontSize={isMinor ? 12 : 14}
          fontWeight={isActive ? 'bold' : 'normal'}
          className="transition-all duration-500 ease-out"
        >
          {key}
        </text>
      </g>
    );
  };

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 500 500" className="w-full max-w-lg">
        {/* Background circle */}
        <circle cx="250" cy="250" r="220" fill="oklch(var(--card))" stroke="oklch(var(--border))" strokeWidth="2" />

        {/* Connection lines */}
        {activeIndex !== -1 && (
          <>
            {neighbors.map((neighborIndex) => {
              const activeAngle = (activeIndex * 30 - 90) * (Math.PI / 180);
              const neighborAngle = (neighborIndex * 30 - 90) * (Math.PI / 180);
              const x1 = 250 + 180 * Math.cos(activeAngle);
              const y1 = 250 + 180 * Math.sin(activeAngle);
              const x2 = 250 + 180 * Math.cos(neighborAngle);
              const y2 = 250 + 180 * Math.sin(neighborAngle);

              return (
                <line
                  key={neighborIndex}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="oklch(var(--accent) / 0.3)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className="transition-all duration-500 ease-out"
                />
              );
            })}
          </>
        )}

        {/* Major keys (outer circle) */}
        {majorKeys.map((key, index) => renderKey(key, index, false))}

        {/* Minor keys (inner circle) */}
        {minorKeys.map((key, index) => renderKey(key, index, true))}

        {/* Center label */}
        <text 
          x="250" 
          y="250" 
          textAnchor="middle" 
          dominantBaseline="middle" 
          fontSize="16" 
          fontWeight="bold" 
          fill="oklch(var(--muted-foreground))"
          className="transition-all duration-500 ease-out"
        >
          {activeKey ? activeKey.displayName : 'Select Key'}
        </text>
      </svg>
    </div>
  );
}
