import { useState } from "react";
import { USER_NAMES, USER_EMAILS } from "../constants.jsx";

export default function LoginScreen({onLogin}){
  const [selectedRole,setSelectedRole] = useState(null);
  const [hoveredRole,setHoveredRole]   = useState(null);
  const roleConfig = [
    {role:"Requester",      initials:"RE",colour:"#378ADD",colourBg:"#E6F1FB",description:"Submit and track your own changes"},
    {role:"Change Manager", initials:"CM",colour:"#534AB7",colourBg:"#EEEDFE",description:"Review, approve and manage all changes"},
    {role:"CAB Approver",   initials:"CA",colour:"#085041",colourBg:"#E1F5EE",description:"Review and vote on CAB change proposals"},
  ];
  return (
    <div style={{minHeight:"100vh",margin:"-1rem",background:"#0f172a",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-sans)",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(83,74,183,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(83,74,183,0.07) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:"20%",left:"50%",transform:"translateX(-50%)",width:600,height:300,background:"radial-gradient(ellipse,rgba(83,74,183,0.18) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <div style={{position:"relative",width:"100%",maxWidth:480,padding:"0 1.5rem"}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:"2.5rem"}}>
          <img src="/fibrus-white.svg" alt="Ogi" style={{height:64,marginBottom:4}}/>
          <img src="/ogi-logo.svg" alt="Ogi" style={{height:64,marginBottom:16}}/>
          <h1 style={{fontSize:22,fontWeight:700,color:"white",margin:"0 0 6px",letterSpacing:"-0.02em"}}>Change Management</h1>
          <p style={{fontSize:14,color:"rgba(255,255,255,0.45)",margin:0}}>Select your account to continue</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
          {roleConfig.map(({role,initials,colour,colourBg,description})=>{
            const isSel=selectedRole===role, isHov=hoveredRole===role;
            return (
              <div key={role} onClick={()=>setSelectedRole(role)} onMouseEnter={()=>setHoveredRole(role)} onMouseLeave={()=>setHoveredRole(null)}
                style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:14,border:`1.5px solid ${isSel?colour:isHov?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.08)"}`,background:isSel?"rgba(255,255,255,0.07)":isHov?"rgba(255,255,255,0.04)":"rgba(255,255,255,0.03)",cursor:"pointer",transition:"all 0.15s"}}>
                <div style={{width:44,height:44,borderRadius:12,background:isSel?colour:colourBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:isSel?"white":colour,flexShrink:0,transition:"all 0.15s"}}>
                  {initials}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:600,color:"white",marginBottom:2}}>{USER_NAMES[role]}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:3}}>{USER_EMAILS[role]}</div>
                  <div style={{fontSize:11,color:isSel?colour:"rgba(255,255,255,0.3)",fontWeight:isSel?500:400}}>{role} — {description}</div>
                </div>
                <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${isSel?colour:"rgba(255,255,255,0.2)"}`,background:isSel?colour:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                  {isSel&&<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={()=>selectedRole&&onLogin(selectedRole)} disabled={!selectedRole}
          style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:selectedRole?"#E8312A":"rgba(255,255,255,0.08)",color:selectedRole?"white":"rgba(255,255,255,0.25)",fontSize:15,fontWeight:600,cursor:selectedRole?"pointer":"not-allowed",transition:"all 0.15s"}}>
          {selectedRole?`Sign in as ${USER_NAMES[selectedRole]}`:"Select an account to sign in"}
        </button>
        <p style={{textAlign:"center",fontSize:12,color:"rgba(255,255,255,0.2)",marginTop:20,marginBottom:0}}>Ogi Change Management · Internal use only</p>
      </div>
    </div>
  );
}
