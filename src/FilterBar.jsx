import React from 'react';
import { FILTRES } from './utils';

export default function FilterBar({ filtre, onChange, compteurs }) {
  return (
    <div className="fb-barre" role="group" aria-label="Filtrer les transactions">
      {FILTRES.map((f) => (
        <button
          key={f.cle}
          type="button"
          className={filtre === f.cle ? 'fb-bouton fb-actif' : 'fb-bouton'}
          aria-pressed={filtre === f.cle}
          onClick={() => onChange(f.cle)}
        >
          {f.label} ({compteurs[f.cle]})
        </button>
      ))}
    </div>
  );
}
