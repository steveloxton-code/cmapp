import { useState } from "react";
import { ALL_USERS, STAGE_BG, STAGE_C, OUT_BG, OUT_C, fmtDate, fmtShort, nowISO, clashCheck, initTask } from "../constants.jsx";
import { Badge, StageBadge, TypeBadge, RiskBadge, OutcomeBadge, TaskStatusBadge, PriBadge, FieldRow } from "./Shared.jsx";

// ── Stage progress stepper ────────────────────────────────────────────────────
function StageProgress({stage}){
  const steps = ["New","Awaiting CAB","Approved","Implementation","Review","Completed"];
  if(stage==="Rejected"){
    return (
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 0",marginBottom:"1rem"}}>
        <Badge label="Rejected" bg={STAGE_BG["Rejected"]} color={STAGE_C["Rejected"]}/>
        <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>This change was rejected by the CAB.</span>
      </div>
    );
  }
  const cur = steps.indexOf(stage);
  return (
    <div style={{marginBottom:"1.25rem"}}>
      <div style={{display:"flex",alignItems:"center"}}>
        {steps.map((step,i)=>{
          const done=i<cur, active=i===cur;
          return (
            <div key={step} style={{display:"flex",alignItems:"center",flex:i<steps.length-1?1:"none"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,minWidth:0}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:done?"#534AB7":active?"#E8312A":"var(--color-background-secondary)",border:active?"2px solid #E8312A":done?"2px solid #534AB7":"1.5px solid var(--color-border-secondary)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  {done
                    ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <span style={{width:6,height:6,borderRadius:"50%",background:active?"#E8312A":"var(--color-border-secondary)",display:"block"}}/>
                  }
                </div>
                <span style={{fontSize:9,fontWeight:active?600:400,color:active?"var(--color-text-primary)":done?"#534AB7":"var(--color-text-tertiary)",whiteSpace:"nowrap",textAlign:"center"}}>{step}</span>
              </div>
              {i<steps.length-1&&<div style={{flex:1,height:2,background:done?"#534AB7":"var(--color-background-secondary)",margin:"0 4px",marginBottom:14}}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Review panel ──────────────────────────────────────────────────────────────
function ReviewPanel({change,onFieldUpdate,onStageChange}){
  const [outcome,setOutcome] = useState(null);
  const [notes,setNotes]     = useState("");
  const duration = (()=>{
    if(!change.actualStart||!change.actualEnd)return null;
    const mins=Math.round((new Date(change.actualEnd)-new Date(change.actualStart))/60000);
    return `${mins} min${mins!==1?"s":""}`;
  })();
  function submit(){if(!outcome)return;onFieldUpdate(change.id,{outcome,reviewNotes:notes.trim()||null});onStageChange(change.id,"Completed");}
  const canSubmit = outcome&&(outcome==="Successful"||notes.trim());
  return (
    <div style={{margin:"1rem 1.25rem",background:"#E6F1FB",borderRadius:10,padding:"1rem",border:"0.5px solid #378ADD"}}>
      <div style={{fontSize:13,fontWeight:600,color:"#0C447C",marginBottom:4}}>Post-implementation review</div>
      <div style={{fontSize:12,color:"#185FA5",marginBottom:12}}>Actual: {fmtDate(change.actualStart)} → {fmtDate(change.actualEnd)}{duration&&<span style={{marginLeft:8,fontWeight:500}}>({duration})</span>}</div>
      <div style={{fontSize:13,color:"#185FA5",marginBottom:8}}>How did the implementation go?</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
        {["Successful","Successful with issues","Unsuccessful"].map(o=>(
          <button key={o} onClick={()=>setOutcome(o)} style={{fontSize:12,padding:"7px 16px",cursor:"pointer",borderRadius:8,fontWeight:outcome===o?600:400,background:outcome===o?OUT_BG[o]:"var(--color-background-primary)",color:OUT_C[o],border:`${outcome===o?"1.5px":"0.5px"} solid ${OUT_C[o]}`,transition:"all 0.12s"}}>
            {outcome===o&&"✓ "}{o}
          </button>
        ))}
      </div>
      {outcome&&(
        <div style={{marginBottom:12}}>
          <label style={{fontSize:12,fontWeight:500,color:"#0C447C",display:"block",marginBottom:6}}>Notes {outcome==="Successful"?"(optional)":"*"}</label>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3}
            placeholder={outcome==="Successful"?"Any observations or lessons learned…":outcome==="Successful with issues"?"Describe the issues encountered…":"Describe what went wrong and remediation taken…"}
            style={{width:"100%",boxSizing:"border-box",fontSize:13,borderRadius:8,border:"0.5px solid #378ADD",padding:"8px 10px",background:"white",color:"#0f172a",resize:"vertical",lineHeight:1.5}}/>
        </div>
      )}
      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <button onClick={submit} disabled={!canSubmit} style={{fontSize:12,padding:"7px 18px",cursor:canSubmit?"pointer":"not-allowed",background:outcome?OUT_BG[outcome]:"var(--color-background-secondary)",color:outcome?OUT_C[outcome]:"var(--color-text-tertiary)",border:`0.5px solid ${outcome?OUT_C[outcome]:"var(--color-border-tertiary)"}`,borderRadius:8,fontWeight:500,opacity:canSubmit?1:0.5}}>
          Confirm outcome
        </button>
      </div>
    </div>
  );
}

// ── Task row ──────────────────────────────────────────────────────────────────
function TaskRow({task,changeId,onUpdateTask,dimmed}){
  const overdue = task.dueDate&&new Date(task.dueDate)<new Date()&&!["Completed","Cancelled"].includes(task.status);
  return (
    <div style={{display:"flex",alignItems:"flex-start",gap:12,padding:"10px 0",borderBottom:"0.5px solid var(--color-border-tertiary)",opacity:dimmed?0.6:1}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap"}}>
          <span style={{fontSize:11,fontWeight:600,color:"#534AB7"}}>{task.id}</span>
          <TaskStatusBadge status={task.status}/><PriBadge priority={task.priority}/>
          {overdue&&<Badge label="Overdue" bg="#FCEBEB" color="#791F1F"/>}
        </div>
        <div style={{fontSize:13,fontWeight:500,marginBottom:2}}>{task.title}</div>
        {task.description&&<div style={{fontSize:12,color:"var(--color-text-secondary)",marginBottom:4}}>{task.description}</div>}
        <div style={{display:"flex",gap:12,fontSize:11,color:"var(--color-text-tertiary)",flexWrap:"wrap"}}>
          <span>👤 {task.assignedTo}</span>{task.dueDate&&<span>📅 Due {fmtShort(task.dueDate)}</span>}<span>Created by {task.createdBy}</span>
        </div>
      </div>
      {!dimmed&&(
        <div style={{display:"flex",gap:5,flexShrink:0}}>
          {task.status==="Open"&&<button onClick={()=>onUpdateTask(changeId,task.id,{status:"In Progress"})} style={{fontSize:11,padding:"4px 9px",cursor:"pointer",background:"#FAEEDA",color:"#854F0B",border:"0.5px solid #854F0B",borderRadius:6,fontWeight:500,whiteSpace:"nowrap"}}>Start</button>}
          {task.status==="In Progress"&&<button onClick={()=>onUpdateTask(changeId,task.id,{status:"Completed"})} style={{fontSize:11,padding:"4px 9px",cursor:"pointer",background:"#EAF3DE",color:"#27500A",border:"0.5px solid #27500A",borderRadius:6,fontWeight:500,whiteSpace:"nowrap"}}>Complete</button>}
          {!["Completed","Cancelled"].includes(task.status)&&<button onClick={()=>onUpdateTask(changeId,task.id,{status:"Cancelled"})} style={{fontSize:11,padding:"4px 9px",cursor:"pointer",background:"#F1EFE8",color:"#888780",border:"0.5px solid #888780",borderRadius:6,fontWeight:500}}>✕</button>}
        </div>
      )}
    </div>
  );
}

// ── Tasks panel ───────────────────────────────────────────────────────────────
function ChangeTasksPanel({change,onAddTask,onUpdateTask}){
  const [showForm,setShowForm] = useState(false);
  const [form,setForm]         = useState(initTask());
  const tasks = change.tasks||[];
  const open  = tasks.filter(t=>!["Completed","Cancelled"].includes(t.status));
  const done  = tasks.filter(t=> ["Completed","Cancelled"].includes(t.status));
  const inp   = {width:"100%",boxSizing:"border-box",fontSize:13,borderRadius:8,border:"0.5px solid var(--color-border-secondary)",padding:"7px 10px",background:"var(--color-background-secondary)",color:"var(--color-text-primary)"};
  function submit(){if(!form.title)return;onAddTask(change.id,form);setForm(initTask());setShowForm(false);}
  return (
    <div style={{padding:"1.25rem",borderTop:"0.5px solid var(--color-border-tertiary)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:13,fontWeight:600}}>Change Tasks</span>
          {tasks.length>0&&<span style={{fontSize:11,background:"#EEEDFE",color:"#534AB7",padding:"2px 8px",borderRadius:10,fontWeight:500}}>{tasks.length}</span>}
          {open.length>0&&<span style={{fontSize:11,background:"#FAEEDA",color:"#854F0B",padding:"2px 8px",borderRadius:10,fontWeight:500}}>{open.length} open</span>}
        </div>
        <button onClick={()=>setShowForm(!showForm)} style={{fontSize:12,padding:"5px 12px",cursor:"pointer",background:"#534AB7",color:"white",border:"none",borderRadius:7,fontWeight:500,display:"flex",alignItems:"center",gap:5}}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v9M1 5.5h9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>Add task
        </button>
      </div>
      {showForm&&(
        <div style={{background:"var(--color-background-secondary)",borderRadius:10,padding:"1rem",marginBottom:"1rem",border:"0.5px solid var(--color-border-secondary)"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem",marginBottom:"0.75rem"}}>
            <div style={{gridColumn:"1/-1"}}><label style={{fontSize:12,color:"var(--color-text-secondary)",display:"block",marginBottom:4,fontWeight:500}}>Task title *</label><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="What needs to be done?" style={inp}/></div>
            <div style={{gridColumn:"1/-1"}}><label style={{fontSize:12,color:"var(--color-text-secondary)",display:"block",marginBottom:4,fontWeight:500}}>Description</label><textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={2} placeholder="Additional details…" style={{...inp,resize:"vertical",lineHeight:1.5}}/></div>
            <div><label style={{fontSize:12,color:"var(--color-text-secondary)",display:"block",marginBottom:4,fontWeight:500}}>Assign to</label><select value={form.assignedTo} onChange={e=>setForm(p=>({...p,assignedTo:e.target.value}))} style={{...inp,padding:"7px 10px"}}>{ALL_USERS.map(u=><option key={u}>{u}</option>)}</select></div>
            <div><label style={{fontSize:12,color:"var(--color-text-secondary)",display:"block",marginBottom:4,fontWeight:500}}>Priority</label><select value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))} style={{...inp,padding:"7px 10px"}}>{["Low","Medium","High"].map(p=><option key={p}>{p}</option>)}</select></div>
            <div><label style={{fontSize:12,color:"var(--color-text-secondary)",display:"block",marginBottom:4,fontWeight:500}}>Due date</label><input type="datetime-local" value={form.dueDate} onChange={e=>setForm(p=>({...p,dueDate:e.target.value}))} style={inp}/></div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={()=>{setShowForm(false);setForm(initTask());}} style={{fontSize:12,padding:"6px 14px",cursor:"pointer",borderRadius:7,border:"0.5px solid var(--color-border-secondary)",background:"none",color:"var(--color-text-secondary)"}}>Cancel</button>
            <button onClick={submit} style={{fontSize:12,padding:"6px 14px",cursor:"pointer",background:"#534AB7",color:"white",border:"none",borderRadius:7,fontWeight:500}}>Create task</button>
          </div>
        </div>
      )}
      {tasks.length===0&&!showForm&&<div style={{textAlign:"center",padding:"1.5rem 0",color:"var(--color-text-secondary)",fontSize:13}}>No tasks yet. Add a task to track implementation activities.</div>}
      {open.length>0&&<div style={{marginBottom:done.length>0?"1rem":0}}>{open.map(t=><TaskRow key={t.id} task={t} changeId={change.id} onUpdateTask={onUpdateTask}/>)}</div>}
      {done.length>0&&<div><div style={{fontSize:11,fontWeight:600,color:"var(--color-text-tertiary)",letterSpacing:"0.05em",marginBottom:8}}>COMPLETED / CANCELLED</div>{done.map(t=><TaskRow key={t.id} task={t} changeId={change.id} onUpdateTask={onUpdateTask} dimmed/>)}</div>}
    </div>
  );
}

// ── Change detail ─────────────────────────────────────────────────────────────
export default function ChangeDetail({change,role,allChanges,templates,onBack,onStageChange,onFieldUpdate,onAddTask,onUpdateTask,isOwner}){
  const [tab,setTab]             = useState("details");
  const [pendingDecision,setPendingDecision] = useState(null); // {stage,label,color,bg}
  const [decisionNotes,setDecisionNotes]     = useState("");
  const clashes      = clashCheck(change,allChanges);
  const openTasks    = (change.tasks||[]).filter(t=>!["Completed","Cancelled"].includes(t.status));
  const tmpl         = change.templateId?(templates||[]).find(t=>t.id===change.templateId):null;

  const managerActions = [];
  if(role==="Change Manager"){
    if(change.stage==="New")      managerActions.push(["Awaiting CAB","Send to CAB","#534AB7","#EEEDFE"]);
    if(change.stage==="Approved") managerActions.push(["Implementation","Begin implementation","#854F0B","#FAEEDA"]);
    if(change.stage==="Review")   managerActions.push(["Completed","Complete change","#085041","#E1F5EE"]);
  }
  if(role==="Change Manager"||role==="CAB Approver"){
    if(change.stage==="Awaiting CAB"){
      managerActions.push(["Approved","Approve","#27500A","#EAF3DE"]);
      managerActions.push(["Rejected","Reject","#791F1F","#FCEBEB"]);
    }
  }

  const canStartImpl  = (isOwner||role==="Change Manager")&&change.stage==="Implementation"&&!change.actualStart;
  const canEndImpl    = (isOwner||role==="Change Manager")&&change.stage==="Implementation"&&change.actualStart&&!change.actualEnd;
  const canSetOutcome = (isOwner||role==="Change Manager")&&change.stage==="Review"&&!change.outcome;

  return (
    <div>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:5,fontSize:13,marginBottom:"1rem",cursor:"pointer",background:"none",border:"none",color:"var(--color-text-secondary)",padding:0}}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Back
      </button>
      <StageProgress stage={change.stage}/>
      {clashes.length>0&&(
        <div style={{background:"#FAEEDA",border:"0.5px solid #EF9F27",borderRadius:10,padding:"12px 16px",marginBottom:"1rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L1 14h14L8 2z" stroke="#BA7517" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 7v3M8 11.5v.5" stroke="#BA7517" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <span style={{fontSize:13,fontWeight:500,color:"#633806"}}>Schedule clash — {clashes.length} conflict{clashes.length>1?"s":""}</span>
          </div>
          {clashes.map(cl=>(
            <div key={cl.id} style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#854F0B",marginTop:4,paddingLeft:24}}>
              <span style={{fontWeight:500}}>{cl.id}</span><span>{cl.title}</span><span>·</span><span>{fmtShort(cl.plannedStart)} – {fmtShort(cl.plannedEnd)}</span><StageBadge stage={cl.stage}/>
            </div>
          ))}
        </div>
      )}
      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,overflow:"hidden"}}>
        <div style={{padding:"1.25rem",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{fontSize:12,fontWeight:600,color:"#534AB7"}}>{change.id}</span>
                <TypeBadge type={change.type}/>
                {change.type==="Emergency"&&<Badge label="Expedited" bg="#FCEBEB" color="#791F1F"/>}
                {tmpl&&<Badge label={`Template: ${tmpl.id}`} bg="#EEEDFE" color="#534AB7"/>}
              </div>
              <h2 style={{fontSize:16,fontWeight:600,margin:"0 0 4px"}}>{change.title}</h2>
              <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>{change.service}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
              <StageBadge stage={change.stage} size="md"/>
              {change.outcome&&<OutcomeBadge outcome={change.outcome}/>}
            </div>
          </div>
        </div>
        <div style={{display:"flex",borderBottom:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-secondary)"}}>
          {[["details","Details"],["tasks",`Tasks${openTasks.length>0?` (${openTasks.length} open)`:""}`]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{background:"none",border:"none",padding:"10px 18px",fontSize:13,fontWeight:tab===t?600:400,cursor:"pointer",borderBottom:tab===t?"2px solid #534AB7":"2px solid transparent",color:tab===t?"#534AB7":"var(--color-text-secondary)",marginBottom:-1}}>{l}</button>
          ))}
        </div>
        {tab==="details"&&(
          <div>
            {tmpl&&<div style={{margin:"1rem 1.25rem 0",background:"#EEEDFE",borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="3" rx="1" fill="#534AB7" opacity=".7"/><rect x="1" y="6" width="7" height="2" rx="1" fill="#534AB7"/><rect x="1" y="10" width="9" height="2" rx="1" fill="#534AB7" opacity=".5"/></svg>
              <span style={{fontSize:12,color:"#534AB7",fontWeight:500}}>Based on standard change template:</span>
              <span style={{fontSize:12,color:"#534AB7"}}>{tmpl.id} — {tmpl.title}</span>
              <span style={{fontSize:11,color:"#7C72CC",marginLeft:"auto"}}>Used {tmpl.usageCount} times</span>
            </div>}
            <div style={{padding:"0 1.25rem"}}>
              <FieldRow label="Requester"     value={change.requester}/>
              <FieldRow label="Planned start" value={fmtDate(change.plannedStart)}/>
              <FieldRow label="Planned end"   value={fmtDate(change.plannedEnd)}/>
              <FieldRow label="Actual start"  value={change.actualStart?fmtDate(change.actualStart):<span style={{color:"var(--color-text-tertiary)"}}>Not started</span>}/>
              <FieldRow label="Actual end"    value={change.actualEnd?fmtDate(change.actualEnd):<span style={{color:"var(--color-text-tertiary)"}}>Not completed</span>}/>
              <FieldRow label="Risk level"    value={<RiskBadge risk={change.risk}/>}/>
              <FieldRow label="Description"   value={change.description}/>
              <FieldRow label="Justification" value={change.justification}/>
              <FieldRow label="Impact"        value={change.impact}/>
              <FieldRow label="Rollback plan" value={change.rollback}/>
              {change.cabNotes&&<FieldRow label="CAB decision notes" value={change.cabNotes}/>}
              {change.reviewNotes&&<FieldRow label="Review notes" value={change.reviewNotes}/>}
            </div>
            {(canStartImpl||canEndImpl)&&(
              <div style={{margin:"1rem 1.25rem",background:"#FAEEDA",borderRadius:10,padding:"1rem",border:"0.5px solid #EF9F27"}}>
                <div style={{fontSize:13,fontWeight:600,color:"#633806",marginBottom:8}}>Implementation in progress</div>
                {canStartImpl&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:13,color:"#854F0B"}}>Record the actual start time to begin tracking.</span><button onClick={()=>onFieldUpdate(change.id,{actualStart:nowISO()})} style={{fontSize:12,padding:"7px 16px",cursor:"pointer",background:"#854F0B",color:"white",border:"none",borderRadius:8,fontWeight:500,flexShrink:0}}>▶ Start now</button></div>}
                {canEndImpl&&<div><div style={{fontSize:12,color:"#854F0B",marginBottom:8}}>Started: {fmtDate(change.actualStart)}</div><div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span style={{fontSize:13,color:"#854F0B"}}>Mark implementation complete to move to review.</span><button onClick={()=>{onFieldUpdate(change.id,{actualEnd:nowISO()});onStageChange(change.id,"Review");}} style={{fontSize:12,padding:"7px 16px",cursor:"pointer",background:"#534AB7",color:"white",border:"none",borderRadius:8,fontWeight:500,flexShrink:0}}>⏹ End & move to review</button></div></div>}
              </div>
            )}
            {canSetOutcome&&<ReviewPanel change={change} onFieldUpdate={onFieldUpdate} onStageChange={onStageChange}/>}
            {managerActions.length>0&&(
              <div style={{borderTop:"0.5px solid var(--color-border-tertiary)"}}>
                {!pendingDecision
                  ? <div style={{padding:"1rem 1.25rem",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                      <span style={{fontSize:12,color:"var(--color-text-secondary)",marginRight:4}}>Decision:</span>
                      {managerActions.map(([stage,label,color,bg])=>(
                        <button key={stage} onClick={()=>{setPendingDecision({stage,label,color,bg});setDecisionNotes("");}}
                          style={{fontSize:12,padding:"7px 16px",cursor:"pointer",background:bg,color,border:`0.5px solid ${color}`,borderRadius:8,fontWeight:500}}>{label}</button>
                      ))}
                    </div>
                  : <div style={{padding:"1rem 1.25rem",background:pendingDecision.bg+"55"}}>
                      <div style={{fontSize:13,fontWeight:600,color:pendingDecision.color,marginBottom:10}}>
                        {pendingDecision.label} — confirm decision
                      </div>
                      <div style={{marginBottom:10}}>
                        <label style={{fontSize:12,fontWeight:500,color:"var(--color-text-secondary)",display:"block",marginBottom:5}}>
                          Notes {["Rejected","Reject"].includes(pendingDecision.label)?"*":"(optional)"}
                        </label>
                        <textarea value={decisionNotes} onChange={e=>setDecisionNotes(e.target.value)} rows={3}
                          placeholder={pendingDecision.stage==="Rejected"?"State the reason for rejection…":"Any conditions, comments or observations…"}
                          style={{width:"100%",boxSizing:"border-box",fontSize:13,borderRadius:8,border:`0.5px solid ${pendingDecision.color}`,padding:"8px 10px",background:"white",color:"var(--color-text-primary)",resize:"vertical",lineHeight:1.5}}/>
                      </div>
                      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                        <button onClick={()=>{setPendingDecision(null);setDecisionNotes("");}}
                          style={{fontSize:12,padding:"7px 14px",cursor:"pointer",borderRadius:8,border:"0.5px solid var(--color-border-secondary)",background:"none",color:"var(--color-text-secondary)"}}>Cancel</button>
                        <button
                          disabled={pendingDecision.stage==="Rejected"&&!decisionNotes.trim()}
                          onClick={()=>{
                            const notes=decisionNotes.trim()||null;
                            if(notes) onFieldUpdate(change.id,{cabNotes:notes});
                            onStageChange(change.id,pendingDecision.stage);
                            setPendingDecision(null);setDecisionNotes("");
                          }}
                          style={{fontSize:12,padding:"7px 16px",cursor:pendingDecision.stage==="Rejected"&&!decisionNotes.trim()?"not-allowed":"pointer",background:pendingDecision.color,color:"white",border:"none",borderRadius:8,fontWeight:500,opacity:pendingDecision.stage==="Rejected"&&!decisionNotes.trim()?0.5:1}}>
                          Confirm {pendingDecision.label.toLowerCase()}
                        </button>
                      </div>
                    </div>
                }
              </div>
            )}
          </div>
        )}
        {tab==="tasks"&&<ChangeTasksPanel change={change} onAddTask={onAddTask} onUpdateTask={onUpdateTask}/>}
      </div>
    </div>
  );
}
