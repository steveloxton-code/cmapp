import { fmtDate, clashCheck } from "../constants.jsx";
import { Badge, TypeBadge, RiskBadge, StageBadge, OutcomeBadge, TmplBadge } from "./Shared.jsx";

export default function CABView({pendingCAB,prevWeek,cabTab,setCabTab,role,onSelect,allChanges,pendingTmpls,onUpdateTemplateStatus}){
  return (
    <div>
      <div style={{display:"flex",gap:2,borderBottom:"0.5px solid var(--color-border-tertiary)",marginBottom:"1.25rem"}}>
        {[["pending",`Changes${pendingCAB.length>0?` (${pendingCAB.length})`:""}`],["templates",`Template proposals${pendingTmpls.length>0?` (${pendingTmpls.length})`:""}`],["previous","Previous week"]].map(([v,l])=>(
          <button key={v} onClick={()=>setCabTab(v)} style={{background:"none",border:"none",padding:"8px 16px",fontSize:13,fontWeight:500,cursor:"pointer",borderBottom:cabTab===v?"2px solid var(--color-text-primary)":"2px solid transparent",color:cabTab===v?"var(--color-text-primary)":"var(--color-text-secondary)",marginBottom:-1}}>{l}</button>
        ))}
      </div>

      {cabTab==="pending"&&(pendingCAB.length===0
        ? <div style={{color:"var(--color-text-secondary)",fontSize:13,padding:"2rem 0",textAlign:"center"}}>No changes currently awaiting CAB review.</div>
        : <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
            {pendingCAB.map(item=>{
              const clashes = clashCheck(item,allChanges);
              return (
                <div key={item.id} onClick={()=>onSelect(item)} onMouseEnter={e=>e.currentTarget.style.background="var(--color-background-secondary)"} onMouseLeave={e=>e.currentTarget.style.background="var(--color-background-primary)"}
                  style={{background:"var(--color-background-primary)",border:clashes.length>0?"0.5px solid #EF9F27":"0.5px solid var(--color-border-tertiary)",borderRadius:14,padding:"1rem 1.25rem",cursor:"pointer"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:12,fontWeight:600,color:"#534AB7"}}>{item.id}</span><TypeBadge type={item.type}/><RiskBadge risk={item.risk}/>
                      {item.templateId&&<Badge label="Template" bg="#EEEDFE" color="#534AB7"/>}
                      {clashes.length>0&&(
                        <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,background:"#FAEEDA",color:"#854F0B",padding:"3px 9px",borderRadius:20,fontWeight:500}}>
                          <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M8 2L1 14h14L8 2z" stroke="#854F0B" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 7v3M8 11.5v.5" stroke="#854F0B" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          Clash{clashes.length>1?"es":""} ({clashes.length})
                        </span>
                      )}
                    </div>
                    <StageBadge stage={item.stage}/>
                  </div>
                  <div style={{fontSize:14,fontWeight:500,marginBottom:6}}>{item.title}</div>
                  <div style={{display:"flex",gap:16,fontSize:12,color:"var(--color-text-secondary)"}}><span>{item.service}</span><span>·</span><span>{fmtDate(item.plannedStart)} → {fmtDate(item.plannedEnd)}</span></div>
                  {clashes.length>0&&(
                    <div style={{marginTop:8,paddingTop:8,borderTop:"0.5px solid #EF9F27"}}>
                      {clashes.map(cl=>(
                        <div key={cl.id} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#854F0B",marginTop:2}}>
                          <span style={{fontWeight:600}}>{cl.id}</span><span>{cl.title}</span><span>·</span><span>{fmtDate(cl.plannedStart)} → {fmtDate(cl.plannedEnd)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
      )}

      {cabTab==="templates"&&(pendingTmpls.length===0
        ? <div style={{color:"var(--color-text-secondary)",fontSize:13,padding:"2rem 0",textAlign:"center"}}>No template proposals awaiting review.</div>
        : <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
            {pendingTmpls.map(t=>(
              <div key={t.id} style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,padding:"1rem 1.25rem"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:12,fontWeight:600,color:"#534AB7"}}>{t.id}</span><RiskBadge risk={t.risk}/><TmplBadge status={t.status}/></div>
                  {(role==="Change Manager"||role==="CAB Approver")&&<div style={{display:"flex",gap:6}}>
                    <button onClick={()=>onUpdateTemplateStatus(t.id,"Approved")} style={{fontSize:11,padding:"5px 12px",cursor:"pointer",background:"#EAF3DE",color:"#27500A",border:"0.5px solid #27500A",borderRadius:7,fontWeight:500}}>Approve — add to library</button>
                    <button onClick={()=>onUpdateTemplateStatus(t.id,"Rejected")} style={{fontSize:11,padding:"5px 12px",cursor:"pointer",background:"#FCEBEB",color:"#791F1F",border:"0.5px solid #791F1F",borderRadius:7,fontWeight:500}}>Reject</button>
                  </div>}
                </div>
                <div style={{fontSize:14,fontWeight:500,marginBottom:4}}>{t.title}</div>
                <div style={{fontSize:12,color:"var(--color-text-secondary)",marginBottom:8}}>{t.service} · Proposed by {t.proposedBy} on {t.proposedAt}</div>
                <div style={{fontSize:12,color:"var(--color-text-secondary)",background:"var(--color-background-secondary)",padding:"8px 12px",borderRadius:8,marginBottom:6}}><strong>Description:</strong> {t.description}</div>
                <div style={{fontSize:12,color:"var(--color-text-secondary)",background:"var(--color-background-secondary)",padding:"8px 12px",borderRadius:8}}><strong>Rollback:</strong> {t.rollback}</div>
                {t.rationale&&<div style={{fontSize:12,color:"var(--color-text-secondary)",background:"var(--color-background-secondary)",padding:"8px 12px",borderRadius:8,marginTop:6}}><strong>Rationale:</strong> {t.rationale}</div>}
              </div>
            ))}
          </div>
      )}

      {cabTab==="previous"&&(
        <div>
          <p style={{fontSize:13,color:"var(--color-text-secondary)",marginTop:0,marginBottom:"1rem"}}>Changes completed or rejected in the past 7 days.</p>
          {prevWeek.length===0
            ? <div style={{color:"var(--color-text-secondary)",fontSize:13,textAlign:"center",padding:"2rem 0"}}>No changes to review from the previous week.</div>
            : <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
                {prevWeek.map(item=>(
                  <div key={item.id} onClick={()=>onSelect(item)} onMouseEnter={e=>e.currentTarget.style.background="var(--color-background-secondary)"} onMouseLeave={e=>e.currentTarget.style.background="var(--color-background-primary)"}
                    style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,padding:"1rem 1.25rem",cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <span style={{fontSize:12,fontWeight:600,color:"#534AB7"}}>{item.id}</span><TypeBadge type={item.type}/><StageBadge stage={item.stage}/>{item.outcome&&<OutcomeBadge outcome={item.outcome}/>}
                    </div>
                    <div style={{fontSize:14,fontWeight:500,marginBottom:4}}>{item.title}</div>
                    <div style={{fontSize:12,color:"var(--color-text-secondary)"}}>{item.service} · Ended {fmtDate(item.plannedEnd)}</div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}
    </div>
  );
}
