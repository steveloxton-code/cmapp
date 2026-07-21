import { CHANGE_TYPES, RISK_LEVELS, STAGES, BAR_C, RISK_C, fmtShort } from "../constants.jsx";
import { TypeBadge, StageBadge, RiskBadge } from "./Shared.jsx";

const MS_DAY = 86400000;

const ICONS = {
  total:    <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="2" rx="1" fill="currentColor"/><rect x="2" y="8" width="14" height="2" rx="1" fill="currentColor"/><rect x="2" y="13" width="9" height="2" rx="1" fill="currentColor"/></svg>,
  pending:  <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M9 5v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  cab:      <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M3 16c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  progress: <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M9 2.5a6.5 6.5 0 1 0 6.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M9 2.5 12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
};

export default function Dashboard({stats,changes,onFilter,onSelectChange}){
  const byType  = CHANGE_TYPES.map(t=>({type:t,count:changes.filter(c=>c.type===t).length}));
  const byRisk  = RISK_LEVELS.map(r=>({risk:r,count:changes.filter(c=>c.risk===r).length}));
  const byStage = STAGES.filter(s=>changes.some(c=>c.stage===s)).map(s=>({stage:s,count:changes.filter(c=>c.stage===s).length}));
  const maxType  = Math.max(...byType.map(x=>x.count),1);
  const maxRisk  = Math.max(...byRisk.map(x=>x.count),1);
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
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"1rem",marginBottom:"1rem"}}>
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,padding:"1.25rem"}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:16}}>Changes by type</div>
          {byType.map(({type,count})=>(
            <div key={type} onClick={()=>onFilter(type,null)} onMouseEnter={e=>e.currentTarget.style.background="var(--color-background-secondary)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              style={{marginBottom:10,padding:"7px 10px",borderRadius:8,cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <TypeBadge type={type}/><span style={{fontSize:12,fontWeight:500,color:"var(--color-text-secondary)"}}>{count}</span>
              </div>
              <div style={{height:5,background:"var(--color-background-secondary)",borderRadius:3,overflow:"hidden"}}>
                <div style={{width:`${(count/maxType)*100}%`,height:"100%",background:BAR_C[type],borderRadius:3,minWidth:count>0?"6px":"0"}}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,padding:"1.25rem"}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:16}}>Changes by risk</div>
          {byRisk.map(({risk,count})=>(
            <div key={risk} style={{marginBottom:10,padding:"7px 10px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <RiskBadge risk={risk}/><span style={{fontSize:12,fontWeight:500,color:"var(--color-text-secondary)"}}>{count}</span>
              </div>
              <div style={{height:5,background:"var(--color-background-secondary)",borderRadius:3,overflow:"hidden"}}>
                <div style={{width:`${(count/maxRisk)*100}%`,height:"100%",background:RISK_C[risk],borderRadius:3,minWidth:count>0?"6px":"0"}}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,padding:"1.25rem"}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:16}}>Changes by stage</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
            {byStage.map(({stage,count})=>(
              <div key={stage} onClick={()=>onFilter(null,stage)} onMouseEnter={e=>e.currentTarget.style.opacity="0.7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}
                style={{display:"flex",alignItems:"center",gap:5,background:"var(--color-background-secondary)",borderRadius:8,padding:"5px 10px 5px 7px",cursor:"pointer"}}>
                <StageBadge stage={stage}/><span style={{fontSize:11,fontWeight:500,color:"var(--color-text-secondary)"}}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,padding:"1.25rem"}}>
        <div style={{fontSize:13,fontWeight:600,marginBottom:16}}>Upcoming &amp; overdue</div>
        {dueSoon.length===0 && (
          <div style={{fontSize:13,color:"var(--color-text-tertiary)"}}>Nothing starting in the next 7 days.</div>
        )}
        {dueSoon.map(c=>(
          <div key={c.id} onClick={()=>onSelectChange&&onSelectChange(c)}
            onMouseEnter={e=>e.currentTarget.style.background="var(--color-background-secondary)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"9px 10px",borderRadius:8,cursor:"pointer"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
              <StageBadge stage={c.stage}/>
              <span style={{fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.title}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
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
