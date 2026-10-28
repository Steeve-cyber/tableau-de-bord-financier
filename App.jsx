import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

const KEY = 'atelier-finance-v1';
const today = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const dateAgo = (days) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(Math.max(1, d.getDate() - days)); return d.toISOString().slice(0, 10); };
const monthDate = (offset, day) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(1); d.setMonth(d.getMonth() - offset); d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())); return d.toISOString().slice(0, 10); };
const history = [
  [4020,2470],[3760,2190],[4210,2380],[3970,2250],[4360,2610],[3890,2140],
  [4450,2510],[4180,2300],[4630,2710],[4230,2420],[4580,2580],
];
const seed = () => {
  const now = [
    ['Salaire · Atelier Studio','Salaire','revenu',3420,1],['Mission conseil','Freelance','revenu',860,4],
    ['Cashback bancaire','Autres revenus','revenu',34.5,7],['Loyer · Résidence Central','Logement','depense',940,2],
    ['Courses du mois','Alimentation','depense',164.8,3],['Abonnement transport','Transport','depense',42.6,5],
    ['Restaurant Lumière','Loisirs','depense',48,6],['Pharmacie Saint-Michel','Santé','depense',27.5,8],
    ['Nouvelle paire de chaussures','Achats','depense',89,9],['Abonnement musique','Abonnements','depense',13.99,10],
  ].map((x,i) => ({ id:'this-'+i,title:x[0],category:x[1],type:x[2],amount:x[3],date:dateAgo(x[4]) }));
  const past = history.flatMap((m,i) => {
    const n=i+1;
    return [
      {id:'salary-'+n,title:'Salaire · Atelier Studio',category:'Salaire',type:'revenu',amount:+(m[0]*.8).toFixed(2),date:monthDate(n,4)},
      {id:'extra-'+n,title:'Revenus complémentaires',category:'Freelance',type:'revenu',amount:+(m[0]*.2).toFixed(2),date:monthDate(n,12)},
      {id:'rent-'+n,title:'Loyer · Résidence Central',category:'Logement',type:'depense',amount:+(m[1]*.68).toFixed(2),date:monthDate(n,5)},
      {id:'living-'+n,title:'Dépenses du quotidien',category:'Alimentation',type:'depense',amount:+(m[1]*.32).toFixed(2),date:monthDate(n,16)},
    ];
  });
  return {balance:12840.5,transactions:[...now,...past].sort((a,b)=>b.date.localeCompare(a.date))};
};
const readData = () => { try { const v=JSON.parse(localStorage.getItem(KEY)); return v && Number.isFinite(v.balance) && Array.isArray(v.transactions) ? v : seed(); } catch { return seed(); } };
const euro = (n, compact=false) => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:compact?0:2}).format(n);
const monthKey = (iso) => { const d=new Date(iso+'T12:00:00'); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'); };
const signed = (t) => t.type==='revenu'?t.amount:-t.amount;
const dateLabel = (iso) => new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short'}).format(new Date(iso+'T12:00:00'));
const categories = ['Logement','Alimentation','Transport','Loisirs','Santé','Achats','Abonnements','Salaire','Freelance','Autres revenus','Autre'];
const budgets = [['Logement',1150],['Alimentation',420],['Transport',160],['Loisirs',240],['Santé',140],['Achats',220],['Abonnements',90]];
const categoryIcons = {Logement:'home',Alimentation:'cart',Transport:'car',Loisirs:'spark',Santé:'heart',Achats:'bag',Abonnements:'card',Salaire:'briefcase',Freelance:'spark','Autres revenus':'trend',Autre:'receipt'};

function Icon({name,size=19}) {
  const d={
    dashboard:<><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="11" width="7" height="10" rx="1.5"/><rect x="3" y="14" width="8" height="7" rx="1.5"/></>,
    list:<><path d="M8 6h12M8 12h12M8 18h12"/><path d="M3 6h.01M3 12h.01M3 18h.01" strokeWidth="3"/></>,
    pie:<><path d="M12 3v9h9"/><path d="M19.5 15A8.5 8.5 0 1 1 9 4.5"/><path d="M14 3.5A8.5 8.5 0 0 1 20.5 10H14z"/></>,
    chart:<><path d="M4 20V4M4 20h17"/><path d="m7 15 4-4 3 2 6-7"/><path d="M16 6h4v4"/></>,
    plus:<path d="M12 5v14M5 12h14"/>, search:<><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    bell:<><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    download:<><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v3h16v-3"/></>,
    up:<path d="M7 17 17 7M7 7h10v10"/>,down:<path d="m7 7 10 10M17 7v10H7"/>,
    right:<path d="M5 12h14m-6-6 6 6-6 6"/>,chevron:<path d="m6 9 6 6 6-6"/>,
    wallet:<><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H20v15H6a3 3 0 0 1-3-3V7a.5.5 0 0 1 .5-.5z"/><path d="M3 8h17M15 13h5"/><circle cx="15" cy="13" r=".6" fill="currentColor"/></>,
    trend:<><path d="m4 16 5-5 4 3 7-8"/><path d="M14 6h6v6"/></>,
    home:<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1z"/>,
    cart:<><path d="M3 4h2l2.2 11h11.2l2-8H6"/><circle cx="9" cy="19" r="1.2"/><circle cx="17" cy="19" r="1.2"/></>,
    car:<><path d="m5 11 1.5-5h11l1.5 5 2 2v5h-2v-2H5v2H3v-5z"/><path d="M6.5 11h11M7 14h.01M17 14h.01" strokeWidth="3"/></>,
    heart:<path d="M20.8 8.8c0 5.2-8.8 10.3-8.8 10.3S3.2 14 3.2 8.8a4.6 4.6 0 0 1 8.8-1.7 4.6 4.6 0 0 1 8.8 1.7z"/>,
    bag:<><path d="M5 8h14l1 13H4z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>,
    card:<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/></>,
    briefcase:<><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></>,
    spark:<><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z"/></>,
    receipt:<><path d="M5 3h14v18l-3-2-4 2-4-2-3 2z"/><path d="M8 8h8M8 12h8M8 16h4"/></>,
    edit:<path d="m14 5 5 5M4 20l4.2-.9L19 8.3a2.1 2.1 0 0 0-3-3L5.2 16.1z"/>,
    trash:<><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/></>,
    close:<path d="m6 6 12 12M18 6 6 18"/>,moon:<path d="M20.8 14A8.7 8.7 0 0 1 10 3.2 8.8 8.8 0 1 0 20.8 14z"/>,
    sun:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    dots:<><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>,
    check:<path d="m5 12 4 4L19 6"/>,filter:<path d="M4 5h16M7 12h10m-7 7h4"/>
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d[name]||d.receipt}</svg>;
}
function Category({name}) { const icon=categoryIcons[name]||'receipt'; return <span className={'category-mark cat-'+icon}><Icon name={icon} size={17}/></span>; }
function Sparkline({color,values}) { const max=Math.max(...values),min=Math.min(...values); const pts=values.map((v,i)=>(i/(values.length-1)*100)+','+(28-(v-min)/(max-min||1)*21)).join(' '); return <svg className="sparkline" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true"><polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>; }

function Chart({transactions,period,setPeriod}) {
  const values=useMemo(()=>{
    const sums=new Map();
    transactions.forEach(t=>{const k=monthKey(t.date),v=sums.get(k)||{income:0,expense:0};v[t.type==='revenu'?'income':'expense']+=t.amount;sums.set(k,v);});
    if(period==='30J'){const weeks=[1,2,3,4].map(n=>({label:'S'+n,income:0,expense:0}));transactions.forEach(t=>{const days=Math.floor((new Date()-new Date(t.date+'T12:00:00'))/86400000);if(days>=0&&days<30){const i=Math.min(3,Math.floor(days/7));weeks[i][t.type==='revenu'?'income':'expense']+=t.amount;}});return weeks;}
    const count=period==='12M'?12:6,now=new Date();
    return Array.from({length:count},(_,i)=>{const d=new Date(now.getFullYear(),now.getMonth()-count+i+1,1),k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');return {label:new Intl.DateTimeFormat('fr-FR',{month:'short'}).format(d).replace('.',''),...(sums.get(k)||{income:0,expense:0})};});
  },[transactions,period]);
  const max=Math.ceil(Math.max(1000,...values.flatMap(v=>[v.income,v.expense]))/1000)*1000;
  const left=48,right=744,bottom=198,top=16,slot=(right-left)/values.length,w=Math.min(20,slot*.24);
  return <section className="panel chart-panel"><div className="panel-heading"><div><p className="eyebrow">VUE D'ENSEMBLE</p><h2>Flux de trésorerie</h2><p className="panel-subtitle">Revenus et dépenses au fil du temps</p></div><div className="segmented" role="group" aria-label="Période du graphique">{['30J','6M','12M'].map(p=><button key={p} className={period===p?'selected':''} onClick={()=>setPeriod(p)}>{p}</button>)}</div></div>
    <div className="legend"><span><i className="legend-income"/>Revenus</span><span><i className="legend-expense"/>Dépenses</span></div>
    <div className="chart-wrap"><svg viewBox="0 0 760 242" className="chart-svg" role="img" aria-label="Revenus et dépenses par période">{[0,.33,.66,1].map((r,i)=>{const y=bottom-r*(bottom-top);return <g key={i}><line x1={left} x2={right} y1={y} y2={y} className="gridline"/><text x="0" y={y+4} className="axis-label">{euro(max*r,true)}</text></g>;})}{values.map((v,i)=>{const cx=left+slot*i+slot/2,h1=(v.income/max)*(bottom-top),h2=(v.expense/max)*(bottom-top);return <g key={v.label+i}><rect x={cx-w-3} y={bottom-h1} width={w} height={Math.max(2,h1)} rx="5" className="bar-income"><title>{v.label} : revenus {euro(v.income)}</title></rect><rect x={cx+3} y={bottom-h2} width={w} height={Math.max(2,h2)} rx="5" className="bar-expense"><title>{v.label} : dépenses {euro(v.expense)}</title></rect><text x={cx} y="226" textAnchor="middle" className="month-label">{v.label}</text></g>;})}</svg></div>
    <div className="chart-foot"><Icon name="trend" size={16}/> Calculé à partir de vos transactions enregistrées.</div></section>;
}
function BudgetPanel({transactions,all=false}) {
  const key=monthKey(today()),spent=transactions.filter(t=>t.type==='depense'&&monthKey(t.date)===key);
  const byCat=spent.reduce((o,t)=>(o[t.category]=(o[t.category]||0)+t.amount,o),{}),total=spent.reduce((s,t)=>s+t.amount,0);
  const limit=budgets.reduce((s,b)=>s+b[1],0);
  return <section className="panel budget-panel"><div className="panel-heading"><div><p className="eyebrow">CE MOIS-CI</p><h2>Suivi des budgets</h2></div><span className="soft-tag">{euro(total,true)} dépensés</span></div>
    <div className="budget-total"><div><span>Budget total</span><strong>{euro(limit,true)}</strong></div><div><span>Disponible</span><strong>{euro(Math.max(0,limit-total),true)}</strong></div></div><div className="budget-all-track"><span style={{width:Math.min(100,total/limit*100)+'%'}}/></div>
    <div className="budget-list">{budgets.slice(0,all?7:5).map(([name,budget])=>{const amount=byCat[name]||0,pct=Math.min(100,amount/budget*100);return <div className="budget-item" key={name}><div className="budget-row"><span className="budget-name"><Category name={name}/>{name}</span><span><strong>{euro(amount,true)}</strong><i> / {euro(budget,true)}</i></span></div><div className="budget-track"><span className={amount>budget?'over':''} style={{width:pct+'%'}}/></div></div>;})}</div>
    <p className="budget-foot"><i/>{total<=limit?euro(limit-total,true)+' restants sur vos enveloppes':'Une enveloppe a dépassé sa limite.'}</p></section>;
}
function TransactionRow({item,onEdit,onDelete}) { return <div className="transaction-row"><Category name={item.category}/><div className="transaction-info"><strong>{item.title}</strong><span>{item.category} <i>·</i> {dateLabel(item.date)}</span></div><strong className={'transaction-amount '+(item.type==='revenu'?'positive':'negative')}>{item.type==='revenu'?'+':'−'}{euro(item.amount)}</strong><div className="row-actions"><button className="icon-button row-action" aria-label={'Modifier '+item.title} onClick={()=>onEdit(item)}><Icon name="edit" size={15}/></button><button className="icon-button row-action remove-action" aria-label={'Supprimer '+item.title} onClick={()=>onDelete(item)}><Icon name="trash" size={15}/></button></div></div>; }
function Transactions({items,search,onEdit,onDelete}) { const list=[...items].sort((a,b)=>b.date.localeCompare(a.date)); if(!list.length)return <div className="empty-state"><span><Icon name="receipt" size={23}/></span><strong>{search?'Aucun résultat':'Aucune transaction'}</strong><small>{search?'Essayez un autre mot-clé.':'Ajoutez une opération pour commencer.'}</small></div>;return <div className="transaction-list">{list.map(item=><TransactionRow key={item.id} item={item} onEdit={onEdit} onDelete={onDelete}/>)}</div>; }

function Modal({open,item,onClose,onSave}) {
  const [form,setForm]=useState({type:'depense',title:'',amount:'',category:'Alimentation',date:today()}),[error,setError]=useState('');
  useEffect(()=>{if(open){setForm(item?{type:item.type,title:item.title,amount:String(item.amount),category:item.category,date:item.date}:{type:'depense',title:'',amount:'',category:'Alimentation',date:today()});setError('');}},[open,item]);
  useEffect(()=>{if(!open)return;const fn=e=>e.key==='Escape'&&onClose();window.addEventListener('keydown',fn);return()=>window.removeEventListener('keydown',fn);},[open,onClose]);
  if(!open)return null;
  const change=(k,v)=>setForm(f=>({...f,[k]:v}));
  const submit=e=>{e.preventDefault();const amount=Number(String(form.amount).replace(',','.'));if(!form.title.trim())return setError('Ajoutez un intitulé à cette opération.');if(!Number.isFinite(amount)||amount<=0)return setError('Saisissez un montant supérieur à zéro.');onSave({...form,title:form.title.trim(),amount});};
  return <div className="modal-shade" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><p className="eyebrow">{item?'MODIFIER':'NOUVELLE OPÉRATION'}</p><h2 id="modal-title">{item?'Modifier la transaction':'Ajouter une transaction'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Fermer"><Icon name="close"/></button></div><form onSubmit={submit}><div className="type-switch"><button type="button" className={form.type==='depense'?'on expense-on':''} onClick={()=>change('type','depense')}><Icon name="down" size={16}/>Dépense</button><button type="button" className={form.type==='revenu'?'on income-on':''} onClick={()=>change('type','revenu')}><Icon name="up" size={16}/>Revenu</button></div><label className="field">Intitulé<input autoFocus value={form.title} maxLength="70" placeholder="Ex. Courses, salaire…" onChange={e=>change('title',e.target.value)}/></label><label className="field">Montant (€)<div className="amount-wrap"><span>€</span><input type="number" min="0.01" step="0.01" value={form.amount} placeholder="0,00" onChange={e=>change('amount',e.target.value)}/></div></label><div className="field-row"><label className="field">Catégorie<select value={form.category} onChange={e=>change('category',e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label className="field">Date<input type="date" value={form.date} onChange={e=>change('date',e.target.value)}/></label></div>{error&&<p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Annuler</button><button className="button button-primary" type="submit"><Icon name="check" size={16}/>{item?'Enregistrer':'Ajouter la transaction'}</button></div></form></section></div>;
}

export default function App() {
  const [data,setData]=useState(readData),[view,setView]=useState('overview'),[period,setPeriod]=useState('6M'),[query,setQuery]=useState(''),[filter,setFilter]=useState('all'),[modal,setModal]=useState(false),[editing,setEditing]=useState(null),[dark,setDark]=useState(false),[noticeOpen,setNoticeOpen]=useState(false),[toast,setToast]=useState(''),[toastKey,setToastKey]=useState(0);
  const searchInput=useRef(null);
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(data));}catch{}},[data]);
  useEffect(()=>{const shortcut=e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();searchInput.current?.focus();}};window.addEventListener('keydown',shortcut);return()=>window.removeEventListener('keydown',shortcut);},[]);
  useEffect(()=>{if(!toast)return;const id=setTimeout(()=>setToast(''),3000);return()=>clearTimeout(id);},[toastKey]);
  const key=monthKey(today()),monthTx=data.transactions.filter(t=>monthKey(t.date)===key);
  const income=monthTx.filter(t=>t.type==='revenu').reduce((s,t)=>s+t.amount,0),expense=monthTx.filter(t=>t.type==='depense').reduce((s,t)=>s+t.amount,0),saved=income-expense,rate=income?Math.max(0,Math.min(100,Math.round(saved/income*100))):0;
  const filtered=useMemo(()=>data.transactions.filter(t=>{const q=query.trim().toLocaleLowerCase('fr-FR');return (!q||[t.title,t.category,t.type].some(v=>v.toLocaleLowerCase('fr-FR').includes(q)))&&(filter==='all'||filter===t.type);}),[data.transactions,query,filter]);
  const ping=message=>{setToast(message);setToastKey(k=>k+1);};
  const close=()=>{setModal(false);setEditing(null);};
  const save=draft=>{if(editing){const updated={...editing,...draft},delta=signed(updated)-signed(editing);setData(d=>({balance:d.balance+delta,transactions:d.transactions.map(t=>t.id===editing.id?updated:t)}));ping('Transaction mise à jour.');}else{const item={...draft,id:'tx-'+Date.now()};setData(d=>({balance:d.balance+signed(item),transactions:[item,...d.transactions]}));ping('Transaction ajoutée.');}close();};
  const remove=item=>{setData(d=>({balance:d.balance-signed(item),transactions:d.transactions.filter(t=>t.id!==item.id)}));ping('Transaction supprimée.');};
  const exportCsv=()=>{const q=v=>'"'+String(v).replaceAll('"','""')+'"',rows=[['Date','Intitulé','Type','Catégorie','Montant (€)'],...data.transactions.map(t=>[t.date,t.title,t.type==='revenu'?'Revenu':'Dépense',t.category,t.amount.toFixed(2)])],csv='\uFEFF'+rows.map(r=>r.map(q).join(';')).join('\r\n'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='atelier-finance-transactions.csv';a.click();URL.revokeObjectURL(url);ping('Export CSV téléchargé.');};
  const labels={overview:['Bonjour, Sophie','Un aperçu clair de vos finances, en un seul endroit.'],transactions:['Transactions','Retrouvez et gérez toutes vos opérations.'],budgets:['Vos budgets','Gardez le cap sur vos objectifs du mois.'],reports:['Rapports','Comprenez les tendances de votre activité financière.']};
  const monthLabel=new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric'}).format(new Date());
  return <div className={'app-shell'+(dark?' theme-dark':'')}>
    <aside className="sidebar"><a href="#accueil" className="brand" onClick={e=>{e.preventDefault();setView('overview');}}><span className="brand-mark"><Icon name="chart" size={22}/></span><span className="brand-name"><strong>atelier<span>.</span></strong><small>FINANCE</small></span></a>
      <p className="workspace-label">ESPACE PERSONNEL</p><nav className="nav-menu" aria-label="Navigation principale">{[['overview','dashboard',"Vue d'ensemble"],['transactions','list','Transactions'],['budgets','pie','Budgets'],['reports','chart','Rapports']].map(([id,icon,title])=><button key={id} aria-label={title} className={'nav-item'+(view===id?' active':'')} onClick={()=>setView(id)}><Icon name={icon}/><span>{title}</span>{id==='transactions'&&<i>{data.transactions.length}</i>}</button>)}</nav>
      <div className="sidebar-spacer"/><div className="sidebar-tip"><span className="tip-icon"><Icon name="spark" size={18}/></span><strong>Un objectif en tête ?</strong><p>Un suivi régulier fait une grande différence.</p><button onClick={()=>setView('budgets')}>Voir mes budgets <Icon name="right" size={14}/></button></div><button className="profile"><span className="avatar">SC</span><span><strong>Sophie C.</strong><small>Compte personnel</small></span><Icon name="dots" size={18}/></button>
    </aside>
    <main className="main-area"><header className="topbar"><div className="breadcrumb"><span>Mon espace</span><Icon name="right" size={13}/><strong>{view==='overview'?'Vue d’ensemble':labels[view][0]}</strong></div><div className="topbar-actions"><label className="search-box"><Icon name="search" size={17}/><input ref={searchInput} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher…" aria-label="Rechercher des transactions"/><kbd>Ctrl K</kbd></label><span className="top-divider"/><button className="icon-button" aria-label={dark?'Activer le thème clair':'Activer le thème sombre'} onClick={()=>setDark(v=>!v)}><Icon name={dark?'sun':'moon'} size={18}/></button><div className="notice-wrap"><button className="icon-button notice-button" aria-label="Notifications" aria-expanded={noticeOpen} onClick={()=>setNoticeOpen(v=>!v)}><Icon name="bell" size={19}/><i/></button>{noticeOpen&&<div className="notice-popover"><strong>Tout est à jour <span>✓</span></strong><p>Aucune nouvelle alerte. Vos budgets sont suivis automatiquement.</p></div>}</div><span className="avatar top-avatar">SC</span></div></header>
      <div className="page-content"><div className="page-heading"><div><p className="eyebrow">VOTRE ESPACE FINANCIER</p><h1>{labels[view][0]}<span className="heading-star">✳</span></h1><p className="page-subtitle">{labels[view][1]}</p></div><div className="heading-actions"><button className="button button-quiet export-button" onClick={exportCsv}><Icon name="download" size={16}/>Exporter</button><button className="button button-primary" onClick={()=>{setEditing(null);setModal(true);}}><Icon name="plus" size={17}/>Nouvelle transaction</button></div></div>
        {view==='overview'&&<><section className="hero-grid"><div className="balance-card"><div className="balance-deco deco-a"/><div className="balance-deco deco-b"/><div className="balance-top"><div><span className="balance-label">SOLDE TOTAL</span><span className="live-pill"><i/>À jour</span></div><span className="balance-icon"><Icon name="wallet" size={20}/></span></div><strong className="balance-value">{euro(data.balance)}</strong><div className="balance-bottom"><span>Solde de tous vos comptes</span><b><Icon name="up" size={13}/>{rate}% <small>épargnés ce mois</small></b></div><svg className="balance-wave" viewBox="0 0 560 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0 68C50 66 65 50 112 58S175 75 220 48 295 52 332 40 397 58 435 31 510 39 560 14"/><path className="wave-fill" d="M0 68C50 66 65 50 112 58S175 75 220 48 295 52 332 40 397 58 435 31 510 39 560 14V90H0Z"/></svg></div><div className="savings-card"><div className="savings-heading"><span className="savings-icon"><Icon name="spark" size={17}/></span><span>{monthLabel}</span></div><p>Votre capacité d’épargne</p><strong>{euro(saved)}</strong><div className="savings-meter"><span style={{width:rate+'%'}}/></div><div className="savings-foot"><span>{rate}% des revenus conservés</span><i><Icon name="check" size={13}/></i></div><small>{saved>=0?'Vous dépensez moins que vous ne gagnez. Continuez ainsi !':'Vos dépenses dépassent vos revenus ce mois-ci.'}</small></div></section>
          <section className="stats-grid"><article className="stat-card"><div className="stat-top"><span className="stat-icon income-icon"><Icon name="down" size={18}/></span><span className="stat-period">Ce mois</span><Sparkline color="#51b997" values={[3,5,4,7,6,8,9]}/></div><span className="stat-label">Revenus</span><strong>{euro(income)}</strong><small className="stat-note good"><Icon name="up" size={13}/>Entrées enregistrées</small></article><article className="stat-card"><div className="stat-top"><span className="stat-icon expense-icon"><Icon name="up" size={18}/></span><span className="stat-period">Ce mois</span><Sparkline color="#ed8a76" values={[4,3,5,4,7,5,6]}/></div><span className="stat-label">Dépenses</span><strong>{euro(expense)}</strong><small className="stat-note neutral"><Icon name="receipt" size={13}/>Sorties enregistrées</small></article><article className="stat-card"><div className="stat-top"><span className="stat-icon saving-icon"><Icon name="trend" size={18}/></span><span className="stat-period">Ce mois</span><Sparkline color="#8978e8" values={[2,4,4,6,6,8,9]}/></div><span className="stat-label">Épargne nette</span><strong>{euro(saved)}</strong><small className="stat-note good"><Icon name="trend" size={13}/>{rate}% de vos revenus</small></article></section>
          <section className="dashboard-grid"><Chart transactions={data.transactions} period={period} setPeriod={setPeriod}/><BudgetPanel transactions={data.transactions}/></section>
          <section className="panel latest-panel"><div className="panel-heading"><div><p className="eyebrow">VOTRE ACTIVITÉ</p><h2>Transactions récentes</h2><p className="panel-subtitle">{monthLabel}</p></div><button className="text-button" onClick={()=>{setView('transactions');setFilter('all');}}>Tout afficher <Icon name="right" size={15}/></button></div><Transactions items={filtered.slice(0,5)} search={query} onEdit={item=>{setEditing(item);setModal(true);}} onDelete={remove}/></section></>}
        {view==='transactions'&&<section className="panel full-transactions"><div className="panel-heading"><div><p className="eyebrow">HISTORIQUE COMPLET</p><h2>Toutes les transactions</h2><p className="panel-subtitle">{filtered.length} opération{filtered.length>1?'s':''} enregistrée{filtered.length>1?'s':''}</p></div><button className="button button-quiet filter-button" onClick={()=>setFilter(f=>f==='all'?'depense':f==='depense'?'revenu':'all')}><Icon name="filter" size={15}/>{filter==='all'?'Tous les types':filter==='depense'?'Dépenses':'Revenus'}<Icon name="chevron" size={14}/></button></div><Transactions items={filtered} search={query} onEdit={item=>{setEditing(item);setModal(true);}} onDelete={remove}/></section>}
        {view==='budgets'&&<div className="dashboard-grid budget-view"><BudgetPanel transactions={data.transactions} all/><section className="panel guidance"><div className="guidance-art"><i/><i/><i/><Icon name="spark" size={24}/></div><p className="eyebrow">BON À SAVOIR</p><h2>La régularité fait la différence.</h2><p>Consultez vos enveloppes chaque semaine et ajustez-les au fil de vos priorités. Vos dépenses évoluent automatiquement avec vos transactions.</p><button className="button button-primary" onClick={()=>{setView('transactions');setFilter('depense');}}>Voir mes dépenses <Icon name="right" size={15}/></button></section></div>}
        {view==='reports'&&<><Chart transactions={data.transactions} period={period} setPeriod={setPeriod}/><section className="report-grid"><article className="panel report-stat"><span className="stat-icon income-icon"><Icon name="down"/></span><p>Revenus · {monthLabel}</p><strong>{euro(income)}</strong><small>Entrées enregistrées</small></article><article className="panel report-stat"><span className="stat-icon expense-icon"><Icon name="up"/></span><p>Dépenses · {monthLabel}</p><strong>{euro(expense)}</strong><small>Sorties enregistrées</small></article><article className="panel report-stat"><span className="stat-icon saving-icon"><Icon name="trend"/></span><p>Taux d’épargne</p><strong>{rate}%</strong><small>Part des revenus conservée</small></article></section></>}
        <footer className="page-footer"><span>© {new Date().getFullYear()} Atelier Finance</span><span><i/>Vos données restent enregistrées sur cet appareil.</span></footer>
      </div>
    </main>
    <Modal open={modal} item={editing} onClose={close} onSave={save}/>{toast&&<div className="toast" role="status"><i><Icon name="check" size={14}/></i>{toast}</div>}
  </div>;
}
