import { RiskBadge, TmplBadge } from "./Shared.jsx";

export default function TemplateDetail({template,role,onUpdateStatus,onBack,queueIndex,queueTotal,onPrev,onNext}){
  if(!template) return null;
  const canDecide = template.status==="Pending CAB Approval"&&(role==="Change Manager"||role==="CAB Approver");

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem"}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:5,fontSize:13,cursor:"pointer",background:"none",border:"none",color:"var(--color-text-secondary)",padding:0}}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Back
        </button>
        {typeof queueTotal==="number"&&queueTotal>0&&queueIndex>=0&&(()=>{
          const isLast = queueIndex>=queueTotal-1;
          return (
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:12,color:"var(--color-text-secondary)",fontWeight:500}}>Item {queueIndex+1} of {queueTotal}</span>
              <button onClick={onPrev} disabled={!onPrev} style={{display:"flex",alignItems:"center",gap:4,fontSize:12,padding:"6px 12px",cursor:onPrev?"pointer":"not-allowed",background:"var(--color-background-secondary)",border:"0.5px solid var(--color-border-secondary)",borderRadius:8,color:"var(--color-text-secondary)",opacity:onPrev?1:0.4,fontWeight:500}}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Prev
              </button>
              <button onClick={onNext} style={{display:"flex",alignItems:"center",gap:4,fontSize:12,padding:"6px 12px",cursor:"pointer",background:"#534AB7",border:"none",borderRadius:8,color:"white",fontWeight:500}}>
                {isLast?"Finish":"Next"}<svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          );
        })()}
      </div>

      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:14,padding:"1.25rem"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:12,fontWeight:600,color:"#534AB7"}}>{template.id}</span><RiskBadge risk={template.risk}/><TmplBadge status={template.status}/>
          </div>
          {canDecide&&(
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>{onUpdateStatus(template.id,"Approved");if(onNext)onNext();}} style={{fontSize:11,padding:"5px 12px",cursor:"pointer",background:"#EAF3DE",color:"#27500A",border:"0.5px solid #27500A",borderRadius:7,fontWeight:500}}>Approve — add to library</button>
              <button onClick={()=>{onUpdateStatus(template.id,"Rejected");if(onNext)onNext();}} style={{fontSize:11,padding:"5px 12px",cursor:"pointer",background:"#FCEBEB",color:"#791F1F",border:"0.5px solid #791F1F",borderRadius:7,fontWeight:500}}>Reject</button>
            </div>
          )}
        </div>
        <div style={{fontSize:16,fontWeight:600,marginBottom:4}}>{template.title}</div>
        <div style={{fontSize:12,color:"var(--color-text-secondary)",marginBottom:14}}>{template.service} · Proposed by {template.proposedBy} on {template.proposedAt}</div>
        <div style={{fontSize:12,color:"var(--color-text-secondary)",background:"var(--color-background-secondary)",padding:"8px 12px",borderRadius:8,marginBottom:6}}><strong>Description:</strong> {template.description}</div>
        <div style={{fontSize:12,color:"var(--color-text-secondary)",background:"var(--color-background-secondary)",padding:"8px 12px",borderRadius:8}}><strong>Rollback:</strong> {template.rollback}</div>
        {template.rationale&&<div style={{fontSize:12,color:"var(--color-text-secondary)",background:"var(--color-background-secondary)",padding:"8px 12px",borderRadius:8,marginTop:6}}><strong>Rationale:</strong> {template.rationale}</div>}
      </div>
    </div>
  );
}
