import React from 'react';
import { CATEGORIES, formaterMontant, formaterDate } from './utils';

export default function TransactionList({ transactions, total, idEnEdition, onEdit, onDelete }) {
  if (transactions.length === 0) {
    return (
      <p className="tl-vide">
        {total === 0
          ? 'Aucune transaction pour le moment. Utilise le formulaire pour en ajouter une.'
          : 'Aucune transaction ne correspond à ce filtre.'}
      </p>
    );
  }

  return (
    <ul className="tl-liste">
      {transactions.map((t) => {
        const categorie = CATEGORIES[t.categorie];
        const meta = [categorie ? categorie.label : '', formaterDate(t.date)]
          .filter(Boolean)
          .join(' · ');

        return (
          <li
            key={t.id}
            className={t.id === idEnEdition ? 'tl-ligne tl-en-edition' : 'tl-ligne'}
          >
            <div className="tl-texte">
              <span className="tl-titre">{t.titre}</span>
              {meta && <small className="tl-meta">{meta}</small>}
            </div>

            <div className="tl-droite">
              <span className={t.type === 'revenu' ? 'tl-montant tl-revenu' : 'tl-montant tl-depense'}>
                {t.type === 'revenu' ? '+' : '-'} {formaterMontant(t.montant)}
              </span>
              <button
                type="button"
                className="tl-icone"
                title="Modifier"
                aria-label={`Modifier ${t.titre}`}
                onClick={() => onEdit(t)}
              >
                ✏️
              </button>
              <button
                type="button"
                className="tl-icone"
                title="Supprimer"
                aria-label={`Supprimer ${t.titre}`}
                onClick={() => onDelete(t)}
              >
                🗑️
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
