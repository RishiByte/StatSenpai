/**
 * TierList.jsx
 * Drag-and-drop tier list with S/A/B/C/Unranked lanes
 * Uses @dnd-kit for accessible drag-and-drop
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAnime } from '../context/AnimeContext';
import { getCharacterImage } from '../services/api';

const TIERS = [
  { id: 'S', label: 'S', color: '#ff3333', bg: 'rgba(255,51,51,0.12)', desc: 'God-tier' },
  { id: 'A', label: 'A', color: '#ff8c00', bg: 'rgba(255,140,0,0.12)', desc: 'Elite' },
  { id: 'B', label: 'B', color: '#ffe600', bg: 'rgba(255,230,0,0.08)', desc: 'Strong' },
  { id: 'C', label: 'C', color: '#4dff88', bg: 'rgba(77,255,136,0.08)', desc: 'Average' },
  { id: 'unranked', label: '?', color: '#55556a', bg: 'rgba(85,85,106,0.12)', desc: 'Unranked' },
];

// Individual sortable character token inside a tier
function SortableCharToken({ character, tier }) {
  const { dispatch } = useAnime();
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${tier}::${character.mal_id}`,
    data: { tier, malId: character.mal_id, character },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const imgUrl = imgError
    ? `https://placehold.co/80x100/12121f/b84dff?text=${character.name[0]}`
    : getCharacterImage(character);

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        position: 'relative',
        width: '72px',
        flexShrink: 0,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      className="tier-item"
    >
      <div
        {...attributes}
        {...listeners}
        style={{ position: 'relative' }}
      >
        <img
          src={imgUrl}
          alt={character.name}
          onError={() => setImgError(true)}
          onClick={() => navigate(`/character/${character.mal_id}`)}
          style={{
            width: '72px',
            height: '90px',
            objectFit: 'cover',
            borderRadius: '8px',
            display: 'block',
            border: '1px solid rgba(255,255,255,0.1)',
            pointerEvents: isDragging ? 'none' : 'auto',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
            padding: '4px 4px 2px',
            borderRadius: '0 0 8px 8px',
          }}
        >
          <p style={{
            fontSize: '9px',
            fontWeight: '600',
            color: 'white',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {character.name.split(' ')[0]}
          </p>
        </div>
      </div>

      {/* Remove button */}
      <button
        onClick={() => dispatch({ type: 'REMOVE_FROM_TIER', payload: { tier, malId: character.mal_id } })}
        style={{
          position: 'absolute',
          top: '-6px',
          right: '-6px',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: 'rgba(255,77,77,0.9)',
          border: 'none',
          cursor: 'pointer',
          color: 'white',
          fontSize: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          lineHeight: 1,
        }}
        aria-label={`Remove ${character.name} from tier`}
      >
        ✕
      </button>
    </div>
  );
}

// Drag overlay token (shown while dragging)
function DragToken({ character }) {
  const [imgError, setImgError] = useState(false);
  const imgUrl = imgError
    ? `https://placehold.co/80x100/12121f/b84dff?text=${character.name[0]}`
    : getCharacterImage(character);

  return (
    <div style={{ width: '72px', opacity: 0.95, transform: 'rotate(-4deg)' }}>
      <img
        src={imgUrl}
        alt={character.name}
        onError={() => setImgError(true)}
        style={{
          width: '72px',
          height: '90px',
          objectFit: 'cover',
          borderRadius: '8px',
          border: '2px solid rgba(184,77,255,0.8)',
          boxShadow: '0 0 20px rgba(184,77,255,0.5)',
        }}
      />
    </div>
  );
}

export default function TierList() {
  const { state, dispatch } = useAnime();
  const [activeItem, setActiveItem] = useState(null);
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function findContainerByItemId(id) {
    for (const tierData of TIERS) {
      const tier = tierData.id;
      if (state.tierList[tier]?.some(c => `${tier}::${c.mal_id}` === id)) {
        return tier;
      }
    }
    return null;
  }

  function handleDragStart(event) {
    const { active } = event;
    const sourceTier = findContainerByItemId(active.id);
    if (!sourceTier) return;
    const character = state.tierList[sourceTier].find(c => `${sourceTier}::${c.mal_id}` === active.id);
    setActiveItem({ character, sourceTier });
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveItem(null);
    if (!over) return;

    const sourceTier = findContainerByItemId(active.id);
    if (!sourceTier) return;

    // Over a tier row or an item within a tier
    let destTier = null;
    // Check if dropped on a tier-zone div
    if (TIERS.some(t => t.id === over.id)) {
      destTier = over.id;
    } else {
      destTier = findContainerByItemId(over.id);
    }

    if (!destTier) return;

    const malId = Number(active.id.split('::')[1]);
    const character = state.tierList[sourceTier].find(c => c.mal_id === malId);
    if (!character) return;

    if (sourceTier === destTier) {
      // Reorder within same tier
      const items = [...state.tierList[sourceTier]];
      const oldIdx = items.findIndex(c => c.mal_id === malId);
      const overId = Number(over.id.split('::')[1]);
      const newIdx = items.findIndex(c => c.mal_id === overId);
      if (oldIdx !== -1 && newIdx !== -1) {
        items.splice(oldIdx, 1);
        items.splice(newIdx, 0, character);
        dispatch({ type: 'REORDER_TIER', payload: { [sourceTier]: items } });
      }
    } else {
      // Move to different tier
      dispatch({ type: 'ADD_TO_TIER', payload: { tier: destTier, character } });
    }
  }

  const allItemIds = TIERS.flatMap(t =>
    (state.tierList[t.id] || []).map(c => `${t.id}::${c.mal_id}`)
  );

  const totalCharacters = TIERS.reduce((sum, t) => sum + (state.tierList[t.id]?.length || 0), 0);

  return (
    <main className="page-enter" style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 className="font-orbitron" style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '800', marginBottom: '12px' }}>
          🏅 <span className="gradient-text">Tier</span> List
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Drag & drop characters to rank them. Go to character pages to add them to your tier list.
        </p>
        {totalCharacters === 0 && (
          <div style={{ marginTop: '24px' }}>
            <button className="btn-primary" onClick={() => navigate('/')}>
              → Browse Characters to Rank
            </button>
          </div>
        )}
      </div>

      {/* DnD Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={allItemIds} strategy={rectSortingStrategy}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {TIERS.map(({ id, label, color, bg, desc }) => (
              <div
                key={id}
                id={id}
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: `1px solid ${color}22`,
                  minHeight: '100px',
                }}
              >
                {/* Tier label */}
                <div
                  style={{
                    width: '72px',
                    flexShrink: 0,
                    background: `${color}33`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    borderRight: `2px solid ${color}44`,
                    padding: '8px',
                  }}
                >
                  <span
                    className="font-orbitron"
                    style={{
                      fontSize: '28px',
                      fontWeight: '900',
                      color,
                      textShadow: `0 0 15px ${color}88`,
                      lineHeight: 1,
                    }}
                  >
                    {label}
                  </span>
                  <span style={{ fontSize: '9px', color: `${color}aa`, fontWeight: '600', textAlign: 'center' }}>
                    {desc}
                  </span>
                </div>

                {/* Drop zone */}
                <div
                  style={{
                    flex: 1,
                    background: bg,
                    padding: '12px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    alignItems: 'flex-start',
                    alignContent: 'flex-start',
                    minHeight: '100px',
                    position: 'relative',
                  }}
                >
                  {state.tierList[id]?.length === 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: `${color}44`,
                        fontSize: '13px',
                        fontWeight: '500',
                        pointerEvents: 'none',
                      }}
                    >
                      Drag characters here
                    </div>
                  )}
                  {(state.tierList[id] || []).map(character => (
                    <SortableCharToken
                      key={character.mal_id}
                      character={character}
                      tier={id}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SortableContext>

        {/* Drag overlay */}
        <DragOverlay>
          {activeItem ? <DragToken character={activeItem.character} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Legend */}
      {totalCharacters > 0 && (
        <div
          style={{
            marginTop: '32px',
            padding: '20px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-secondary)' }}>
            📊 Ranking Summary
          </h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {TIERS.filter(t => t.id !== 'unranked').map(({ id, label, color }) => (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  className="font-orbitron"
                  style={{ color, fontSize: '14px', fontWeight: '800', minWidth: '16px' }}
                >
                  {label}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  {state.tierList[id]?.length || 0} chars
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
