import { useState } from "react";
import { CHANGE_TYPES, STAGE_BG, STAGE_C, OUT_BG, OUT_C, T_C, fmtShort } from "../constants.jsx";
import { TypeBadge, StageBadge, RiskBadge, OutcomeBadge } from "./Shared.jsx";

export default function ChangeHistory({changes,onSelect}){
  const today = new Date();
  const fmt   = d=>d.toISOString().slice(0,10);
  const [from,setFrom]           = useState(fmt(new Date(today.getFullYear(),today.getMonth(),1)));
  const [to,setTo]               = useState(fmt(today));
  const [typeFilter,setTypeFilter] = useState("All");
  const [stgFilter,setStgFilter]   = useState("All");

  const fromMs = from?new Date(from).setHours(0,0,0,0):null;
  const toMs   = to?new Date(to).setHours(23,59,59,999):null;
  const hist   = changes.filter(c=>{
    const d = c.plannedEnd?new Date(c.plannedEnd).getTime():c.plannedStart?new Date(c.plannedStart).getTime():null;
    if(!d)return false;
    if(fromMs&&d<fromMs)return false;
    if(toMs&&d>toMs)return false;
    if(typeFilter!=="All"&&c.type!==typeFilter)return false;
    if(stgFilter!=="All"&&c.stage!==stgFilter)return false;
    return true;
  }).sort((a,b)=>new Date(b.plannedEnd||b.plannedStart)-new Date(a.plannedEnd||a.plannedStart));

  const presentStages = [...new Set(changes.map(c=>c.stage))];
  function setPreset(p){
    const t=new Date();
    if(p==="today"){setFrom(fmt(t));setTo(fmt(t));}
    if(p==="week"){const s=new Date(t);s.setDate(t.getDate()-7);setFrom(fmt(s));setTo(fmt(t));}
    if(p==="month"){setFrom(fmt(new Date(t.getFullYear(),t.getMonth(),1)));setTo(fmt(t));}
    if(p==="quarter"){const s=new Date(t);s.setMonth(t.getMonth()-3);setFrom(fmt(s));setTo(fmt(t));}
    if(p==="year"){setFrom(fmt(new Date(t.getFullYear(),0,1)));setTo(fmt(t));}
  }

  const byType    = CHANGE_TYPES.map(tp=>({type:tp,count:hist.filter(c=>c.type===tp).length}));
  const byStage   = ["Completed","Rejected"].map(s=>({stage:s,count:hist.filter(c=>c.stage===s).length})).filter(x=>x.count>0);
  const byOutcome = ["Successful","Successful with issues","Unsuccessful"].map(o=>({outcome:o,count:hist.filter(c=>c.outcome===o).length})).filter(x=>x.count>0);

  return (
    <div>
      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,padding:"1rem 1.25rem",marginBottom:"1rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><label style={{fontSize:12,fontWeight:500,color:"var(--color-text-secondary)",whiteSpace:"nowrap"}}>From</label><input type="date" value={from} onChange={e=>setFrom(e.target.value)} style={{fontSize:12,padding:"5px 8px",borderRadius:8,border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-secondary)",color:"var(--color-text-primary)"}}/></div>
          <div style={{display:"flex",alignItems:"center",gap:8}}><label style={{fontSize:12,fontWeight:500,color:"var(--color-text-secondary)",whiteSpace:"nowrap"}}>To</label><input type="date" value={to} onChange={e=>setTo(e.target.value)} style={{fontSize:12,padding:"5px 8px",borderRadius:8,border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-secondary)",color:"var(--color-text-primary)"}}/></div>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{[["today","Today"],["week","Last 7 days"],["month","This month"],["quarter","Last 3 months"],["year","This year"]].map(([p,l])=><button key={p} onClick={()=>setPreset(p)} style={{fontSize:11,padding:"4px 10px",cursor:"pointer",borderRadius:6,border:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-secondary)",color:"var(--color-text-secondary)"}}>{l}</button>)}</div>
          <div style={{display:"flex",gap:6,marginLeft:"auto"}}>
            <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} style={{fontSize:12,padding:"5px 8px",borderRadius:8,border:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)",color:"var(--color-text-primary)"}}><option>All</option>{CHANGE_TYPES.map(t=><option key={t}>{t}</option>)}</select>
            <select value={stgFilter} onChange={e=>setStgFilter(e.target.value)} style={{fontSize:12,padding:"5px 8px",borderRadius:8,border:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-primary)",color:"var(--color-text-primary)"}}><option>All</option>{presentStages.map(s=><option key={s}>{s}</option>)}</select>
          </div>
        </div>
      </div>
      {hist.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(0,1fr))",gap:10,marginBottom:"1rem"}}>
          <div style={{background:"var(--color-background-secondary)",borderRadius:10,padding:"10px 14px"}}><div style={{fontSize:11,color:"var(--color-text-secondary)",marginBottom:4}}>In range</div><div style={{fontSize:24,fontWeight:600,color:"#534AB7"}}>{hist.length}</div></div>
          {byType.filter(x=>x.count>0).map(({type,count})=><div key={type} style={{background:"var(--color-background-secondary)",borderRadius:10,padding:"10px 14px"}}><div style={{fontSize:11,color:"var(--color-text-secondary)",marginBottom:4}}>{type}</div><div style={{fontSize:24,fontWeight:600,color:T_C[type]}}>{count}</div></div>)}
          {byStage.map(({stage,count})=><div key={stage} style={{background:STAGE_BG[stage],borderRadius:10,padding:"10px 14px"}}><div style={{fontSize:11,color:STAGE_C[stage],marginBottom:4,opacity:0.8}}>{stage}</div><div style={{fontSize:24,fontWeight:600,color:STAGE_C[stage]}}>{count}</div></div>)}
          {byOutcome.map(({outcome,count})=><div key={outcome} style={{background:OUT_BG[outcome],borderRadius:10,padding:"10px 14px"}}><div style={{fontSize:11,color:OUT_C[outcome],marginBottom:4,opacity:0.8}}>{outcome}</div><div style={{fontSize:24,fontWeight:600,color:OUT_C[outcome]}}>{count}</div></div>)}
        </div>
      )}
      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",tableLayout:"fixed"}}>
          <colgroup><col style={{width:80}}/><col style={{width:88}}/><col/><col style={{width:110}}/><col style={{width:88}}/><col style={{width:72}}/><col style={{width:110}}/><col style={{width:120}}/></colgroup>
          <thead>
            <tr style={{borderBottom:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-secondary)"}}>
              {["ID","Type","Title","Service","End","Risk","Stage","Outcome"].map(h=>(
                <th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:11,fontWeight:600,color:"var(--color-text-secondary)",letterSpacing:"0.05em"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hist.length===0&&<tr><td colSpan={8} style={{padding:"2.5rem",textAlign:"center",color:"var(--color-text-secondary)",fontSize:13}}>No changes found in this date range</td></tr>}
            {hist.map((item,i)=>(
              <tr key={item.id} onClick={()=>onSelect(item)} onMouseEnter={e=>e.currentTarget.style.background="var(--color-background-secondary)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                style={{borderBottom:i<hist.length-1?"0.5px solid var(--color-border-tertiary)":"none",cursor:"pointer"}}>
                <td style={{padding:"11px 12px",fontWeight:600,color:"#534AB7",fontSize:12}}>{item.id}</td>
                <td style={{padding:"11px 12px"}}><TypeBadge type={item.type}/></td>
                <td style={{padding:"11px 12px",fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</td>
                <td style={{padding:"11px 12px",fontSize:12,color:"var(--color-text-secondary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.service||"—"}</td>
                <td style={{padding:"11px 12px",fontSize:12,color:"var(--color-text-secondary)",whiteSpace:"nowrap"}}>{fmtShort(item.plannedEnd||item.plannedStart)}</td>
                <td style={{padding:"11px 12px"}}><RiskBadge risk={item.risk}/></td>
                <td style={{padding:"11px 12px"}}><StageBadge stage={item.stage}/></td>
                <td style={{padding:"11px 12px"}}>{item.outcome?<OutcomeBadge outcome={item.outcome}/>:<span style={{fontSize:12,color:"var(--color-text-tertiary)"}}>—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
