import React, { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

// PageReports — Gelişim Analizi Sayfası
// Props: rSt, rDisc, rMode, rView, rGrpGender,
//        setRMode, setRDisc, setRView, setRGrpGender,
//        comps, trainings, students, visibleStudents,
//        getBest, fmtTime, toSec,
//        ageColors, C, S
const PageReports = ({
  rSt, setRSt, rDisc, rMode, rView, rGrpGender,
  setRMode, setRDisc, setRView, setRGrpGender,
  comps, trainings, students, visibleStudents,
  getBest, fmtTime, toSec,
  ageColors, C, S,
}) => {
  const PALETTE = [C.green, C.blue, C.gold, "#FF7FC2", C.yg, "#FF8C57", "#C084FC", "#38BDF8"];
  const [chartType,   setChartType]   = useState("line");
  const [rGrpAge,     setRGrpAge]     = useState("ALL");
  const [activeStuds, setActiveStuds] = useState(null);

  const srcData = (rMode==="comp"?comps:trainings)
    .filter(p=>p.studentId===+rSt&&p.discipline===rDisc);
  const cd = [...srcData].sort((a,b)=>a.date.localeCompare(b.date)).map(p=>({
    date:p.date.slice(5),
    süre:parseFloat(toSec(p.minutes,p.seconds,p.milliseconds||0).toFixed(2)),
    label:fmtTime(rDisc,p.minutes,p.seconds,p.milliseconds||0),
    rank:p.rank||null, score:p.score||null,
    nm:p.name||"", loc:p.location||"",
  }));
  const best = cd.length?cd.reduce((b,c)=>c.süre<b.süre?c:b):null;
  const imp  = cd.length>1?(cd[0].süre-cd[cd.length-1].süre).toFixed(2):null;
  const lc   = rDisc==="swim"?C.blue:C.green;

  const grpStudents = visibleStudents.filter(s=>{
    if(rGrpGender!=="ALL"&&s.gender!==rGrpGender) return false;
    if(rGrpAge!=="ALL"&&s.ageGroup!==rGrpAge) return false;
    return true;
  });
  const displayStuds = activeStuds!==null
    ? grpStudents.filter(s=>activeStuds.includes(s.id))
    : grpStudents;

  const grpSource = rMode==="comp"?comps:trainings;
  const allDates = [...new Set(
    grpSource.filter(p=>displayStuds.some(s=>s.id===p.studentId)&&p.discipline===rDisc)
      .map(p=>p.date)
  )].sort();
  const grpChartData = allDates.map(date=>{
    const row = {date: date.slice(5)};
    displayStuds.forEach(s=>{
      const rec = grpSource.filter(p=>p.studentId===s.id&&p.discipline===rDisc&&p.date===date);
      if(rec.length){
        const b=rec.reduce((bx,p)=>toSec(p.minutes,p.seconds,p.milliseconds||0)<toSec(bx.minutes,bx.seconds,bx.milliseconds||0)?p:bx);
        row[`s${s.id}`]=parseFloat(toSec(b.minutes,b.seconds,b.milliseconds||0).toFixed(2));
        row[`l${s.id}`]=fmtTime(rDisc,b.minutes,b.seconds,b.milliseconds||0);
      }
    });
    return row;
  });

  const sortedBest = [...displayStuds].map(s=>{
    const recs=grpSource.filter(p=>p.studentId===s.id&&p.discipline===rDisc);
    const bst=recs.length?recs.reduce((b,p)=>toSec(p.minutes,p.seconds,p.milliseconds||0)<toSec(b.minutes,b.seconds,b.milliseconds||0)?p:b):null;
    return {s, bst, secs: bst?toSec(bst.minutes,bst.seconds,bst.milliseconds||0):9999};
  }).sort((a,b)=>a.secs-b.secs);

  const toggleStudent = (id) => {
    if(activeStuds===null) {
      setActiveStuds(grpStudents.map(s=>s.id).filter(x=>x!==id));
    } else if(activeStuds.includes(id)) {
      const next=activeStuds.filter(x=>x!==id);
      setActiveStuds(next.length===0?null:next);
    } else {
      const next=[...activeStuds,id];
      setActiveStuds(next.length===grpStudents.length?null:next);
    }
  };

  return (
    <div style={{padding:"0 14px 14px"}}>
      <h2 style={{color:C.text,fontSize:18,fontWeight:900,marginBottom:11}}>Gelişim Analizi</h2>

      {/* Individual / Group tabs */}
      <div style={{display:"flex",background:C.card,borderRadius:10,padding:3,marginBottom:11}}>
        {[["individual","👤 Bireysel"],["group","👥 Karşılaştırma"]].map(([v,l])=>(
          <button key={v} onClick={()=>setRView(v)} style={{
            flex:1,padding:"8px",borderRadius:8,border:"none",cursor:"pointer",
            fontFamily:"inherit",fontWeight:800,fontSize:12,
            background:rView===v?C.green:"transparent",color:rView===v?"#fff":C.muted,
          }}>{l}</button>
        ))}
      </div>

      {/* Source + discipline */}
      <div style={{display:"flex",gap:6,marginBottom:7}}>
        {[["training","⏱️ Antrenman",C.blue],["comp","🏅 Yarışma",C.gold]].map(([m,l,c])=>(
          <button key={m} onClick={()=>setRMode(m)} style={{
            flex:1,padding:8,borderRadius:8,cursor:"pointer",fontFamily:"inherit",
            fontWeight:800,fontSize:11,border:`2px solid ${rMode===m?c:C.border}`,
            background:rMode===m?`${c}22`:C.card,color:rMode===m?c:C.muted,
          }}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:11}}>
        {[["swim","🏊 Yüzme"],["run","🏃 Koşma"]].map(([d,l])=>(
          <button key={d} onClick={()=>setRDisc(d)} style={{
            flex:1,padding:8,borderRadius:8,cursor:"pointer",fontFamily:"inherit",
            fontWeight:800,fontSize:11,border:`2px solid ${rDisc===d?C.green:C.border}`,
            background:rDisc===d?`${C.green}22`:C.card,color:rDisc===d?C.green:C.muted,
          }}>{l}</button>
        ))}
      </div>

      {/* ════ INDIVIDUAL ════ */}
      {rView==="individual" && (<>
        <select value={rSt} onChange={e=>setRSt(e.target.value)} style={{...S.inp,marginBottom:11}}>
          <option value="">— Sporcu Seç —</option>
          {visibleStudents.map(s=><option key={s.id} value={s.id}>{s.name} ({s.ageGroup})</option>)}
        </select>
        {rSt&&cd.length>0 ? (<>
          <div style={{background:C.card,borderRadius:12,padding:"12px 4px 7px",marginBottom:10,border:`1px solid ${C.border}`}}>
            <p style={{color:C.muted,fontSize:10,fontWeight:800,letterSpacing:"0.08em",margin:"0 8px 8px"}}>SÜRE GRAFİĞİ (sn)</p>
            <ResponsiveContainer width="100%" height={175}>
              <LineChart data={cd}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.surface}/>
                <XAxis dataKey="date" tick={{fill:C.muted,fontSize:10}}/>
                <YAxis tick={{fill:C.muted,fontSize:10}} domain={["auto","auto"]} width={34}/>
                <Tooltip
                  contentStyle={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,fontFamily:"inherit",fontSize:11}}
                  labelStyle={{color:C.text,fontWeight:800}}
                  formatter={(v,n,{payload})=>[payload.label,"Süre"]}/>
                <Line type="monotone" dataKey="süre" stroke={lc} strokeWidth={3}
                  dot={{fill:lc,r:4,strokeWidth:0}} activeDot={{r:6}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:10}}>
            {[
              {l:"En İyi",  v:best?.label||"—",c:C.gold},
              {l:"Kayıt",   v:cd.length,        c:C.green},
              {l:"Gelişim", v:imp!==null?`${+imp>0?"+":"-"}${Math.abs(imp)}s`:"—",
                c:+imp>0?C.greenL:C.red},
            ].map(s=>(
              <div key={s.l} style={{background:C.card,borderRadius:9,padding:"9px 6px",textAlign:"center",border:`1px solid ${C.border}`}}>
                <div style={{color:s.c,fontSize:14,fontWeight:900}}>{s.v}</div>
                <div style={{color:C.muted,fontSize:10,marginTop:2}}>{s.l}</div>
              </div>
            ))}
          </div>
          {/* Records table */}
          <div style={{background:C.card,borderRadius:11,border:`1px solid ${C.border}`,overflow:"hidden"}}>
            <p style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.08em",padding:"9px 11px 6px",margin:0,borderBottom:`1px solid ${C.border}`}}>TÜM KAYITLAR</p>
            {[...srcData].sort((a,b)=>b.date.localeCompare(a.date)).map((p,pi)=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",padding:"5px 11px",
                borderBottom:`1px solid ${C.border}`,background:pi%2===0?C.card:C.card2}}>
                <span style={{color:C.muted,fontSize:10,width:56,flexShrink:0}}>{p.date.slice(5)}</span>
                {p.name&&<span style={{color:C.muted,fontSize:10,flex:1,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:6}}>{p.name}</span>}
                {p.rank&&<span style={{color:C.muted,fontSize:9,marginRight:6,flexShrink:0}}>{p.rank}/{p.totalParticipants||"?"}</span>}
                <span style={{color:lc,fontWeight:900,fontSize:12,flexShrink:0,marginLeft:"auto"}}>
                  {fmtTime(rDisc,p.minutes,p.seconds,p.milliseconds||0)}
                </span>
              </div>
            ))}
          </div>
        </>) : (
          <div style={{textAlign:"center",marginTop:36}}>
            <div style={{fontSize:44,marginBottom:9}}>👤</div>
            <p style={{color:C.muted,fontSize:13}}>{rSt?"Bu filtrede kayıt yok.":"Sporcu seçin."}</p>
          </div>
        )}
      </>)}

      {/* ════ GROUP COMPARISON ════ */}
      {rView==="group" && (<>
        <div style={{display:"flex",gap:6,marginBottom:8}}>
          <div style={{flex:1}}>
            <span style={{...S.lbl,fontSize:9}}>CİNSİYET</span>
            <div style={{display:"flex",background:C.card,borderRadius:8,padding:2}}>
              {[["ALL","Tümü"],["E","👦"],["K","👧"]].map(([v,l])=>(
                <button key={v} onClick={()=>setRGrpGender(v)} style={{
                  flex:1,padding:"6px 4px",borderRadius:6,border:"none",cursor:"pointer",
                  fontFamily:"inherit",fontSize:11,fontWeight:800,
                  background:rGrpGender===v?C.surface:"transparent",
                  color:rGrpGender===v?C.text:C.muted,
                }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{flex:1}}>
            <span style={{...S.lbl,fontSize:9}}>YAŞ GRUBU</span>
            <select value={rGrpAge} onChange={e=>{setRGrpAge(e.target.value);setActiveStuds(null);}} style={S.inp}>
              {["ALL","U9","U11","U13","U15","U17"].map(g=><option key={g} value={g}>{g==="ALL"?"Tümü":g}</option>)}
            </select>
          </div>
        </div>

        {/* Chart type */}
        <div style={{display:"flex",gap:5,marginBottom:10}}>
          <span style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.07em",alignSelf:"center"}}>GRAFİK:</span>
          {[["line","📈 Çizgi"],["bar","📊 Sütun"],["scatter","⚡ Nokta"]].map(([t,l])=>(
            <button key={t} onClick={()=>setChartType(t)} style={{
              padding:"5px 10px",borderRadius:7,border:`1px solid ${chartType===t?C.green:C.border}`,
              cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:800,
              background:chartType===t?`${C.green}22`:C.card,
              color:chartType===t?C.green:C.muted,
            }}>{l}</button>
          ))}
        </div>

        {/* Student toggle chips */}
        <div style={{background:C.card,borderRadius:11,padding:"9px 10px",marginBottom:10,border:`1px solid ${C.border}`}}>
          <p style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.07em",margin:"0 0 7px"}}>
            SPORCULAR — tıkla ekle/çıkar
          </p>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {grpStudents.map((s,i)=>{
              const active=activeStuds===null||activeStuds.includes(s.id);
              return (
                <button key={s.id} onClick={()=>toggleStudent(s.id)} style={{
                  display:"flex",alignItems:"center",gap:4,
                  padding:"4px 9px",borderRadius:7,cursor:"pointer",fontFamily:"inherit",
                  border:`1px solid ${active?PALETTE[i%PALETTE.length]:C.border}`,
                  background:active?`${PALETTE[i%PALETTE.length]}22`:C.surface,
                  opacity:active?1:0.5,
                }}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:PALETTE[i%PALETTE.length]}}/>
                  <span style={{color:active?C.text:C.muted,fontSize:10,fontWeight:800}}>{s.name}</span>
                  <span style={{...S.chip(ageColors[s.ageGroup]||C.green),fontSize:8,padding:"1px 4px"}}>{s.ageGroup}</span>
                </button>
              );
            })}
          </div>
        </div>

        {displayStuds.length>0&&grpChartData.length>0 ? (<>
          <div style={{background:C.card,borderRadius:12,padding:"12px 4px 7px",marginBottom:11,border:`1px solid ${C.border}`}}>
            <p style={{color:C.muted,fontSize:10,fontWeight:800,letterSpacing:"0.08em",margin:"0 8px 8px"}}>
              KARŞILAŞTIRMA — {rDisc==="swim"?"YÜZME":"KOŞMA"} (sn)
            </p>
            <ResponsiveContainer width="100%" height={220}>
              {chartType==="line" ? (
                <LineChart data={grpChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.surface}/>
                  <XAxis dataKey="date" tick={{fill:C.muted,fontSize:9}}/>
                  <YAxis tick={{fill:C.muted,fontSize:9}} domain={["auto","auto"]} width={34}/>
                  <Tooltip
                    contentStyle={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,fontFamily:"inherit",fontSize:10}}
                    formatter={(v,key,{payload})=>{
                      const sid=+key.replace("s","");
                      const st=displayStuds.find(s=>s.id===sid);
                      return [payload[`l${sid}`]||`${v}s`, st?.name||key];
                    }}/>
                  {displayStuds.map((s,i)=>(
                    <Line key={s.id} type="monotone" dataKey={`s${s.id}`}
                      stroke={PALETTE[grpStudents.findIndex(x=>x.id===s.id)%PALETTE.length]}
                      strokeWidth={2.5} dot={{r:4,strokeWidth:0}} activeDot={{r:6}} connectNulls={false}/>
                  ))}
                </LineChart>
              ) : chartType==="bar" ? (
                <BarChart data={grpChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.surface}/>
                  <XAxis dataKey="date" tick={{fill:C.muted,fontSize:9}}/>
                  <YAxis tick={{fill:C.muted,fontSize:9}} domain={["auto","auto"]} width={34}/>
                  <Tooltip
                    contentStyle={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,fontFamily:"inherit",fontSize:10}}
                    formatter={(v,key,{payload})=>{
                      const sid=+key.replace("s","");
                      const st=displayStuds.find(s=>s.id===sid);
                      return [payload[`l${sid}`]||`${v}s`, st?.name||key];
                    }}/>
                  {displayStuds.map((s,i)=>(
                    <Bar key={s.id} dataKey={`s${s.id}`}
                      fill={PALETTE[grpStudents.findIndex(x=>x.id===s.id)%PALETTE.length]}
                      radius={[3,3,0,0]}/>
                  ))}
                </BarChart>
              ) : (
                <BarChart data={sortedBest.filter(x=>x.bst).map(({s,secs,bst})=>({
                  name:s.name.split(" ")[0],
                  val:secs,
                  full:fmtTime(rDisc,bst.minutes,bst.seconds,bst.milliseconds||0),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.surface}/>
                  <XAxis dataKey="name" tick={{fill:C.muted,fontSize:9}}/>
                  <YAxis tick={{fill:C.muted,fontSize:9}} domain={["auto","auto"]} width={34}/>
                  <Tooltip
                    contentStyle={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,fontFamily:"inherit",fontSize:10}}
                    formatter={(v,n,{payload})=>[payload.full,"En İyi"]}/>
                  <Bar dataKey="val" radius={[4,4,0,0]}>
                    {sortedBest.filter(x=>x.bst).map(({s},i)=>(
                      <Cell key={s.id} fill={PALETTE[grpStudents.findIndex(x=>x.id===s.id)%PALETTE.length]}/>
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Best times table */}
          <div style={{background:C.card,borderRadius:11,border:`1px solid ${C.border}`,overflow:"hidden"}}>
            <div style={{display:"flex",padding:"5px 11px",background:C.surface}}>
              <div style={{width:22,color:C.muted,fontSize:9,fontWeight:800}}>#</div>
              <div style={{flex:1,color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.07em"}}>SPORCU</div>
              <div style={{width:70,textAlign:"center",color:C.muted,fontSize:9,fontWeight:800}}>EN İYİ</div>
              <div style={{width:40,textAlign:"center",color:C.muted,fontSize:9,fontWeight:800}}>KAYIT</div>
            </div>
            {sortedBest.map(({s,bst},i)=>{
              if(!activeStuds||activeStuds.includes(s.id)){
                const recs=grpSource.filter(p=>p.studentId===s.id&&p.discipline===rDisc);
                const colIdx=grpStudents.findIndex(x=>x.id===s.id);
                return (
                  <div key={s.id} style={{display:"flex",alignItems:"center",padding:"7px 11px",
                    background:i%2===0?C.card:C.card2,
                    borderBottom:i<sortedBest.length-1?`1px solid ${C.border}`:"none"}}>
                    <div style={{width:22,color:C.muted,fontSize:10}}>{bst?i+1:"—"}</div>
                    <div style={{flex:1,display:"flex",alignItems:"center",gap:5}}>
                      <div style={{width:7,height:7,borderRadius:"50%",background:PALETTE[colIdx%PALETTE.length],flexShrink:0}}/>
                      <span style={{color:C.text,fontSize:11,fontWeight:800}}>{s.name}</span>
                      <span style={{...S.chip(ageColors[s.ageGroup]||C.green),fontSize:8,padding:"1px 4px"}}>{s.ageGroup}</span>
                    </div>
                    <div style={{width:70,textAlign:"center",
                      color:bst?PALETTE[colIdx%PALETTE.length]:C.muted,fontWeight:900,fontSize:11}}>
                      {bst?fmtTime(rDisc,bst.minutes,bst.seconds,bst.milliseconds||0):"—"}
                    </div>
                    <div style={{width:40,textAlign:"center",color:C.muted,fontSize:11}}>{recs.length}</div>
                  </div>
                );
              }
              return null;
            }).filter(Boolean)}
          </div>
        </>) : (
          <div style={{textAlign:"center",marginTop:36}}>
            <div style={{fontSize:44,marginBottom:9}}>📊</div>
            <p style={{color:C.muted,fontSize:13}}>
              {displayStuds.length===0?"Bu filtrede sporcu yok.":"Henüz veri yok."}
            </p>
          </div>
        )}
      </>)}
    </div>
  );
};

export default PageReports;
