import React, { useState, useEffect, useMemo } from 'react';
import StatsCard from './StatsCard'; // ton fichier StatsCard.jsx (inchangé)
import FilterBar from './FilterBar';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import {
  CATEGORIES,
  TRANSACTIONS_DEPART,
  calculerTotaux,
  comparerParDate,
  formaterMontant,
  normaliserTransaction,
} from './utils';
import './Transactions.css';

const CLE_STOCKAGE = 'dash_transactions';

// Relit les transactions sauvegardées dans le navigateur
function chargerTransactions() {
  try {
    const brut = localStorage.getItem(CLE_STOCKAGE);
    if (brut !== null) {
      const liste = JSON.parse(brut);
      if (Array.isArray(liste)) return liste.map(normaliserTransaction);
    }
  } catch {
    // Données illisibles : on repart de la liste de départ
  }
  return TRANSACTIONS_DEPART;
}

export default function App() {
  const [transactions, setTransactions] = useState(chargerTransactions);
  const [filtre, setFiltre] = useState('tous');
  const [enEdition, setEnEdition] = useState(null);

  // Sauvegarde automatique à chaque changement
  useEffect(() => {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(transactions));
  }, [transactions]);

  // Solde, revenus et dépenses sont calculés depuis la liste : ils ne peuvent plus se désynchroniser
  const totaux = useMemo(() => calculerTotaux(transactions), [transactions]);

  const compteurs = useMemo(
    () => ({
      tous: transactions.length,
      revenu: transactions.filter((t) => t.type === 'revenu').length,
      depense: transactions.filter((t) => t.type === 'depense').length,
    }),
    [transactions]
  );

  const affichees = useMemo(
    () =>
      transactions
        .filter((t) => filtre === 'tous' || t.type === filtre)
        .sort(comparerParDate),
    [transactions, filtre]
  );

  // Ajoute une nouvelle transaction, ou enregistre la modification en cours
  const enregistrer = ({ titre, montant, categorie, date }) => {
    const type = CATEGORIES[categorie].type;

    if (enEdition) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === enEdition.id ? { ...t, titre, montant, categorie, type, date } : t
        )
      );
      setEnEdition(null);
    } else {
      setTransactions((prev) => [
        { id: Date.now(), titre, montant, categorie, type, date },
        ...prev,
      ]);
    }
  };

  const commencerEdition = (transaction) => {
    setEnEdition(transaction);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const supprimer = (transaction) => {
    if (!window.confirm(`Supprimer « ${transaction.titre} » ?`)) return;

    setTransactions((prev) => prev.filter((t) => t.id !== transaction.id));
    if (enEdition && enEdition.id === transaction.id) setEnEdition(null);
  };

  return (
    <div className="dashboard-shell">
      <div className="dashboard">
        <h1 className="dashboard-title">
          Mon Tableau de Bord <span aria-hidden="true">📊</span>
        </h1>

        <div className="cards-row">
          <StatsCard titre="Solde Total" valeur={formaterMontant(totaux.solde)} couleur="#38bdf8" />
          <StatsCard titre="Revenus" valeur={`+ ${formaterMontant(totaux.revenus)}`} couleur="#4ade80" />
          <StatsCard titre="Dépenses" valeur={`- ${formaterMontant(totaux.depenses)}`} couleur="#f87171" />
        </div>

        <TransactionForm
          key={enEdition ? enEdition.id : 'nouveau'}
          transaction={enEdition}
          onSubmit={enregistrer}
          onAnnuler={() => setEnEdition(null)}
        />

        <FilterBar filtre={filtre} onChange={setFiltre} compteurs={compteurs} />

        <TransactionList
          transactions={affichees}
          total={transactions.length}
          idEnEdition={enEdition ? enEdition.id : null}
          onEdit={commencerEdition}
          onDelete={supprimer}
        />
      </div>
    </div>
  );
}
