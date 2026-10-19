export default function StatsCard({ titre, valeur, couleur }) {
  return (
    <div className="card" style={{ '--card-color': couleur }}>
      <div className="card-title">{titre}</div>
      <div className="card-value">{valeur}</div>
    </div>
  );
}