/**
 * StatBar.jsx
 * Animated stat bar with label, value, and color gradient
 */
import { useEffect, useRef, useState } from 'react';

const STAT_COLORS = {
  strength: 'linear-gradient(90deg, #ff4d4d, #ff8c00)',
  speed: 'linear-gradient(90deg, #4db8ff, #4dfff3)',
  intelligence: 'linear-gradient(90deg, #b84dff, #4db8ff)',
  durability: 'linear-gradient(90deg, #ff8c00, #ffe600)',
  power: 'linear-gradient(90deg, #b84dff, #ff4db8)',
};

const STAT_ICONS = {
  strength: '💪',
  speed: '⚡',
  intelligence: '🧠',
  durability: '🛡️',
  power: '🔥',
};

const STAT_LABELS = {
  strength: 'Strength',
  speed: 'Speed',
  intelligence: 'Intelligence',
  durability: 'Durability',
  power: 'Power',
};

export default function StatBar({ stat, value, showValue = true, height = 8, delay = 0 }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setAnimated(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const color = STAT_COLORS[stat] || 'linear-gradient(90deg, #b84dff, #ff4db8)';
  const icon = STAT_ICONS[stat] || '⚡';
  const label = STAT_LABELS[stat] || stat;
  const cappedValue = Math.min(100, Math.max(0, value));

  return (
    <div ref={ref} style={{ marginBottom: '14px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
        }}
      >
        <span
          style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: '500',
          }}
        >
          {icon} {label}
        </span>
        {showValue && (
          <span
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color:
                cappedValue >= 90
                  ? '#ff4db8'
                  : cappedValue >= 75
                  ? '#b84dff'
                  : 'var(--text-secondary)',
              fontFamily: 'Orbitron, sans-serif',
            }}
          >
            {cappedValue}
          </span>
        )}
      </div>

      {/* Bar track */}
      <div className="stat-bar-container" style={{ height: `${height}px` }}>
        <div
          className="stat-bar-fill"
          style={{
            width: animated ? `${cappedValue}%` : '0%',
            background: color,
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}
