import React, { useState } from "react";

// PageAthletes — Sporcu Listesi ve Detay Sayfası
// Props: students, setStudents, comps, trainings,
//        visibleStudents, isCoach,
//        sSort, setSSort, sSortDir, setSSortDir,
//        getBest, fmtTime, toSec,
//        ageColors, C, S
const PageAthletes = ({
  students, setStudents,
  comps, trainings,
  visibleStudents, isCoach,
  sSort, setSSort, sSortDir, setSSortDir,
  getBest, fmtTime, toSec,
  ageColors, C, S,
}) => {
  const [selStudent, setSelStudent] = useState(null);
  const [editMode,   setEditMode]   = useState(false);
  const [editData,   setEditData]   = useState({});
  const [dataFilter, setDataFilter] = useState("comp");
  const [ageFilter,  setAgeFilter]  = useState("ALL");
  const [gendFilter, setGendFilter] = useState("ALL");

  const toggleSort = (field) => {
    if (sSort === field) {
      setSSortDir(d=>({...d,[field]:d[field]==="asc"?"desc":"asc"}));
    } else {
      setSSort(field);
    }
  };
  const dir = sSortDir[sSort] === "asc" ? 1 : -1;
  const filtered = visibleStudents
    .filter(s=>{
      if(ageFilter!=="ALL"&&s.ageGroup!==ageFilter) return false;
      if(gendFilter!=="ALL"&&s.gender!==gendFilter) return false;
      return true;
    })
    .map(s=>({
      ...s,
      _sw: getBest(s.id,"swim",dataFilter==="comp"?"comp":"training"),
      _rn: getBest(s.id,"run", dataFilter==="comp"?"comp":"training"),
    }))
    .sort((a,b)=>{
      if(sSort==="swim"){
        const as=a._sw?toSec(a._sw.minutes,a._sw.seconds,a._sw.milliseconds||0):9999;
        const bs=b._sw?toSec(b._sw.minutes,b._sw.seconds,b._sw.milliseconds||0):9999;
        return (as-bs)*dir;
      }
      if(sSort==="run"){
        const ar=a._rn?toSec(a._rn.minutes,a._rn.seconds):9999;
        const br=b._rn?toSec(b._rn.minutes,b._rn.seconds):9999;
        return (ar-br)*dir;
      }
      return a.name.localeCompare(b.name,"tr")*dir;
    });

  const SortBtn = ({field, label, color}) => {
    const active = sSort===field;
    const d = sSortDir[field];
    return (
      <button onClick={()=>toggleSort(field)} style={{
        padding:"5px 9px", borderRadius:6, border:`1px solid ${active?color:C.border}`,
        cursor:"pointer", fontFamily:"inherit", fontSize:10, fontWeight:800,
        background:active?`${color}22`:C.card, color:active?color:C.muted,
        display:"flex", alignItems:"center", gap:3,
      }}>
        {label} <span style={{fontSize:9}}>{active?(d==="asc"?"↑":"↓"):"↕"}</span>
      </button>
    );
  };

  // ── STUDENT DETAIL ────────────────────────────────────────────────────────
  if(selStudent) {
    const s = selStudent;
    const ac = ageColors[s.ageGroup]||C.green;
    const myComps = comps.filter(c=>c.studentId===s.id).sort((a,b)=>b.date.localeCompare(a.date));
    const myTrains= trainings.filter(t=>t.studentId===s.id).sort((a,b)=>b.date.localeCompare(a.date));
    const bSwT=getBest(s.id,"swim","training");
    const bRnT=getBest(s.id,"run","training");
    const bSwC=getBest(s.id,"swim","comp");
    const bRnC=getBest(s.id,"run","comp");
    const compEvents=[...new Set(myComps.map(c=>c.name+"|"+c.date+"|"+c.location))];

    const handlePhoto = (e) => {
      const file=e.target.files[0]; if(!file) return;
      if(file.size > 5 * 1024 * 1024) {
        alert("Fotoğraf 5 MB'dan küçük olmalıdır.");
        e.target.value = "";
        return;
      }
      const reader=new FileReader();
      reader.onload=(ev)=>{
        setStudents(prev=>prev.map(x=>x.id===s.id?{...x,photo:ev.target.result}:x));
        setSelStudent(prev=>({...prev,photo:ev.target.result}));
      };
      reader.readAsDataURL(file);
    };

    return (
      <div style={{padding:"0 14px 14px"}}>
        <button onClick={()=>{setSelStudent(null);setEditMode(false);}} style={{
          display:"flex",alignItems:"center",gap:6,background:"none",border:"none",
          cursor:"pointer",color:C.muted,fontFamily:"inherit",fontWeight:800,
          fontSize:13,marginBottom:14,padding:0,
        }}>← Sporcular</button>

        {/* Profile card */}
        <div style={{background:C.card,borderRadius:14,padding:14,marginBottom:12,
          border:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <label style={{cursor:"pointer",flexShrink:0}}>
              <div style={{width:58,height:58,borderRadius:15,overflow:"hidden",
                background:s.gender==="E"?`${C.blue}22`:`${C.green}22`,
                display:"flex",alignItems:"center",justifyContent:"center",
                border:`2px solid ${ac}44`,position:"relative"}}>
                {s.photo
                  ? <img src={s.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                  : <span style={{fontSize:26}}>{s.gender==="E"?"👦":"👧"}</span>
                }
                <div style={{position:"absolute",bottom:0,right:0,width:18,height:18,
                  background:C.green,borderRadius:"50%",display:"flex",alignItems:"center",
                  justifyContent:"center",fontSize:9,fontWeight:900,color:"#fff"}}>+</div>
              </div>
              <input type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
            </label>
            <div style={{flex:1}}>
              {editMode ? (
                <div>
                  <input value={editData.name||s.name}
                    onChange={e=>setEditData(p=>({...p,name:e.target.value}))}
                    style={{...S.inp,marginBottom:6,fontSize:14}}/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
                    <select value={editData.gender||s.gender}
                      onChange={e=>setEditData(p=>({...p,gender:e.target.value}))} style={S.inp}>
                      <option value="E">👦 E</option><option value="K">👧 K</option>
                    </select>
                    <select value={editData.ageGroup||s.ageGroup}
                      onChange={e=>setEditData(p=>({...p,ageGroup:e.target.value}))} style={S.inp}>
                      {["U9","U11","U13","U15","U17"].map(g=><option key={g}>{g}</option>)}
                    </select>
                    <input type="number" value={editData.birthYear||s.birthYear}
                      onChange={e=>setEditData(p=>({...p,birthYear:+e.target.value}))}
                      style={S.inp} placeholder="Yıl"/>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{color:C.text,fontSize:17,fontWeight:900,marginBottom:5}}>{s.name}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    <span style={{...S.chip(ac),fontSize:10}}>{s.ageGroup}</span>
                    <span style={{...S.chip(s.gender==="E"?C.blue:C.green),fontSize:10}}>{s.gender==="E"?"Erkek":"Kız"}</span>
                    <span style={{...S.chip(C.muted),background:C.surface,fontSize:10}}>{s.birthYear}</span>
                    <span style={{...S.chip(C.muted),background:C.surface,fontSize:9,
                      maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.club}</span>
                  </div>
                </div>
              )}
            </div>
            {isCoach&&(
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                {editMode ? (
                  <>
                    <button onClick={()=>{
                      setStudents(prev=>prev.map(x=>x.id===s.id?{...x,...editData}:x));
                      setSelStudent(p=>({...p,...editData}));
                      setEditMode(false); setEditData({});
                    }} style={{...S.btn(C.green),padding:"6px 10px",fontSize:11,borderRadius:8}}>✅</button>
                    <button onClick={()=>{setEditMode(false);setEditData({});}}
                      style={{...S.btn(C.surface,C.muted),padding:"6px 10px",fontSize:11,borderRadius:8}}>✕</button>
                  </>
                ) : (
                  <>
                    <button onClick={()=>{setEditMode(true);setEditData({name:s.name,gender:s.gender,ageGroup:s.ageGroup,birthYear:s.birthYear});}}
                      style={{...S.btn(C.blue),padding:"6px 10px",fontSize:11,borderRadius:8}}>✏️</button>
                    <button onClick={()=>{
                      if(window.confirm&&!window.confirm("Sporcu silinsin mi?")) return;
                      setStudents(prev=>prev.filter(x=>x.id!==s.id));
                      setSelStudent(null);
                    }} style={{...S.btn(`${C.red}cc`),padding:"6px 10px",fontSize:11,borderRadius:8}}>🗑️</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Best times */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          {[
            {l:"Ant. En İyi 🏊",v:bSwT?fmtTime("swim",bSwT.minutes,bSwT.seconds,bSwT.milliseconds||0):"—",c:C.blue},
            {l:"Ant. En İyi 🏃",v:bRnT?fmtTime("run",bRnT.minutes,bRnT.seconds):"—",c:C.green},
            {l:"Yar. En İyi 🏊",v:bSwC?fmtTime("swim",bSwC.minutes,bSwC.seconds,bSwC.milliseconds||0):"—",c:C.gold},
            {l:"Yar. En İyi 🏃",v:bRnC?fmtTime("run",bRnC.minutes,bRnC.seconds):"—",c:C.gold},
          ].map(x=>(
            <div key={x.l} style={{background:C.card,borderRadius:11,padding:"10px 8px",
              border:`1px solid ${C.border}`,textAlign:"center"}}>
              <div style={{color:C.muted,fontSize:9,marginBottom:4,fontWeight:800}}>{x.l}</div>
              <div style={{color:x.c,fontSize:15,fontWeight:900}}>{x.v}</div>
            </div>
          ))}
        </div>

        {/* Competition results */}
        <div style={{background:C.card,borderRadius:12,marginBottom:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          <p style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.08em",margin:"10px 13px 8px"}}>
            YARIŞMA SONUÇLARI ({compEvents.length} yarışma)
          </p>
          {compEvents.length===0&&<p style={{color:C.muted,fontSize:11,padding:"8px 13px",margin:0}}>Kayıt yok.</p>}
          {compEvents.map((key,ei)=>{
            const [nm,dt,loc]=key.split("|");
            const evComps=myComps.filter(c=>c.name===nm&&c.date===dt);
            const sw=evComps.find(c=>c.discipline==="swim");
            const rn=evComps.find(c=>c.discipline==="run");
            return (
              <div key={key} style={{padding:"9px 13px",borderTop:ei>0?`1px solid ${C.border}`:"none"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                  <div>
                    <div style={{color:C.text,fontSize:12,fontWeight:800}}>{nm}</div>
                    <div style={{color:C.muted,fontSize:10}}>📍{loc} · {dt}</div>
                  </div>
                  {sw?.score&&<span style={{...S.chip(C.gold),fontSize:11}}>{sw.score} puan</span>}
                </div>
                <div style={{display:"flex",gap:8}}>
                  {sw&&<span style={{color:C.blue,fontSize:11,fontWeight:800,background:`${C.blue}18`,
                    padding:"3px 8px",borderRadius:6}}>🏊 {fmtTime("swim",sw.minutes,sw.seconds,sw.milliseconds||0)}</span>}
                  {rn&&<span style={{color:C.green,fontSize:11,fontWeight:800,background:`${C.green}18`,
                    padding:"3px 8px",borderRadius:6}}>🏃 {fmtTime("run",rn.minutes,rn.seconds,rn.milliseconds||0)}</span>}
                  {sw?.rank&&<span style={{color:C.muted,fontSize:10,marginLeft:"auto"}}>
                    {sw.rank}/{sw.totalParticipants||"?"}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Training records */}
        <div style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          <p style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.08em",margin:"10px 13px 8px"}}>
            ANTRENMAN KAYITLARI ({myTrains.length})
          </p>
          {myTrains.length===0&&<p style={{color:C.muted,fontSize:11,padding:"8px 13px",margin:0}}>Kayıt yok.</p>}
          {myTrains.slice(0,10).map((t,ti)=>(
            <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              padding:"7px 13px",borderTop:ti>0?`1px solid ${C.border}`:"none"}}>
              <span style={{color:C.muted,fontSize:11}}>{t.date} {t.discipline==="swim"?"🏊":"🏃"}</span>
              <span style={{color:t.discipline==="swim"?C.blue:C.green,fontWeight:800,fontSize:12}}>
                {fmtTime(t.discipline,t.minutes,t.seconds,t.milliseconds||0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── MAIN LIST ─────────────────────────────────────────────────────────────
  return (
    <div style={{padding:"0 14px 14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <h2 style={{color:C.text,fontSize:18,fontWeight:900,margin:0}}>
          Sporcular <span style={{color:C.muted,fontSize:13}}>({filtered.length})</span>
        </h2>
      </div>

      {/* Data source filter */}
      <div style={{display:"flex",background:C.card,borderRadius:9,padding:3,marginBottom:8,gap:4}}>
        {[["comp","🏅 Yarışma",C.gold],["training","⏱️ Antrenman",C.blue]].map(([v,l,c])=>(
          <button key={v} onClick={()=>setDataFilter(v)} style={{
            flex:1,padding:"7px 4px",borderRadius:7,border:"none",cursor:"pointer",
            fontFamily:"inherit",fontWeight:800,fontSize:11,
            background:dataFilter===v?`${c}33`:C.surface,
            color:dataFilter===v?c:C.muted,
            borderBottom:dataFilter===v?`2px solid ${c}`:"2px solid transparent",
          }}>{l}</button>
        ))}
      </div>

      {/* Age + gender filters */}
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
        {["ALL","U9","U11","U13","U15","U17"].map(g=>(
          <button key={g} onClick={()=>setAgeFilter(g)} style={{
            padding:"4px 9px",borderRadius:6,border:"none",cursor:"pointer",
            fontFamily:"inherit",fontSize:11,fontWeight:800,
            background:ageFilter===g?C.green:C.card,color:ageFilter===g?"#fff":C.muted,
          }}>{g==="ALL"?"Tümü":g}</button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",background:C.card,borderRadius:7,padding:2}}>
          {[["ALL","👤"],["E","👦"],["K","👧"]].map(([v,l])=>(
            <button key={v} onClick={()=>setGendFilter(v)} style={{
              padding:"4px 8px",borderRadius:5,border:"none",cursor:"pointer",
              fontFamily:"inherit",fontSize:11,fontWeight:800,
              background:gendFilter===v?C.surface:"transparent",
              color:gendFilter===v?C.text:C.muted,
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Sort buttons */}
      <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center"}}>
        <span style={{color:C.muted,fontSize:10,fontWeight:800,letterSpacing:"0.07em"}}>SIRALA:</span>
        <SortBtn field="name" label="İSİM" color={C.text}/>
        <SortBtn field="swim" label="🏊 YÜZME" color={C.blue}/>
        <SortBtn field="run"  label="🏃 KOŞMA" color={C.green}/>
      </div>

      {/* Table header */}
      <div style={{display:"flex",alignItems:"center",padding:"5px 11px",
        background:C.surface,borderRadius:"8px 8px 0 0",border:`1px solid ${C.border}`,borderBottom:"none"}}>
        <div style={{flex:1,color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.07em"}}>SPORCU</div>
        <div style={{width:80,textAlign:"center",color:dataFilter==="comp"?C.gold:C.blue,fontSize:9,fontWeight:800}}>
          🏊 YÜZME
        </div>
        <div style={{width:72,textAlign:"center",color:dataFilter==="comp"?C.gold:C.green,fontSize:9,fontWeight:800}}>
          🏃 KOŞMA
        </div>
        {isCoach&&<div style={{width:24}}/>}
      </div>

      <div style={{background:C.card,borderRadius:"0 0 11px 11px",border:`1px solid ${C.border}`,overflow:"hidden"}}>
        {filtered.map((s,i)=>{
          const ac=ageColors[s.ageGroup]||C.green;
          const swTime=s._sw?fmtTime("swim",s._sw.minutes,s._sw.seconds,s._sw.milliseconds||0):"—";
          const rnTime=s._rn?fmtTime("run",s._rn.minutes,s._rn.seconds):"—";
          return (
            <div key={s.id} style={{
              display:"flex",alignItems:"center",
              padding:"8px 11px",
              borderBottom:i<filtered.length-1?`1px solid ${C.border}`:"none",
              background:i%2===0?C.card:C.card2,
              cursor:"pointer",
            }} onClick={()=>setSelStudent(s)}>
              <div style={{display:"flex",alignItems:"center",gap:7,flex:1,minWidth:0}}>
                <div style={{width:30,height:30,borderRadius:8,flexShrink:0,overflow:"hidden",
                  background:s.gender==="E"?`${C.blue}22`:`${C.green}22`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>
                  {s.photo
                    ? <img src={s.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                    : (s.gender==="E"?"👦":"👧")
                  }
                </div>
                <div style={{minWidth:0}}>
                  <div style={{color:C.text,fontSize:12,fontWeight:800,
                    whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</div>
                  <div style={{display:"flex",gap:3,marginTop:2}}>
                    <span style={{...S.chip(ac),fontSize:8,padding:"1px 5px"}}>{s.ageGroup}</span>
                  </div>
                </div>
              </div>
              <div style={{width:80,textAlign:"center",
                color:s._sw?C.blue:C.muted,fontSize:11,fontWeight:s._sw?900:400}}>{swTime}</div>
              <div style={{width:72,textAlign:"center",
                color:s._rn?C.green:C.muted,fontSize:11,fontWeight:s._rn?900:400}}>{rnTime}</div>
              <div style={{width:20,textAlign:"center",color:C.muted,fontSize:12}}>›</div>
            </div>
          );
        })}
        {filtered.length===0&&(
          <p style={{color:C.muted,textAlign:"center",padding:"26px 0",fontSize:13}}>Sporcu bulunamadı.</p>
        )}
      </div>
    </div>
  );
};

export default PageAthletes;
