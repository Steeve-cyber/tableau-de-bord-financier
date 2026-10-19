import React, { useState } from 'react';
import { CATEGORIES, aujourdhui } from './utils';

// Catégories d'un type donné, sous forme de liste [clé, catégorie]
const categoriesDuType = (type) =>
  Object.entries(CATEGORIES).filter(([, c]) => c.type === type);

const GROUPES = [
  ['Revenus', 'revenu'],
  ['Dépenses', 'depense'],
];

// Sert à ajouter une transaction, ou à en modifier une (si "transaction" est fournie)
export default function TransactionForm({ transaction, onSubmit, onAnnuler }) {
  const enEdition = Boolean(transaction);

  const [titre, setTitre] = useState(transaction ? transaction.titre : '');
  const [montant, setMontant] = useState(transaction ? String(transaction.montant) : '');
  const [categorie, setCategorie] = useState(
    transaction ? transaction.categorie : Object.keys(CATEGORIES)[0]
  );
  const [date, setDate] = useState(
    transaction && transaction.date ? transaction.date : aujourdhui()
  );
  const [erreur, setErreur] = useState('');

  const valider = (e) => {
    e.preventDefault();

    const titreNet = titre.trim();
    const montantNum = Math.round(parseFloat(montant) * 100) / 100;

    if (!titreNet) {
      setErreur('Donne un titre à la transaction (ex : Facture client WordPress).');
      return;
    }
    if (!Number.isFinite(montantNum) || montantNum <= 0) {
      setErreur('Le montant doit être un nombre supérieur à 0.');
      return;
    }
    if (!date) {
      setErreur('Choisis une date.');
      return;
    }

    setErreur('');
    onSubmit({ titre: titreNet, montant: montantNum, categorie, date });

    // Après un ajout, on vide le titre et le montant (la catégorie et la date restent)
    if (!enEdition) {
      setTitre('');
      setMontant('');
    }
  };

  return (
    <form className="tf-form" onSubmit={valider} noValidate>
      <h2 className="tf-titre">
        {enEdition ? 'Modifier la transaction' : 'Ajouter une transaction'}
      </h2>

      <label className="tf-champ tf-large">
        <span>Titre</span>
        <input
          type="text"
          value={titre}
          maxLength={80}
          autoComplete="off"
          placeholder="Ex : Facture client WordPress"
          onChange={(e) => setTitre(e.target.value)}
        />
      </label>

      <label className="tf-champ">
        <span>Catégorie</span>
        <select value={categorie} onChange={(e) => setCategorie(e.target.value)}>
          {GROUPES.map(([nomGroupe, type]) => {
            const liste = categoriesDuType(type);
            if (liste.length === 0) return null;
            return (
              <optgroup key={type} label={nomGroupe}>
                {liste.map(([cle, c]) => (
                  <option key={cle} value={cle}>
                    {c.label}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </label>

      <label className="tf-champ">
        <span>Montant (€)</span>
        <input
          type="number"
          min="0.01"
          step="0.01"
          inputMode="decimal"
          value={montant}
          placeholder="Ex : 120"
          onChange={(e) => setMontant(e.target.value)}
        />
      </label>

      <label className="tf-champ">
        <span>Date</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </label>

      <div className="tf-actions">
        <button type="submit" className="tf-bouton tf-principal">
          {enEdition ? 'Enregistrer' : 'Ajouter'}
        </button>
        {enEdition && (
          <button type="button" className="tf-bouton" onClick={onAnnuler}>
            Annuler
          </button>
        )}
      </div>

      {erreur && (
        <p className="tf-erreur" role="alert">
          {erreur}
        </p>
      )}
    </form>
  );
}
