import { RISK_LEVELS, RISK_C, fmtShort } from "../constants.jsx";
import { StageBadge, RiskBadge } from "./Shared.jsx";

const MS_DAY = 86400000;

const ICONS = {
  total:    <svg width="24" height="24" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="2" rx="1" fill="currentColor"/><rect x="2" y="8" width="14" height="2" rx="1" fill="currentColor"/><rect x="2" y="13" width="9" height="2" rx="1" fill="currentColor"/></svg>,
  pending:  <svg width="24" height="24" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M9 5v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  cab:      <svg width="24" height="24" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M3 16c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  progress: <svg width="24" height="24" viewBox="0 0 18 18" fill="none"><path d="M9 2.5a6.5 6.5 0 1 0 6.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M9 2.5 12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
};

export default function Dashboard({stats,changes,onFilter,onSelectChange}){
  const byRisk  = RISK_LEVELS.map(r=>({risk:r,count:changes.filter(c=>c.risk===r).length}));
  const riskTotal = byRisk.reduce((s,x)=>s+x.count,0);
  const DONUT_R = 52, DONUT_STROKE = 22, DONUT_GAP = 3;
  const DONUT_CIRC = 2*Math.PI*DONUT_R;
  let _cum = 0;
  const donutSegs = byRisk.map(({risk,count})=>{
    const frac    = riskTotal>0 ? count/riskTotal : 0;
    const len     = frac*DONUT_CIRC;
    const visible = Math.max(len-DONUT_GAP,0);
    const seg     = {risk,count,pct:riskTotal>0?Math.round(frac*100):0,dasharray:`${visible} ${DONUT_CIRC-visible}`,dashoffset:-_cum};
    _cum += len;
    return seg;
  });
  const cards = [
    {label:"Total changes",    value:stats.total,      grad:"135deg,#6C63FF,#534AB7",stage:null,type:null,             icon:ICONS.total},
    {label:"Pending / New",    value:stats.pending,    grad:"135deg,#F4A541,#BA7517",stage:"Pending",type:null,        icon:ICONS.pending},
    {label:"Awaiting CAB",     value:stats.cab,        grad:"135deg,#378ADD,#185FA5",stage:"Awaiting CAB",type:null,   icon:ICONS.cab},
    {label:"In implementation",value:stats.inProgress, grad:"135deg,#E8312A,#991B1B",stage:"Implementation",type:null, icon:ICONS.progress},
  ];

  const now = new Date();
  const dueSoon = changes
    .filter(c=>!["Completed","Rejected"].includes(c.stage))
    .map(c=>{
      const start   = c.plannedStart ? new Date(c.plannedStart) : null;
      const end     = c.plannedEnd   ? new Date(c.plannedEnd)   : null;
      const overdue = !!(end && end < now);
      return {...c,_start:start,_end:end,_overdue:overdue};
    })
    .filter(c=>c._overdue || (c._start && c._start-now <= 7*MS_DAY))
    .sort((a,b)=>{
      if(a._overdue!==b._overdue) return a._overdue?-1:1;
      return (a._overdue?a._end:a._start) - (b._overdue?b._end:b._start);
    })
    .slice(0,6);

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:"1.5rem"}}>
        {cards.map(({label,value,grad,stage,type,icon})=>(
          <div key={label} onClick={()=>onFilter(type,stage)} onMouseEnter={e=>e.currentTarget.style.opacity="0.85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}
            style={{background:`linear-gradient(${grad})`,borderRadius:14,padding:"1.1rem 1.25rem",cursor:"pointer",transition:"opacity 0.15s",boxShadow:"0 2px 8px rgba(0,0,0,0.10)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.75)",fontWeight:500,letterSpacing:"0.03em"}}>{label.toUpperCase()}</div>
              <div style={{color:"rgba(255,255,255,0.55)"}}>{icon}</div>
            </div>
            <div style={{fontSize:34,fontWeight:700,color:"white",lineHeight:1}}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:"1rem"}}>
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,padding:"1.25rem",maxWidth:420}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:16}}>Changes by risk</div>
          <div style={{display:"flex",alignItems:"center",gap:18}}>
            <svg width="120" height="120" viewBox="-4 -4 128 128" style={{flexShrink:0}}>
              <circle cx="60" cy="60" r={DONUT_R} fill="none" stroke="var(--color-background-secondary)" strokeWidth={DONUT_STROKE}/>
              <g transform="rotate(-90 60 60)">
                {donutSegs.filter(s=>s.count>0).map(s=>(
                  <circle key={s.risk} cx="60" cy="60" r={DONUT_R} fill="none" stroke={RISK_C[s.risk]} strokeWidth={DONUT_STROKE}
                    strokeDasharray={s.dasharray} strokeDashoffset={s.dashoffset} strokeLinecap="round"
                    style={{transition:"stroke-width 0.15s",cursor:"default"}}
                    onMouseEnter={e=>e.currentTarget.style.strokeWidth=DONUT_STROKE+4}
                    onMouseLeave={e=>e.currentTarget.style.strokeWidth=DONUT_STROKE}>
                    <title>{`${s.risk}: ${s.count} (${s.pct}%)`}</title>
                  </circle>
                ))}
              </g>
              <text x="60" y="57" textAnchor="middle" style={{fontSize:22,fontWeight:700,fill:"var(--color-text-primary)"}}>{riskTotal}</text>
              <text x="60" y="73" textAnchor="middle" style={{fontSize:10,fill:"var(--color-text-tertiary)"}}>changes</text>
            </svg>
            <div style={{flex:1,minWidth:0}}>
              {byRisk.map(({risk,count})=>{
                const pct = riskTotal>0 ? Math.round(count/riskTotal*100) : 0;
                return (
                  <div key={risk} onMouseEnter={e=>e.currentTarget.style.background="var(--color-background-secondary)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                    style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 8px",borderRadius:8,marginBottom:2}}>
                    <RiskBadge risk={risk}/>
                    <span style={{fontSize:12,fontWeight:500,color:"var(--color-text-secondary)"}}>{count} <span style={{color:"var(--color-text-tertiary)"}}>· {pct}%</span></span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,padding:"1.25rem"}}>
        <div style={{fontSize:13,fontWeight:600,marginBottom:16}}>Upcoming &amp; overdue</div>
        {dueSoon.length===0 && (
          <div style={{fontSize:13,color:"var(--color-text-tertiary)"}}>Nothing starting in the next 7 days.</div>
        )}
        {dueSoon.length>0 && (
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"0 10px 6px",borderBottom:"0.5px solid var(--color-border-tertiary)",marginBottom:4}}>
            <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
              <span style={{fontSize:11,fontWeight:600,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:"0.02em"}}>Change</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
              <span style={{fontSize:11,fontWeight:600,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:"0.02em",width:100}}>Stage</span>
              <span style={{fontSize:11,fontWeight:600,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:"0.02em",width:70}}>Risk</span>
              <span style={{fontSize:11,fontWeight:600,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:"0.02em",width:110,textAlign:"right"}}>Date</span>
            </div>
          </div>
        )}
        {dueSoon.map(c=>(
          <div key={c.id} onClick={()=>onSelectChange&&onSelectChange(c)}
            onMouseEnter={e=>e.currentTarget.style.background="var(--color-background-secondary)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"9px 10px",borderRadius:8,cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
              <span style={{fontSize:12,fontWeight:600,color:"var(--color-text-tertiary)",flexShrink:0}}>{c.id}</span>
              <span style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
              <StageBadge stage={c.stage}/>
              <RiskBadge risk={c.risk}/>
              <span style={{fontSize:11,fontWeight:600,color:c._overdue?"#791F1F":"var(--color-text-secondary)"}}>
                {c._overdue ? `Overdue · ${fmtShort(c._end)}` : `Starts ${fmtShort(c._start)}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
