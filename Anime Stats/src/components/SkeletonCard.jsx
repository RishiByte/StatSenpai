/**
 * SkeletonCard.jsx
 * Loading skeleton placeholder for character cards
 */
export default function SkeletonCard() {
  return (
    <div
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'var(--bg-card)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Image skeleton */}
      <div className="skeleton" style={{ height: '240px' }} />

      {/* Info skeleton */}
      <div style={{ padding: '14px 12px' }}>
        <div className="skeleton" style={{ height: '16px', marginBottom: '8px', borderRadius: '6px' }} />
        <div className="skeleton" style={{ height: '12px', width: '70%', marginBottom: '10px', borderRadius: '6px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton" style={{ height: '12px', width: '40%', borderRadius: '6px' }} />
          <div className="skeleton" style={{ height: '12px', width: '20%', borderRadius: '6px' }} />
        </div>
      </div>
    </div>
  );
}
