// "Sunrise, names below" from v7/home-pillar-cards.html: inside each card the score's name (top left), the GoodFlip
// pictogram (top right) and the score in the bowl of a rising arc of the pillar's orbs; the pillar's name under the card.
import React from 'react';

const P = [
  { k: 'eat', name: 'Eat', metric: 'Sufficiency', score: 67, pic: 'Nutrition' },
  { k: 'move', name: 'Move', metric: 'Momentum', score: 54, pic: 'Movement' },
  { k: 'mind', name: 'Mind', metric: 'Rhythm', score: 72, pic: 'Stress' },
  { k: 'measure', name: 'Measure', metric: 'Measure', score: 81, pic: 'Lab-tests' },
];
const W = 148, H = 128;

function Arc({ k, score }) {
  // 13 orbs on a semicircle rising from the card's foot, lit left to right up to the score
  const n = 13, on = Math.round(score / 100 * n), cx = W / 2, cy = H - 4, R = 60;
  return Array.from({ length: n }, (_, i) => {
    const a = Math.PI - i / (n - 1) * Math.PI, r = i % 2 ? 4.2 : 6;
    const st = { position: 'absolute', left: cx + Math.cos(a) * R - r, top: cy - Math.sin(a) * R - r, width: 2 * r, height: 2 * r, borderRadius: '50%' };
    return i < on
      ? <img key={i} src={`home/em3/orbs/${k}.svg`} alt="" style={{ ...st, boxShadow: '0 1px 2px rgba(16,24,40,.16)' }} />
      : <span key={i} style={{ ...st, background: 'radial-gradient(circle at 34% 30%,#fff 0 10%,#EEF0F4 40%,#D3D8E0 85%,#BEC4CE)' }} />;
  });
}

export default function EM3Cards({ onOpen }) {
  return (
    <div className="flex gap-3 overflow-x-auto px-4 pb-2"
      style={{ paddingTop: 2, scrollbarWidth: 'none', scrollSnapType: 'x mandatory', scrollPaddingLeft: 16 }}>
      {P.map(p => (
        <button key={p.k} type="button" onClick={() => onOpen(p.k)} aria-label={`${p.name}, ${p.metric} ${p.score}`}
          className="flex shrink-0 flex-col items-center gap-2" style={{ scrollSnapAlign: 'start', background: 'none', border: 0, padding: 0, cursor: 'pointer' }}>
          <span className="relative block overflow-hidden bg-white text-left"
            style={{ width: W, height: H, borderRadius: 16, border: '1.5px solid #C7D7FE', boxShadow: '3px 4px 0 #C7D7FE' }}>
            <span className="absolute text-GRAY-600" style={{ left: 12, top: 10, font: '500 13px/18px Roboto, sans-serif', letterSpacing: '.25px' }}>{p.metric}</span>
            <img src={`home/em3/pictograms/${p.pic}.png`} alt="" width="34" height="34" className="absolute" style={{ right: 10, top: 8 }} />
            <Arc k={p.k} score={p.score} />
            <span className="absolute text-center text-GRAY-900" style={{ left: 0, right: 0, bottom: 8, font: '700 28px/1 Roboto, sans-serif', letterSpacing: '-.5px', fontVariantNumeric: 'tabular-nums' }}>{p.score}</span>
          </span>
          <span className="text-GRAY-900" style={{ font: '600 14px/18px Roboto, sans-serif', letterSpacing: '.25px' }}>{p.name}</span>
        </button>
      ))}
    </div>
  );
}
