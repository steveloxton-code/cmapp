import { fmtShort, fmtDate } from "../constants.jsx";
import { TypeBadge, RiskBadge, StageBadge, OutcomeBadge, Badge } from "./Shared.jsx";
import SubmitChange from "./SubmitChange.jsx";

function MyChangeCard({item,onSelect}){
  const steps    = ["New","Awaiting CAB","Approved","Implementation","Review","Completed"];
  const idx      = steps.indexOf(item.stage);
  const pct      = idx>=0?Math.round((idx/(steps.length-1))*100):0;
  const openTasks = (item.tasks||[]).filter(t=>!["Completed","Cancelled"].includes(t.status));
  return (
    <div onClick={()=>onSelect(item)} onMouseEnter={e=>e.currentTarget.style.background="var(--color-background-secondary)"} onMouseLeave={e=>e.currentTarget.style.background="var(--color-background-primary)"}
      style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,padding:"1rem 1.25rem",cursor:"pointer"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:12,fontWeight:600,color:"#534AB7"}}>{item.id}</span><TypeBadge type={item.type}/><RiskBadge risk={item.risk}/>
          {item.templateId&&<Badge label="Template" bg="#EEEDFE" color="#534AB7"/>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>{item.outcome&&<OutcomeBadge outcome={item.outcome}/>}<StageBadge stage={item.stage}/></div>
      </div>
      <div style={{fontSize:14,fontWeight:500,marginBottom:8}}>{item.title}</div>
      <div style={{display:"flex",gap:20,fontSize:12,color:"var(--color-text-secondary)",marginBottom:openTasks.length>0?8:10,flexWrap:"wrap"}}>
        <span>📅 Planned: {fmtShort(item.plannedStart)} – {fmtShort(item.plannedEnd)}</span>
        {item.actualStart&&<span>▶ Started: {fmtDate(item.actualStart)}</span>}
        {item.actualEnd&&<span>⏹ Ended: {fmtDate(item.actualEnd)}</span>}
      </div>
      {openTasks.length>0&&<div style={{fontSize:12,color:"#854F0B",background:"#FAEEDA",padding:"4px 10px",borderRadius:6,display:"inline-block",marginBottom:8}}>{openTasks.length} open task{openTasks.length>1?"s":""}</div>}
      {!["Completed","Rejected"].includes(item.stage)&&<div style={{height:4,background:"var(--color-background-tertiary)",borderRadius:2,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:item.stage==="Implementation"?"#E8312A":"#534AB7",borderRadius:2,transition:"width 0.3s"}}/></div>}
    </div>
  );
}

export default function MyChanges({changes,showForm,setShowForm,form,setForm,onSubmit,onSelect,templates}){
  const stageOrder = ["New","Awaiting CAB","Approved","Implementation","Review","Completed","Rejected"];
  const active     = [...changes.filter(c=>!["Completed","Rejected"].includes(c.stage))].sort((a,b)=>stageOrder.indexOf(a.stage)-stageOrder.indexOf(b.stage));
  const completed  = changes.filter(c=>["Completed","Rejected"].includes(c.stage));
  return (
    <div>
      <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:"0 0 1.25rem"}}>Changes you have submitted.</p>
      {showForm&&<SubmitChange form={form} setForm={setForm} onSubmit={onSubmit} onCancel={()=>setShowForm(false)} templates={templates}/>}
      {active.length===0&&completed.length===0&&<div style={{textAlign:"center",padding:"3rem 0",color:"var(--color-text-secondary)",fontSize:13}}>You have no submitted changes.</div>}
      {active.length>0&&<div><div style={{fontSize:12,fontWeight:600,color:"var(--color-text-secondary)",letterSpacing:"0.05em",marginBottom:10}}>ACTIVE</div><div style={{display:"flex",flexDirection:"column",gap:"0.75rem",marginBottom:"1.5rem"}}>{active.map(item=><MyChangeCard key={item.id} item={item} onSelect={onSelect}/>)}</div></div>}
      {completed.length>0&&<div><div style={{fontSize:12,fontWeight:600,color:"var(--color-text-secondary)",letterSpacing:"0.05em",marginBottom:10}}>COMPLETED / REJECTED</div><div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>{completed.map(item=><MyChangeCard key={item.id} item={item} onSelect={onSelect}/>)}</div></div>}
    </div>
  );
}
