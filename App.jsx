import { useState, useEffect } from "react";
import { SLATE, NAV, initForm, oneWeekAgo, USER_NAMES } from "./constants.jsx";
import LoginScreen      from "./components/LoginScreen.jsx";
import Sidebar          from "./components/Sidebar.jsx";
import Dashboard        from "./components/Dashboard.jsx";
import ChangeRegister   from "./components/ChangeRegister.jsx";
import ChangeDetail     from "./components/ChangeDetail.jsx";
import CABView          from "./components/CABView.jsx";
import TemplateDetail   from "./components/TemplateDetail.jsx";
import GanttChart       from "./components/GanttChart.jsx";
import MyChanges        from "./components/MyChanges.jsx";
import MyTasks          from "./components/MyTasks.jsx";
import StandardTemplates from "./components/StandardTemplates.jsx";
import ChangeHistory    from "./components/ChangeHistory.jsx";

const API = "/api";

export default function App(){
  // ── Session ──────────────────────────────────────────────────────────────────
  const [loggedIn,setLoggedIn]   = useState(false);
  const [role,setRole]           = useState("Requester");

  // ── Data ─────────────────────────────────────────────────────────────────────
  const [changes,setChanges]     = useState([]);
  const [templates,setTemplates] = useState([]);
  const [loading,setLoading]     = useState(true);

  // ── Navigation / UI state ────────────────────────────────────────────────────
  const [view,setView]           = useState("dashboard");
  const [selected,setSelected]   = useState(null);
  const [showForm,setShowForm]   = useState(false);
  const [form,setForm]           = useState(initForm());
  const [cabTab,setCabTab]       = useState("pending");
  const [cabOrder,setCabOrder]   = useState([]); // change IDs, chair-defined CAB discussion order
  const [cabMeetingStage,setCabMeetingStage] = useState("setup"); // "setup" | "running" | "ended"
  const [cabMeetingStartedAt,setCabMeetingStartedAt] = useState(null);
  const [meetingAgenda,setMeetingAgenda] = useState([]); // [{kind:"change"|"template"|"review", id}]
  const [meetingIndex,setMeetingIndex]   = useState(0);
  const [meetingOpen,setMeetingOpen]     = useState(false); // showing the full-screen agenda item vs the CAB Board list
  const [filterType,setFilterType]   = useState("All");
  const [filterStage,setFilterStage] = useState("All");

  // ── Load data on login ────────────────────────────────────────────────────────
  useEffect(()=>{
    if(!loggedIn){ setLoading(true); return; }
    Promise.all([
      fetch(`${API}/changes`).then(r=>r.json()),
      fetch(`${API}/templates`).then(r=>r.json()),
    ]).then(([ch,tmpl])=>{
      setChanges(ch);
      setTemplates(tmpl);
      setLoading(false);
    }).catch(err=>{
      console.error("Failed to load data:", err);
      setLoading(false);
    });
  },[loggedIn]);

  // ── Keep the CAB discussion order in sync with pending changes before a meeting starts ──
  useEffect(()=>{
    if(cabMeetingStage!=="setup") return;
    setCabOrder(prev=>{
      const ids   = changes.filter(c=>c.stage==="Awaiting CAB").map(c=>c.id);
      const kept  = prev.filter(id=>ids.includes(id));
      const added = ids.filter(id=>!prev.includes(id));
      if(kept.length===prev.length&&added.length===0) return prev;
      return [...kept,...added];
    });
  },[changes,cabMeetingStage]);

  // ── Current user name (derived from role) ─────────────────────────────────────
  const userName = USER_NAMES[role];

  // ── Handlers ─────────────────────────────────────────────────────────────────
  async function submitChange(stage){
    if(!form.title||!form.description||!form.plannedStart||!form.plannedEnd)return;
    const res = await fetch(`${API}/changes`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({...form, requester: userName, stage}),
    });
    const created = await res.json();
    setChanges(p=>[created,...p]);
    setShowForm(false);
    setForm(initForm());
  }

  async function updateStage(id,stage){
    const res = await fetch(`${API}/changes/${id}`,{
      method:"PATCH",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({stage}),
    });
    const updated = await res.json();
    setChanges(p=>p.map(c=>c.id===id?updated:c));
    setSelected(p=>p?.id===id?updated:p);
  }

  async function updateField(id,fields){
    const res = await fetch(`${API}/changes/${id}`,{
      method:"PATCH",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(fields),
    });
    const updated = await res.json();
    setChanges(p=>p.map(c=>c.id===id?updated:c));
    setSelected(p=>p?.id===id?updated:p);
  }

  async function addTask(changeId,task){
    const res = await fetch(`${API}/changes/${changeId}/tasks`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({...task, createdBy: userName}),
    });
    const newTask = await res.json();
    setChanges(p=>p.map(c=>c.id===changeId?{...c,tasks:[...(c.tasks||[]),newTask]}:c));
    setSelected(p=>p?.id===changeId?{...p,tasks:[...(p.tasks||[]),newTask]}:p);
  }

  async function updateTask(changeId,taskId,fields){
    const res = await fetch(`${API}/changes/${changeId}/tasks/${taskId}`,{
      method:"PATCH",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(fields),
    });
    const updated = await res.json();
    setChanges(p=>p.map(c=>c.id===changeId?{...c,tasks:c.tasks.map(t=>t.id===taskId?updated:t)}:c));
    setSelected(p=>p?.id===changeId?{...p,tasks:p.tasks.map(t=>t.id===taskId?updated:t)}:p);
  }

  async function submitTemplate(tmpl){
    const res = await fetch(`${API}/templates`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({...tmpl, proposedBy: userName}),
    });
    const created = await res.json();
    setTemplates(p=>[created,...p]);
  }

  async function updateTemplateStatus(id,status){
    const approvedAt = status==="Approved"?new Date().toISOString().slice(0,10):null;
    const res = await fetch(`${API}/templates/${id}`,{
      method:"PATCH",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({status,approvedAt}),
    });
    const updated = await res.json();
    setTemplates(p=>p.map(t=>t.id===id?updated:t));
  }

  function navigate(v){ setView(v); setSelected(null); setShowForm(false); setForm(initForm()); }

  function reorderCab(newOrderIds){ setCabOrder(newOrderIds); }

  function startCabMeeting(){
    const agenda = [
      ...cabOrder.filter(id=>changes.some(c=>c.id===id&&c.stage==="Awaiting CAB")).map(id=>({kind:"change",id})),
      ...pendingTmpls.map(t=>({kind:"template",id:t.id})),
      ...prevWeek.map(c=>({kind:"review",id:c.id})),
    ];
    if(agenda.length===0) return;
    setMeetingAgenda(agenda);
    setMeetingIndex(0);
    setCabMeetingStartedAt(new Date().toISOString());
    setCabMeetingStage("running");
    setMeetingOpen(true);
  }

  function meetingPrev(){ if(meetingIndex>0) setMeetingIndex(meetingIndex-1); }

  function meetingNext(){
    if(meetingIndex<meetingAgenda.length-1){
      setMeetingIndex(meetingIndex+1);
    } else {
      setCabMeetingStage("ended");
      setMeetingOpen(false);
    }
  }

  function resumeCabMeeting(){ setMeetingOpen(true); }

  function resetCabMeeting(){
    setCabMeetingStage("setup");
    setCabMeetingStartedAt(null);
    setMeetingAgenda([]);
    setMeetingIndex(0);
    setMeetingOpen(false);
    setCabTab("pending");
  }

  // ── Derived values ────────────────────────────────────────────────────────────
  const pendingCAB    = changes.filter(c=>c.stage==="Awaiting CAB");
  const myChanges     = changes.filter(c=>c.requester===userName);
  const myTasks       = changes.flatMap(c=>(c.tasks||[]).filter(t=>t.assignedTo===userName).map(t=>({...t,changeId:c.id,changeTitle:c.title,changeType:c.type})));
  const openMyTasks   = myTasks.filter(t=>!["Completed","Cancelled"].includes(t.status));
  const approvedTmpls = templates.filter(t=>t.status==="Approved");
  const pendingTmpls  = templates.filter(t=>t.status==="Pending CAB Approval");
  const prevWeek      = changes.filter(c=>{const d=c.plannedEnd?new Date(c.plannedEnd):null;return d&&d>=oneWeekAgo()&&d<=new Date()&&["Normal","Emergency"].includes(c.type)&&["Completed","Rejected"].includes(c.stage);});
  const selChange     = selected?(changes.find(c=>c.id===selected.id)||selected):null;
  const orderedCab     = cabOrder.map(id=>changes.find(c=>c.id===id)).filter(Boolean);
  const meetingShowing = cabMeetingStage==="running"&&meetingOpen;
  const currentAgendaEntry = meetingShowing ? meetingAgenda[meetingIndex] : null;
  const currentAgendaChange   = currentAgendaEntry&&currentAgendaEntry.kind!=="template" ? changes.find(c=>c.id===currentAgendaEntry.id) : null;
  const currentAgendaTemplate = currentAgendaEntry&&currentAgendaEntry.kind==="template" ? templates.find(t=>t.id===currentAgendaEntry.id) : null;
  const stats = {
    total:      changes.length,
    pending:    changes.filter(c=>c.stage==="New"||c.stage==="Awaiting CAB").length,
    cab:        pendingCAB.length,
    inProgress: changes.filter(c=>c.stage==="Implementation").length,
  };

  // ── Login gate ────────────────────────────────────────────────────────────────
  if(!loggedIn){
    return <LoginScreen onLogin={r=>{setRole(r);setLoggedIn(true);}}/>;
  }

  // ── Loading screen ────────────────────────────────────────────────────────────
  if(loading){
    return (
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",...SLATE,background:SLATE["--color-background-tertiary"]}}>
        <div style={{textAlign:"center",color:"var(--color-text-secondary)",fontSize:14}}>Loading…</div>
      </div>
    );
  }

  // ── Shell ─────────────────────────────────────────────────────────────────────
  return (
    <div style={{display:"flex",minHeight:"100vh",margin:"-1rem",fontFamily:"var(--font-sans)",...SLATE,background:SLATE["--color-background-tertiary"]}}>
      <Sidebar
        view={view}
        role={role}
        pendingCABCount={pendingCAB.length}
        openTaskCount={openMyTasks.length}
        pendingTmplCount={pendingTmpls.length}
        onNavigate={navigate}
        onSignOut={()=>{setLoggedIn(false);setView("dashboard");setSelected(null);}}
      />

      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        {/* Top bar */}
        <div style={{background:"var(--color-background-primary)",borderBottom:"0.5px solid var(--color-border-tertiary)",padding:"0 1.5rem",height:52,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div>
            <span style={{fontSize:15,fontWeight:500}}>{NAV.find(n=>n.id===view)?.label}</span>
            {(selChange||currentAgendaEntry)&&<><span style={{fontSize:13,color:"var(--color-text-tertiary)",margin:"0 6px"}}>/</span><span style={{fontSize:13,color:"var(--color-text-secondary)"}}>{currentAgendaEntry?currentAgendaEntry.id:selChange.id}</span></>}
          </div>
          {(view==="register"||view==="mychanges")&&!selChange&&(role==="Requester"||role==="Change Manager")&&(
            <button onClick={()=>setShowForm(!showForm)} style={{display:"flex",alignItems:"center",gap:6,fontSize:13,padding:"6px 14px",cursor:"pointer",background:"#E8312A",color:"white",border:"none",borderRadius:8,fontWeight:500}}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1.5v10M1.5 6.5h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Submit change
            </button>
          )}
        </div>

        {/* Main content */}
        <div style={{flex:1,padding:"1.5rem",overflowY:"auto"}}>
          {view==="dashboard"&&(
            <Dashboard
              stats={stats}
              changes={changes}
              onFilter={(type,stage)=>{setFilterType(type||"All");setFilterStage(stage||"All");setView("register");setSelected(null);}}
              onSelectChange={c=>{setSelected(c);setView("register");}}
            />
          )}

          {view==="cab"&&meetingShowing&&currentAgendaEntry?.kind==="template"&&(
            <TemplateDetail
              template={currentAgendaTemplate}
              role={role}
              onUpdateStatus={updateTemplateStatus}
              onBack={()=>setMeetingOpen(false)}
              queueIndex={meetingIndex}
              queueTotal={meetingAgenda.length}
              onPrev={meetingIndex>0?meetingPrev:null}
              onNext={meetingNext}
            />
          )}
          {view==="cab"&&meetingShowing&&currentAgendaEntry?.kind!=="template"&&(
            <ChangeDetail
              change={currentAgendaChange}
              role={role}
              allChanges={changes}
              templates={templates}
              onBack={()=>setMeetingOpen(false)}
              onStageChange={updateStage}
              onFieldUpdate={updateField}
              onAddTask={addTask}
              onUpdateTask={updateTask}
              queueIndex={meetingIndex}
              queueTotal={meetingAgenda.length}
              onPrev={meetingIndex>0?meetingPrev:null}
              onNext={meetingNext}
            />
          )}
          {view==="cab"&&!meetingShowing&&!selChange&&(
            <CABView
              orderedCab={orderedCab}
              cabOrder={cabOrder}
              onReorder={reorderCab}
              meetingStage={cabMeetingStage}
              meetingAgenda={meetingAgenda}
              meetingStartedAt={cabMeetingStartedAt}
              onStartMeeting={startCabMeeting}
              onResumeMeeting={resumeCabMeeting}
              onResetMeeting={resetCabMeeting}
              prevWeek={prevWeek}
              cabTab={cabTab}
              setCabTab={setCabTab}
              role={role}
              onSelect={setSelected}
              allChanges={changes}
              allTemplates={templates}
              pendingTmpls={pendingTmpls}
              onUpdateTemplateStatus={updateTemplateStatus}
            />
          )}
          {view==="cab"&&!meetingShowing&&selChange&&(
            <ChangeDetail
              change={selChange}
              role={role}
              allChanges={changes}
              templates={templates}
              onBack={()=>setSelected(null)}
              onStageChange={updateStage}
              onFieldUpdate={updateField}
              onAddTask={addTask}
              onUpdateTask={updateTask}
            />
          )}

          {view==="fsc"&&(
            <GanttChart
              changes={changes}
              onSelect={c=>{setSelected(c);setView("register");}}
            />
          )}

          {view==="register"&&!selChange&&(
            <ChangeRegister
              changes={changes}
              filterType={filterType}
              setFilterType={setFilterType}
              filterStage={filterStage}
              setFilterStage={setFilterStage}
              onSelect={setSelected}
              showForm={showForm}
              setShowForm={setShowForm}
              form={form}
              setForm={setForm}
              onSubmit={submitChange}
              templates={approvedTmpls}
            />
          )}
          {view==="register"&&selChange&&(
            <ChangeDetail
              change={selChange}
              role={role}
              allChanges={changes}
              templates={templates}
              onBack={()=>setSelected(null)}
              onStageChange={updateStage}
              onFieldUpdate={updateField}
              onAddTask={addTask}
              onUpdateTask={updateTask}
            />
          )}

          {view==="mychanges"&&!selChange&&(
            <MyChanges
              changes={myChanges}
              showForm={showForm}
              setShowForm={setShowForm}
              form={form}
              setForm={setForm}
              onSubmit={submitChange}
              onSelect={setSelected}
              templates={approvedTmpls}
            />
          )}
          {view==="mychanges"&&selChange&&(
            <ChangeDetail
              change={selChange}
              role={role}
              allChanges={changes}
              templates={templates}
              onBack={()=>setSelected(null)}
              onStageChange={updateStage}
              onFieldUpdate={updateField}
              onAddTask={addTask}
              onUpdateTask={updateTask}
              isOwner
            />
          )}

          {view==="mytasks"&&(
            <MyTasks
              tasks={myTasks}
              changes={changes}
              onUpdateTask={updateTask}
              onSelectChange={c=>{setSelected(c);setView("register");}}
            />
          )}

          {view==="templates"&&(
            <StandardTemplates
              templates={templates}
              role={role}
              onSubmitTemplate={submitTemplate}
              onUpdateStatus={updateTemplateStatus}
            />
          )}

          {view==="history"&&(
            <ChangeHistory
              changes={changes}
              onSelect={c=>{setSelected(c);setView("register");}}
            />
          )}
        </div>
      </div>
    </div>
  );
}
