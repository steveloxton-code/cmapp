import { useState } from "react";
import { RISK_LEVELS, initTmpl } from "../constants.jsx";
import { RiskBadge, TmplBadge, FieldRow } from "./Shared.jsx";

export default function StandardTemplates({templates,onSubmitTemplate}){
  const [tab,setTab]         = useState("approved");
  const [showForm,setShowForm] = useState(false);
  const [form,setForm]       = useState(initTmpl());
  const [selected,setSelected] = useState(null);

  const approved = templates.filter(t=>t.status==="Approved");
  const pending  = templates.filter(t=>t.status==="Pending CAB Approval");
  const rejected = templates.filter(t=>t.status==="Rejected");
  const inp = {width:"100%",boxSizing:"border-box",fontSize:13,borderRadius:8,border:"0.5px solid var(--color-border-secondary)",padding:"8px 10px",background:"var(--color-background-secondary)",color:"var(--color-text-primary)"};

  function submit(){
    if(!form.title||!form.description||!form.justification||!form.rollback)return;
    onSubmitTemplate(form);
    setForm(initTmpl());
    setShowForm(false);
    setTab("pending");
  }

  if(selected){
    return (
      <div>
        <button onClick={()=>setSelected(null)} style={{display:"flex",alignItems:"center",gap:5,fontSize:13,marginBottom:"1rem",cursor:"pointer",background:"none",border:"none",color:"var(--color-text-secondary)",padding:0}}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Back
        </button>
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,overflow:"hidden"}}>
          <div style={{padding:"1.25rem",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:12,fontWeight:600,color:"#534AB7"}}>{selected.id}</span><RiskBadge risk={selected.risk}/></div>
                <h2 style={{fontSize:16,fontWeight:600,margin:"0 0 4px"}}>{selected.title}</h2>
                <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>{selected.service}</span>
              </div>
              <TmplBadge status={selected.status}/>
            </div>
          </div>
          <div style={{padding:"0 1.25rem"}}>
            <FieldRow label="Proposed by"     value={selected.proposedBy}/>
            <FieldRow label="Proposed"         value={selected.proposedAt}/>
            {selected.approvedAt&&<FieldRow label="Approved" value={selected.approvedAt}/>}
            <FieldRow label="Usage count"      value={selected.usageCount>0?`${selected.usageCount} changes`:"Not yet used"}/>
            <FieldRow label="Risk level"       value={<RiskBadge risk={selected.risk}/>}/>
            <FieldRow label="Affected service" value={selected.service}/>
            <FieldRow label="Description"      value={selected.description}/>
            <FieldRow label="Justification"    value={selected.justification}/>
            <FieldRow label="Rollback plan"    value={selected.rollback}/>
            {selected.rationale&&<FieldRow label="Template rationale" value={selected.rationale}/>}
          </div>
          {selected.status==="Pending CAB Approval"&&(
            <div style={{padding:"1rem 1.25rem",borderTop:"0.5px solid var(--color-border-tertiary)"}}>
              <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>Approval decisions for template proposals are made during the CAB meeting.</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:"1.25rem"}}>
        <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:0}}>{approved.length} approved templates in library.</p>
        <button onClick={()=>setShowForm(!showForm)} style={{display:"flex",alignItems:"center",gap:6,fontSize:13,padding:"6px 14px",cursor:"pointer",background:"#534AB7",color:"white",border:"none",borderRadius:8,fontWeight:500,flexShrink:0}}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5v10M1.5 6.5h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>Propose template
        </button>
      </div>
      {showForm&&(
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,padding:"1.25rem",marginBottom:"1.25rem"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
            <div>
              <div style={{fontSize:14,fontWeight:600}}>Propose new standard change template</div>
              <div style={{fontSize:12,color:"var(--color-text-secondary)",marginTop:2}}>Once submitted, this will be reviewed by the CAB before being added to the library.</div>
            </div>
            <button onClick={()=>{setShowForm(false);setForm(initTmpl());}} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"var(--color-text-tertiary)",lineHeight:1,padding:0}}>&times;</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.875rem"}}>
            <div style={{gridColumn:"1/-1"}}><label style={{fontSize:12,color:"var(--color-text-secondary)",display:"block",marginBottom:5,fontWeight:500}}>Template name *</label><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Monthly OS Security Patching" style={inp}/></div>
            <div><label style={{fontSize:12,color:"var(--color-text-secondary)",display:"block",marginBottom:5,fontWeight:500}}>Default risk level</label><select value={form.risk} onChange={e=>setForm(p=>({...p,risk:e.target.value}))} style={{...inp,padding:"8px 10px"}}>{RISK_LEVELS.map(r=><option key={r}>{r}</option>)}</select></div>
            <div><label style={{fontSize:12,color:"var(--color-text-secondary)",display:"block",marginBottom:5,fontWeight:500}}>Affected service</label><input value={form.service} onChange={e=>setForm(p=>({...p,service:e.target.value}))} placeholder="e.g. Application Hosting" style={inp}/></div>
            {[["Description *","description","Full description of what this standard change involves.",4],["Justification *","justification","Why this qualifies as a standard change.",3],["Rollback plan *","rollback","Default rollback steps.",3],["Template rationale","rationale","Additional context for the CAB.",2]].map(([lbl,key,ph,rows])=>(
              <div key={key} style={{gridColumn:"1/-1"}}><label style={{fontSize:12,color:"var(--color-text-secondary)",display:"block",marginBottom:5,fontWeight:500}}>{lbl}</label><textarea value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} rows={rows} placeholder={ph} style={{...inp,resize:"vertical",lineHeight:1.5}}/></div>
            ))}
          </div>
          <div style={{display:"flex",gap:8,marginTop:"1rem",justifyContent:"flex-end"}}>
            <button onClick={()=>{setShowForm(false);setForm(initTmpl());}} style={{fontSize:13,padding:"7px 16px",cursor:"pointer",borderRadius:8,border:"0.5px solid var(--color-border-secondary)",background:"none",color:"var(--color-text-secondary)"}}>Cancel</button>
            <button onClick={submit} style={{fontSize:13,padding:"7px 16px",cursor:"pointer",background:"#534AB7",color:"white",border:"none",borderRadius:8,fontWeight:600}}>Submit for CAB approval</button>
          </div>
        </div>
      )}
      <div style={{display:"flex",gap:2,borderBottom:"0.5px solid var(--color-border-tertiary)",marginBottom:"1.25rem"}}>
        {[["approved",`Library (${approved.length})`],["pending",`Pending CAB${pending.length>0?` (${pending.length})`:""}`],["rejected","Rejected"]].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)} style={{background:"none",border:"none",padding:"8px 16px",fontSize:13,fontWeight:500,cursor:"pointer",borderBottom:tab===v?"2px solid var(--color-text-primary)":"2px solid transparent",color:tab===v?"var(--color-text-primary)":"var(--color-text-secondary)",marginBottom:-1}}>
            {l}{v==="pending"&&pending.length>0&&<span style={{marginLeft:6,background:"#E8312A",color:"white",fontSize:10,padding:"1px 5px",borderRadius:10,fontWeight:600}}>{pending.length}</span>}
          </button>
        ))}
      </div>
      {tab==="approved"&&(approved.length===0
        ? <div style={{textAlign:"center",padding:"3rem 0",color:"var(--color-text-secondary)",fontSize:13}}>No approved templates yet.</div>
        : <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem"}}>
            {approved.map(t=>(
              <div key={t.id} onClick={()=>setSelected(t)} onMouseEnter={e=>e.currentTarget.style.background="var(--color-background-secondary)"} onMouseLeave={e=>e.currentTarget.style.background="var(--color-background-primary)"}
                style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,padding:"1rem 1.25rem",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:11,fontWeight:600,color:"#534AB7"}}>{t.id}</span><div style={{display:"flex",gap:6}}><RiskBadge risk={t.risk}/>{t.usageCount>0&&<span style={{fontSize:11,color:"var(--color-text-tertiary)"}}>×{t.usageCount}</span>}</div></div>
                <div style={{fontSize:13,fontWeight:500,marginBottom:4}}>{t.title}</div>
                <div style={{fontSize:12,color:"var(--color-text-secondary)",marginBottom:8,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{t.description}</div>
                <div style={{fontSize:11,color:"var(--color-text-tertiary)"}}>{t.service} · Approved {t.approvedAt}</div>
              </div>
            ))}
          </div>
      )}
      {tab==="pending"&&(pending.length===0
        ? <div style={{textAlign:"center",padding:"3rem 0",color:"var(--color-text-secondary)",fontSize:13}}>No templates awaiting CAB approval.</div>
        : <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
            {pending.map(t=>(
              <div key={t.id} onClick={()=>setSelected(t)} onMouseEnter={e=>e.currentTarget.style.background="var(--color-background-secondary)"} onMouseLeave={e=>e.currentTarget.style.background="var(--color-background-primary)"}
                style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,padding:"1rem 1.25rem",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{fontSize:11,fontWeight:600,color:"#534AB7"}}>{t.id}</span><RiskBadge risk={t.risk}/><TmplBadge status={t.status}/></div>
                <div style={{fontSize:14,fontWeight:500,marginBottom:4}}>{t.title}</div>
                <div style={{fontSize:12,color:"var(--color-text-secondary)"}}>{t.service} · Proposed by {t.proposedBy} on {t.proposedAt}</div>
              </div>
            ))}
          </div>
      )}
      {tab==="rejected"&&(rejected.length===0
        ? <div style={{textAlign:"center",padding:"3rem 0",color:"var(--color-text-secondary)",fontSize:13}}>No rejected templates.</div>
        : <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
            {rejected.map(t=>(
              <div key={t.id} onClick={()=>setSelected(t)} onMouseEnter={e=>e.currentTarget.style.background="var(--color-background-secondary)"} onMouseLeave={e=>e.currentTarget.style.background="var(--color-background-primary)"}
                style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,padding:"1rem 1.25rem",cursor:"pointer",opacity:0.75}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{fontSize:11,fontWeight:600,color:"#534AB7"}}>{t.id}</span><TmplBadge status={t.status}/></div>
                <div style={{fontSize:14,fontWeight:500,marginBottom:4}}>{t.title}</div>
                <div style={{fontSize:12,color:"var(--color-text-secondary)"}}>{t.service} · Proposed by {t.proposedBy}</div>
              </div>
            ))}
          </div>
      )}
    </div>
  );
}
