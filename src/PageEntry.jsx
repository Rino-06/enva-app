import React from "react";

// PageEntryView — Antrenman Kayıt Sayfası
// Props: tDisc, setTDisc, tSt, setTSt, tDate, setTDate,
//        tMin, setTMin, tSec, setTSec, tMs, setTMs,
//        tSaved, saveTraining, visibleStudents, trainings,
//        fmtTime, toSec, C, S, TimeRow
const PageEntry = ({
  tDisc, setTDisc, tSt, setTSt, tDate, setTDate,
  tMin, setTMin, tSec, setTSec, tMs, setTMs,
  tSaved, saveTraining,
  visibleStudents, trainings,
  fmtTime, C, S, TimeRow,
}) => {
  return (
    <div style={{padding:"0 14px 14px"}}>
      <h2 style={{color:C.text,fontSize:17,fontWeight:900,marginBottom:13}}>⏱️ Antrenman Kaydı</h2>
      <div style={{display:"flex",gap:7,marginBottom:11}}>
        {[["swim","🏊 Yüzme",C.blue],["run","🏃 Koşma",C.green]].map(([d,l,col])=>(
          <button key={d} onClick={()=>setTDisc(d)} style={{
            flex:1,padding:10,borderRadius:10,cursor:"pointer",fontFamily:"inherit",
            fontWeight:800,fontSize:13,border:`2px solid ${tDisc===d?col:C.border}`,
            background:tDisc===d?`${col}22`:C.card,color:tDisc===d?col:C.muted,
          }}>{l}</button>
        ))}
      </div>
      <div style={{marginBottom:9}}>
        <span style={S.lbl}>SPORCU</span>
        <select value={tSt} onChange={e=>setTSt(e.target.value)} style={S.inp}>
          <option value="">— Sporcu Seç —</option>
          {visibleStudents.map(s=>(
            <option key={s.id} value={s.id}>{s.name} ({s.ageGroup}·{s.gender})</option>
          ))}
        </select>
      </div>
      <div style={{marginBottom:11}}>
        <span style={S.lbl}>TARİH</span>
        <input type="date" value={tDate} onChange={e=>setTDate(e.target.value)} style={S.inp}/>
      </div>
      <span style={S.lbl}>{tDisc==="swim"?"SÜRE (DAK:SN.SALİSE)":"SÜRE (DAK:SN)"}</span>
      <div style={{marginBottom:13}}>
        <TimeRow disc={tDisc} min={tMin} setMin={setTMin} sec={tSec} setSec={setTSec}
          ms={tMs} setMs={setTMs} accent={C.blue}/>
      </div>
      <button onClick={saveTraining} disabled={!tSt||!tMin||!tSec} style={{
        ...S.btn(!tSt||!tMin||!tSec?C.surface:`linear-gradient(135deg,${C.blue},${C.green})`),
        width:"100%",padding:"13px",borderRadius:11,fontSize:15,
        color:!tSt||!tMin||!tSec?C.muted:"#fff",
      }}>{tSaved?"✅ Kaydedildi!":"💾 Antrenmanı Kaydet"}</button>
      {tSt&&(
        <div style={{background:C.card,borderRadius:11,padding:12,marginTop:13,border:`1px solid ${C.border}`}}>
          <p style={{color:C.muted,fontSize:10,fontWeight:800,margin:"0 0 8px",letterSpacing:"0.08em"}}>
            SON KAYITLAR — {visibleStudents.find(s=>s.id===+tSt)?.name}
          </p>
          {trainings.filter(p=>p.studentId===+tSt&&p.discipline===tDisc)
            .sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6).map(p=>(
            <div key={p.id} style={{display:"flex",justifyContent:"space-between",
              padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{color:C.muted,fontSize:12}}>{p.date}</span>
              <span style={{color:tDisc==="swim"?C.blue:C.green,fontWeight:800,fontSize:12}}>
                {fmtTime(tDisc,p.minutes,p.seconds,p.milliseconds||0)}
              </span>
            </div>
          ))}
          {trainings.filter(p=>p.studentId===+tSt&&p.discipline===tDisc).length===0&&
            <p style={{color:C.muted,fontSize:12,margin:0}}>Henüz antrenman kaydı yok.</p>}
        </div>
      )}
    </div>
  );
};

export default PageEntry;
