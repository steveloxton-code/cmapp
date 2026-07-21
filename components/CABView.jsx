import { useState } from "react";
import { fmtDate, clashCheck } from "../constants.jsx";
import { Badge, TypeBadge, RiskBadge, StageBadge, OutcomeBadge, TmplBadge } from "./Shared.jsx";

const DRAG_HANDLE = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="4" cy="3" r="1.3" fill="currentColor"/><circle cx="10" cy="3" r="1.3" fill="currentColor"/>
    <circle cx="4" cy="7" r="1.3" fill="currentColor"/><circle cx="10" cy="7" r="1.3" fill="currentColor"/>
    <circle cx="4" cy="11" r="1.3" fill="currentColor"/><circle cx="10" cy="11" r="1.3" fill="currentColor"/>
  </svg>
);

function Panel({label,count,grad,active,onClick}){
  return (
    <div onClick={onClick}
      onMouseEnter={e=>{if(!active)e.currentTarget.style.opacity="0.85";}} onMouseLeave={e=>e.currentTarget.style.opacity="1"}
      style={{background:`linear-gradient(${grad})`,borderRadius:14,padding:"1.1rem 1.25rem",cursor:"pointer",transition:"opacity 0.15s,box-shadow 0.15s",boxShadow:active?"0 0 0 2px var(--color-background-primary), 0 0 0 4px #0f172a33, 0 2px 8px rgba(0,0,0,0.10)":"0 2px 8px rgba(0,0,0,0.10)",opacity:active?1:0.7}}>
      <div style={{fontSize:11,color:"rgba(255,255,255,0.75)",fontWeight:500,letterSpacing:"0.03em",marginBottom:6}}>{label.toUpperCase()}</div>
      <div style={{fontSize:34,fontWeight:700,color:"white",lineHeight:1}}>{count}</div>
    </div>
  );
}

function ClashBadge({clashes}){
  if(clashes.length===0) return null;
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,background:"#FAEEDA",color:"#854F0B",padding:"3px 9px",borderRadius:20,fontWeight:500}}>
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M8 2L1 14h14L8 2z" stroke="#854F0B" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 7v3M8 11.5v.5" stroke="#854F0B" strokeWidth="1.5" strokeLinecap="round"/></svg>
      Clash{clashes.length>1?"es":""} ({clashes.length})
    </span>
  );
}

function CabRow({item,index,clashes,draggable,isDragging,onDragStart,onDragEnter,onDragEnd,onSelect}){
  return (
    <div
      draggable={draggable}
      onDragStart={draggable?()=>onDragStart(index):undefined}
      onDragEnter={draggable?()=>onDragEnter(index):undefined}
      onDragEnd={draggable?onDragEnd:undefined}
      onDragOver={draggable?e=>e.preventDefault():undefined}
      onClick={()=>onSelect(item)}
      onMouseEnter={e=>e.currentTarget.style.background="var(--color-background-secondary)"} onMouseLeave={e=>e.currentTarget.style.background="var(--color-background-primary)"}
      style={{display:"flex",gap:10,alignItems:"flex-start",background:"var(--color-background-primary)",border:clashes.length>0?"0.5px solid #EF9F27":"0.5px solid var(--color-border-tertiary)",borderRadius:14,padding:"1rem 1.25rem",cursor:"pointer",opacity:isDragging?0.4:1}}>
      {draggable&&(
        <div onClick={e=>e.stopPropagation()} title="Drag to reorder" style={{color:"var(--color-text-tertiary)",paddingTop:2,cursor:"grab",flexShrink:0}}>
          {DRAG_HANDLE}
        </div>
      )}
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{fontSize:12,fontWeight:600,color:"#534AB7"}}>{item.id}</span><TypeBadge type={item.type}/><RiskBadge risk={item.risk}/>
            {item.templateId&&<Badge label="Template" bg="#EEEDFE" color="#534AB7"/>}
            <ClashBadge clashes={clashes}/>
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
      <div style={{fontSize:11,fontWeight:700,color:"var(--color-text-tertiary)",flexShrink:0,paddingTop:2}}>#{index+1}</div>
    </div>
  );
}

export default function CABView({orderedCab,cabOrder,onReorder,meetingStage,meetingStartedAt,onStartMeeting,onResumeMeeting,onResetMeeting,prevWeek,cabTab,setCabTab,role,onSelect,allChanges,pendingTmpls,onUpdateTemplateStatus}){
  const [dragIndex,setDragIndex] = useState(null);

  function handleDragStart(i){ setDragIndex(i); }
  function handleDragEnter(i){
    if(dragIndex===null||dragIndex===i) return;
    const next=[...cabOrder];
    const [moved]=next.splice(dragIndex,1);
    next.splice(i,0,moved);
    setDragIndex(i);
    onReorder(next);
  }
  function handleDragEnd(){ setDragIndex(null); }

  const decidedCount = orderedCab.filter(c=>c.stage!=="Awaiting CAB").length;

  const panels = [
    ["pending","Changes",orderedCab.length,"135deg,#378ADD,#185FA5"],
    ["templates","Template proposals",pendingTmpls.length,"135deg,#6C63FF,#534AB7"],
    ["review","Review",prevWeek.length,"135deg,#27500A,#085041"],
  ];
  if(meetingStage!=="setup") panels.push(["outcome","Meeting outcome",decidedCount,"135deg,#854F0B,#633806"]);

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${panels.length},1fr)`,gap:12,marginBottom:"1.5rem"}}>
        {panels.map(([id,label,count,grad])=>(
          <Panel key={id} label={label} count={count} grad={grad} active={cabTab===id} onClick={()=>setCabTab(id)}/>
        ))}
      </div>

      {cabTab==="pending"&&(orderedCab.length===0
        ? <div style={{color:"var(--color-text-secondary)",fontSize:13,padding:"2rem 0",textAlign:"center"}}>No changes currently awaiting CAB review.</div>
        : <div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.75rem",marginBottom:"1rem"}}>
              {orderedCab.map((item,i)=>(
                <CabRow key={item.id} item={item} index={i} clashes={clashCheck(item,allChanges)}
                  draggable={meetingStage==="setup"} isDragging={dragIndex===i}
                  onDragStart={handleDragStart} onDragEnter={handleDragEnter} onDragEnd={handleDragEnd}
                  onSelect={onSelect}/>
              ))}
            </div>
            {meetingStage==="setup"&&(
              <button onClick={onStartMeeting} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",padding:"12px 16px",fontSize:14,fontWeight:600,cursor:"pointer",background:"#E8312A",color:"white",border:"none",borderRadius:10}}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 1.5v10l9-5-9-5z" fill="white"/></svg>
                Start CAB meeting
              </button>
            )}
            {meetingStage==="running"&&(
              <button onClick={onResumeMeeting} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",padding:"12px 16px",fontSize:14,fontWeight:600,cursor:"pointer",background:"#534AB7",color:"white",border:"none",borderRadius:10}}>
                Resume CAB meeting →
              </button>
            )}
            {meetingStage==="ended"&&(
              <div style={{textAlign:"center",fontSize:13,color:"var(--color-text-secondary)"}}>Meeting ended — see the Meeting outcome panel for the summary.</div>
            )}
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

      {cabTab==="review"&&(
        <div>
          <p style={{fontSize:13,color:"var(--color-text-secondary)",marginTop:0,marginBottom:"1rem"}}>Normal and Emergency changes completed or rejected in the past 7 days.</p>
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

      {cabTab==="outcome"&&(
        <div>
          <div style={{display:"flex",gap:10,marginBottom:"1.25rem",flexWrap:"wrap"}}>
            <Badge label={`${orderedCab.filter(c=>c.stage==="Approved").length} approved`} bg="#EAF3DE" color="#27500A"/>
            <Badge label={`${orderedCab.filter(c=>c.stage==="Rejected").length} rejected`} bg="#FCEBEB" color="#791F1F"/>
            <Badge label={`${orderedCab.filter(c=>c.stage==="Awaiting CAB").length} not yet reviewed`} bg="var(--color-background-secondary)" color="var(--color-text-secondary)"/>
          </div>
          {orderedCab.length===0
            ? <div style={{color:"var(--color-text-secondary)",fontSize:13,padding:"2rem 0",textAlign:"center"}}>No meeting has been run yet.</div>
            : <div style={{display:"flex",flexDirection:"column",gap:"0.75rem",marginBottom:"1.25rem"}}>
                {orderedCab.map(item=>{
                  const tasksAdded = meetingStartedAt ? (item.tasks||[]).filter(t=>t.createdAt&&new Date(t.createdAt)>=new Date(meetingStartedAt)) : [];
                  return (
                    <div key={item.id} style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,padding:"1rem 1.25rem"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:12,fontWeight:600,color:"#534AB7"}}>{item.id}</span><TypeBadge type={item.type}/><RiskBadge risk={item.risk}/></div>
                        <StageBadge stage={item.stage}/>
                      </div>
                      <div style={{fontSize:14,fontWeight:500,marginBottom:6}}>{item.title}</div>
                      {item.cabNotes&&<div style={{fontSize:12,color:"var(--color-text-secondary)",background:"var(--color-background-secondary)",padding:"8px 12px",borderRadius:8,marginBottom:tasksAdded.length>0?6:0}}><strong>Decision notes:</strong> {item.cabNotes}</div>}
                      {tasksAdded.length>0&&(
                        <div style={{fontSize:12,color:"var(--color-text-secondary)",background:"var(--color-background-secondary)",padding:"8px 12px",borderRadius:8}}>
                          <strong>Actions assigned:</strong>
                          {tasksAdded.map(t=><div key={t.id} style={{marginTop:4}}>• {t.title} — {t.assignedTo}</div>)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
          }
          <button onClick={onResetMeeting} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",padding:"12px 16px",fontSize:14,fontWeight:600,cursor:"pointer",background:"var(--color-background-secondary)",color:"var(--color-text-primary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:10}}>
            Start new meeting
          </button>
        </div>
      )}
    </div>
  );
}
