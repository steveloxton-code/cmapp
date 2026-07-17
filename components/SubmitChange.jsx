import { useRef, useState } from "react";
import { CHANGE_TYPES, RISK_LEVELS } from "../constants.jsx";

export default function SubmitChange({form,setForm,onSubmit,onCancel,templates}){
  const [dragOver,setDragOver] = useState(false);
  const fileRef = useRef(null);
  const set = (k,v)=>setForm(p=>({...p,[k]:v}));
  const inp = {width:"100%",boxSizing:"border-box",fontSize:13,borderRadius:8,border:"0.5px solid var(--color-border-secondary)",padding:"8px 10px",background:"var(--color-background-secondary)",color:"var(--color-text-primary)"};

  function applyTemplate(id){
    if(!id){set("templateId",null);return;}
    const t=(templates||[]).find(t=>t.id===id);
    if(!t)return;
    setForm(p=>({...p,templateId:id,description:t.description,justification:t.justification,rollback:t.rollback,risk:t.risk,service:t.service}));
  }
  function handleFiles(files){
    const arr=Array.from(files).map(f=>({name:f.name,size:f.size,type:f.type,id:Math.random().toString(36).slice(2)}));
    setForm(p=>({...p,attachments:[...(p.attachments||[]),...arr]}));
  }
  function removeAttachment(id){setForm(p=>({...p,attachments:p.attachments.filter(a=>a.id!==id)}));}
  function fmtSize(b){if(b<1024)return b+"B";if(b<1048576)return(b/1024).toFixed(1)+"KB";return(b/1048576).toFixed(1)+"MB";}
  function fileIcon(t){if(t.includes("pdf"))return"📄";if(t.includes("image"))return"🖼️";if(t.includes("word")||t.includes("document"))return"📝";if(t.includes("sheet")||t.includes("excel"))return"📊";return"📎";}

  return (
    <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,padding:"1.25rem",marginBottom:"1.25rem"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
        <span style={{fontSize:14,fontWeight:600}}>New change request</span>
        <button onClick={onCancel} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"var(--color-text-tertiary)",lineHeight:1,padding:0}}>&times;</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.875rem"}}>
        <div style={{gridColumn:"1/-1"}}>
          <label style={{fontSize:12,color:"var(--color-text-secondary)",display:"block",marginBottom:5,fontWeight:500}}>Title *</label>
          <input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="Brief description of the change" style={inp}/>
        </div>
        <div>
          <label style={{fontSize:12,color:"var(--color-text-secondary)",display:"block",marginBottom:5,fontWeight:500}}>Change type</label>
          <select value={form.type} onChange={e=>{
            const t=e.target.value;
            if(t!=="Standard"&&form.templateId){
              setForm(p=>({...p,type:t,templateId:null,description:"",justification:"",rollback:"",risk:"Low",service:""}));
            } else {
              setForm(p=>({...p,type:t,templateId:t==="Standard"?p.templateId:null}));
            }
          }} style={{...inp,padding:"8px 10px"}}>
            {CHANGE_TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={{fontSize:12,color:"var(--color-text-secondary)",display:"block",marginBottom:5,fontWeight:500}}>Risk level</label>
          <select value={form.risk} onChange={e=>set("risk",e.target.value)} style={{...inp,padding:"8px 10px"}}>
            {RISK_LEVELS.map(r=><option key={r}>{r}</option>)}
          </select>
        </div>
        {form.type==="Standard"&&(
          <div style={{gridColumn:"1/-1"}}>
            <label style={{fontSize:12,color:"var(--color-text-secondary)",display:"block",marginBottom:5,fontWeight:500}}>Standard change template</label>
            <select value={form.templateId||""} onChange={e=>applyTemplate(e.target.value)} style={{...inp,padding:"8px 10px",borderColor:form.templateId?"#534AB7":"var(--color-border-secondary)",background:form.templateId?"#EEEDFE":"var(--color-background-secondary)"}}>
              <option value="">— Select a template (optional) —</option>
              {(templates||[]).map(t=><option key={t.id} value={t.id}>{t.id}: {t.title}</option>)}
            </select>
            {form.templateId&&(
              <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#534AB7",background:"#EEEDFE",padding:"6px 12px",borderRadius:8}}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3 3 6-6" stroke="#534AB7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Template applied — fields pre-populated. You can edit them below.
                <button onClick={()=>applyTemplate(null)} style={{marginLeft:"auto",fontSize:11,background:"none",border:"none",cursor:"pointer",color:"#534AB7",padding:0,textDecoration:"underline"}}>Clear</button>
              </div>
            )}
          </div>
        )}
        <div>
          <label style={{fontSize:12,color:"var(--color-text-secondary)",display:"block",marginBottom:5,fontWeight:500}}>Planned start *</label>
          <input type="datetime-local" value={form.plannedStart} onChange={e=>set("plannedStart",e.target.value)} style={inp}/>
        </div>
        <div>
          <label style={{fontSize:12,color:"var(--color-text-secondary)",display:"block",marginBottom:5,fontWeight:500}}>Planned end *</label>
          <input type="datetime-local" value={form.plannedEnd} onChange={e=>set("plannedEnd",e.target.value)} style={inp}/>
        </div>
        <div style={{gridColumn:"1/-1"}}>
          <label style={{fontSize:12,color:"var(--color-text-secondary)",display:"block",marginBottom:5,fontWeight:500}}>Affected service</label>
          <input value={form.service} onChange={e=>set("service",e.target.value)} placeholder="e.g. Core Database Platform" style={inp}/>
        </div>
        {[["Description *","description","What is being changed and how?",3],["Business justification","justification","Why is this change needed?",2],["Impact statement","impact","Expected impact on services?",2],["Rollback plan","rollback","How will you revert if something goes wrong?",2]].map(([lbl,key,ph,rows])=>(
          <div key={key} style={{gridColumn:"1/-1"}}>
            <label style={{fontSize:12,color:"var(--color-text-secondary)",display:"block",marginBottom:5,fontWeight:500}}>{lbl}</label>
            <textarea value={form[key]} onChange={e=>set(key,e.target.value)} rows={rows} placeholder={ph} style={{...inp,resize:"vertical",lineHeight:1.5}}/>
          </div>
        ))}
        <div style={{gridColumn:"1/-1"}}>
          <label style={{fontSize:12,color:"var(--color-text-secondary)",display:"block",marginBottom:5,fontWeight:500}}>Attachments</label>
          <div onDragOver={e=>{e.preventDefault();setDragOver(true);}} onDragLeave={()=>setDragOver(false)} onDrop={e=>{e.preventDefault();setDragOver(false);handleFiles(e.dataTransfer.files);}} onClick={()=>fileRef.current.click()}
            style={{border:`1.5px dashed ${dragOver?"#534AB7":"var(--color-border-secondary)"}`,borderRadius:10,padding:"1.25rem",textAlign:"center",cursor:"pointer",background:dragOver?"#EEEDFE":"var(--color-background-secondary)",transition:"all 0.15s"}}>
            <input ref={fileRef} type="file" multiple style={{display:"none"}} onChange={e=>handleFiles(e.target.files)}/>
            <div style={{fontSize:22,marginBottom:4}}>📎</div>
            <div style={{fontSize:13,fontWeight:500,color:dragOver?"#534AB7":"var(--color-text-secondary)"}}>Drop files here or click to browse</div>
          </div>
          {(form.attachments||[]).length>0&&(
            <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4}}>
              {form.attachments.map(a=>(
                <div key={a.id} style={{display:"flex",alignItems:"center",gap:8,background:"var(--color-background-secondary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:8,padding:"7px 10px"}}>
                  <span style={{fontSize:15}}>{fileIcon(a.type)}</span>
                  <span style={{fontSize:13,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.name}</span>
                  <span style={{fontSize:11,color:"var(--color-text-tertiary)"}}>{fmtSize(a.size)}</span>
                  <button onClick={e=>{e.stopPropagation();removeAttachment(a.id);}} style={{background:"none",border:"none",cursor:"pointer",color:"var(--color-text-tertiary)",fontSize:16,lineHeight:1,padding:"0 2px"}}>&times;</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{display:"flex",gap:8,marginTop:"1rem",justifyContent:"flex-end"}}>
        <button onClick={onCancel} style={{fontSize:13,padding:"7px 16px",cursor:"pointer",borderRadius:8,border:"0.5px solid var(--color-border-secondary)",background:"none",color:"var(--color-text-secondary)"}}>Cancel</button>
        {form.type==="Standard"&&form.templateId
          ? <button onClick={()=>onSubmit("Approved")} style={{fontSize:13,padding:"7px 16px",cursor:"pointer",background:"#E8312A",color:"white",border:"none",borderRadius:8,fontWeight:600}}>Submit change</button>
          : <>
              <button onClick={()=>onSubmit("New")} style={{fontSize:13,padding:"7px 16px",cursor:"pointer",borderRadius:8,border:"0.5px solid var(--color-border-secondary)",background:"none",color:"var(--color-text-secondary)"}}>Save</button>
              <button onClick={()=>onSubmit("Awaiting CAB")} style={{fontSize:13,padding:"7px 16px",cursor:"pointer",background:"#E8312A",color:"white",border:"none",borderRadius:8,fontWeight:600}}>Send to CAB</button>
            </>
        }
      </div>
    </div>
  );
}
