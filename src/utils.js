// ─────────────────────────────────────────────────────────────
// CATEGORIES : tes 4 catégories générales.
// Pour en ajouter une, copie une ligne et change la clé, le nom et le type.
// type : 'revenu' ou 'depense'
// ─────────────────────────────────────────────────────────────
export const CATEGORIES = {
  'revenu-divers':         { label: 'Revenu divers',                    type: 'revenu' },
  'revenu-supplementaire': { label: 'Revenu supplémentaire',            type: 'revenu' },
  'achat-materiel':        { label: 'Achat de matériel',                type: 'depense' },
  'projet-freelance':      { label: 'Remplacement de projet freelance', type: 'revenu' },
};

export const FILTRES = [
  { cle: 'tous', label: 'Toutes' },
  { cle: 'revenu', label: 'Revenus' },
  { cle: 'depense', label: 'Dépenses' },
];

// Montant de départ du solde.
// 0 = le solde vient uniquement de tes transactions.
export const SOLDE_DEPART = 0;

// ─────────────────────────────────────────────────────────────
// Dates et montants
// ─────────────────────────────────────────────────────────────
const deuxChiffres = (n) => String(n).padStart(2, '0');

const dateVersTexte = (d) =>
  `${d.getFullYear()}-${deuxChiffres(d.getMonth() + 1)}-${deuxChiffres(d.getDate())}`;

// Date du jour au format AAAA-MM-JJ
export const aujourdhui = () => dateVersTexte(new Date());

// AAAA-MM-JJ  ->  JJ/MM/AAAA
export const formaterDate = (iso) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '')) return '';
  const [a, m, j] = iso.split('-');
  return `${j}/${m}/${a}`;
};

const arrondir = (n) => Math.round(n * 100) / 100;

export const formaterMontant = (n) =>
  `${arrondir(n).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} €`;

// ─────────────────────────────────────────────────────────────
// Transactions
// ─────────────────────────────────────────────────────────────
export const TRANSACTIONS_DEPART = [
  { id: 1, titre: 'Projet Freelance', montant: 500, categorie: 'projet-freelance', type: 'revenu', date: aujourdhui() },
  { id: 2, titre: 'Achat Matériel', montant: 150, categorie: 'achat-materiel', type: 'depense', date: aujourdhui() },
];

// Trouve la catégorie d'une transaction.
// Les anciennes transactions (sans catégorie) sont classées automatiquement.
const categorieDe = (t) => {
  if (t.categorie && CATEGORIES[t.categorie]) return t.categorie;
  if (t.type === 'depense') return 'achat-materiel';
  if (/freelance/i.test(t.titre || '')) return 'projet-freelance';
  if (/suppl/i.test(t.titre || '')) return 'revenu-supplementaire';
  return 'revenu-divers';
};

// Donne une date AAAA-MM-JJ aux anciennes transactions.
const dateDe = (t) => {
  const d = t.date;
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  if (typeof d === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(d)) {
    const [j, m, a] = d.split('/');
    return `${a}-${m}-${j}`;
  }
  // Les anciens identifiants étaient l'heure d'ajout : on s'en sert comme date
  if (typeof t.id === 'number' && t.id > 1e12) return dateVersTexte(new Date(t.id));
  return '';
};

// Remet une transaction (ancienne ou nouvelle) dans le format actuel
export const normaliserTransaction = (t) => {
  const categorie = categorieDe(t);
  return {
    id: t.id ?? Date.now(),
    titre: String(t.titre ?? ''),
    montant: Number(t.montant) || 0,
    categorie,
    type: CATEGORIES[categorie].type,
    date: dateDe(t),
  };
};

// Solde, revenus et dépenses : toujours calculés depuis la liste
export const calculerTotaux = (transactions) => {
  let revenus = 0;
  let depenses = 0;
  transactions.forEach((t) => {
    if (t.type === 'revenu') revenus += t.montant;
    else depenses += t.montant;
  });
  revenus = arrondir(revenus);
  depenses = arrondir(depenses);
  return { revenus, depenses, solde: arrondir(SOLDE_DEPART + revenus - depenses) };
};

// Tri : les plus récentes en premier
export const comparerParDate = (a, b) =>
  (b.date || '').localeCompare(a.date || '') || b.id - a.id;
