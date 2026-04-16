// ─────────────────────────────────────────────
//  PageSettings.jsx  —  Ayarlar sayfası
//
//  Props:
//    coaches, setCoaches
//    parents, setParents
//    students, setStudents
//    comps, setComps
//    calendar, setCalendar
//    authUser, setAuthUser
//    isCoach
//    setPage
//    C  (renk paleti)
//    S  (stil nesnesi — makeStyles çıktısı)
// ─────────────────────────────────────────────
import { useState } from "react";
import { makeUsername, makePassword, fmtDate } from "./utils.js";

export default function PageSettings({
  coaches,  setCoaches,
  parents,  setParents,
  students, setStudents,
  comps,    setComps,
  calendar, setCalendar,
  authUser, setAuthUser,
  isCoach,
  setPage,
  C, S,
}) {

  // ── Sekme state ──────────────────────────────
  const [settingsTab, setSettingsTab] = useState("athletes");

  // ── Sporcu ekleme ────────────────────────────
  const [newStudent, setNewStudent] = useState({
    name:"", gender:"E", ageGroup:"U11", birthYear:2017, club:"ENVA ÇEVRE SPOR KULÜBÜ",
  });
  const [showAddS, setShowAddS] = useState(false);

  // ── Antrenör ekleme ──────────────────────────
  const [newCoach, setNewCoach] = useState({ name:"", username:"", password:"" });
  const [showAddC, setShowAddC] = useState(false);
  const [editCoachId, setEditCoachId] = useState(null);
  const [editCoachData, setEditCoachData] = useState({});

  // ── Veli ekleme ──────────────────────────────
  const [newParent, setNewParent] = useState({ name:"", username:"", password:"", linkedStudentIds:[] });
  const [showAddP, setShowAddP] = useState(false);

  // ── Takvim filtresi ──────────────────────────
  const [calFilter,    setCalFilter]    = useState({ cat:"", type:"", month:"", year:"" });
  const [editCalId,    setEditCalId]    = useState(null);
  const [editCalData,  setEditCalData]  = useState({});

  // ── PDF import mesajları ─────────────────────
  const [importMsg,    setImportMsg]    = useState("");
  const [calImportMsg, setCalImportMsg] = useState("");

  // ── Takvim tipi etiketleri — item 22: baş harf büyük ───────────────────
  const typeLabels = {
    gelisim:"Gelişim", ulusal:"Ulusal", triathle:"Triathle",
    tetratlon:"Tetratlon", laserrun:"Laser Run", biathle:"Biathle", diger:"Diğer",
  };

  // ── Sonuç düzenleme state — item 24 ─────────────────────────────────
  const [editCompKey, setEditCompKey] = useState(null);
  const [editCompData, setEditCompData] = useState({ name:"", location:"", date:"" });

  // ─────────────────────────────────────────────
  //  PDF İmport: Yarışma Sonuçları (Claude API)
  // ─────────────────────────────────────────────
  const handleCompPDF = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportMsg("📄 PDF okunuyor...");
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result.split(",")[1];
      try {
        setImportMsg("🤖 Sonuçlar analiz ediliyor...");
        const apiKey = process.env.REACT_APP_ANTHROPIC_KEY;
        if (!apiKey) {
          setImportMsg("❌ REACT_APP_ANTHROPIC_KEY bulunamadı. .env dosyasını kontrol edin.");
          return;
        }
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4000,
            messages: [{
              role: "user",
              content: [
                { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
                { type: "text", text: `Bu pentatlon yarışma sonuçları PDF'inden SADECE şu kulüplerin sporcularını çıkar:
"ENVA ÇEVRE SPOR KULÜBÜ" ve "TOHUM ANKARA SK".

JSON array döndür (başka hiçbir şey yazma, kod bloğu da kullanma):
[
  {
    "name": "sporcu adı soyadı",
    "club": "kulüp adı",
    "ageGroup": "U9|U11|U13|U15|U17",
    "gender": "E|K",
    "compName": "yarışma adı",
    "location": "şehir",
    "date": "YYYY-MM-DD",
    "swimMin": 0, "swimSec": 0, "swimMs": 0,
    "runMin": 0,  "runSec": 0,  "runMs": 0,
    "rank": 0, "totalParticipants": 0, "score": 0
  }
]
Tarih formatı: PDF'deki tarihi YYYY-MM-DD yap. Yüzme süresi mm:ss.ms formatındaki değerleri ayrıştır.` },
              ],
            }],
          }),
        });
        const data = await res.json();
        const text  = data.content.find(b => b.type === "text")?.text || "";
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);

        if (!Array.isArray(parsed) || parsed.length === 0) {
          setImportMsg("⚠️ Kulüpten sporcu bulunamadı.");
          return;
        }

        let added = 0;
        parsed.forEach(row => {
          const s = students.find(x => x.name.toLowerCase() === row.name.toLowerCase());
          if (!s) return;
          const newId = Date.now() + Math.random();
          const base  = {
            id: newId, studentId: s.id, date: row.date,
            name: row.compName, location: row.location, type: "gelisim",
            rank: row.rank || 0, totalParticipants: row.totalParticipants || 0, score: row.score || 0,
          };
          if (row.swimMin || row.swimSec) {
            setComps(prev => [...prev, {
              ...base, id: newId + 0.1, discipline: "swim",
              minutes: row.swimMin, seconds: row.swimSec, milliseconds: row.swimMs,
            }]);
            added++;
          }
          if (row.runMin || row.runSec) {
            setComps(prev => [...prev, {
              ...base, id: newId + 0.2, discipline: "run",
              minutes: row.runMin, seconds: row.runSec, milliseconds: row.runMs,
            }]);
            added++;
          }
        });
        setImportMsg(`✅ ${parsed.length} sporcu bulundu, ${added} kayıt eklendi!`);
      } catch(err) {
        setImportMsg("❌ Hata: " + err.message);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ─────────────────────────────────────────────
  //  PDF İmport: Yarışma Takvimi (Claude API)
  // ─────────────────────────────────────────────
  const handleCalPDF = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCalImportMsg("📄 Takvim PDF okunuyor...");
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result.split(",")[1];
      try {
        setCalImportMsg("🤖 Takvim analiz ediliyor...");
        const apiKey = process.env.REACT_APP_ANTHROPIC_KEY;
        if (!apiKey) {
          setCalImportMsg("❌ REACT_APP_ANTHROPIC_KEY bulunamadı. .env dosyasını kontrol edin.");
          return;
        }
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4000,
            messages: [{
              role: "user",
              content: [
                { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
                { type: "text", text: `Bu TMPF faaliyet takvimi PDF'inden U9, U11, U13, U15 ve U17 kategorilerini içeren yarışmaları çıkar.
JSON array döndür (başka hiçbir şey yazma):
[
  {
    "name": "yarışma adı",
    "location": "şehir/yer",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "categories": ["U9","U11"],
    "type": "gelisim|ulusal|triathle|tetratlon|laserrun|biathle|diger"
  }
]
Sadece U9/U11/U13/U15/U17 kategorilerinden birini içerenleri ekle. Kategorileri PDF'deki bilgilerden çıkar.` },
              ],
            }],
          }),
        });
        const data = await res.json();
        const text  = data.content.find(b => b.type === "text")?.text || "";
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        const newEntries = parsed.map((x, i) => ({ ...x, id: Date.now() + i }));
        setCalendar(newEntries);
        setCalImportMsg(`✅ ${newEntries.length} etkinlik takvime eklendi!`);
      } catch(err) {
        setCalImportMsg("❌ Hata: " + err.message);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Takvim filtresi ──────────────────────────
  const CAL_MONTH_NAMES = ["","Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  const filteredCal = calendar.filter(ev => {
    if (calFilter.cat   && !ev.categories.includes(calFilter.cat))  return false;
    if (calFilter.type  && ev.type !== calFilter.type)               return false;
    if (calFilter.month && !ev.startDate.startsWith(calFilter.month)) return false;
    if (calFilter.year  && !ev.startDate.startsWith(calFilter.year))  return false;
    return true;
  });
  const calYears = [...new Set(calendar.map(ev => ev.startDate.slice(0,4)))].sort();
  const calMonths = [...new Set(calendar.map(ev => ev.startDate.slice(0,7)))].sort();

  // ── Sekme tanımları ──────────────────────────
  const TABS = [
    { id:"athletes", label:"🏅 Sporcular" },
    { id:"coaches",  label:"🎯 Antrenörler" },
    { id:"parents",  label:"👨‍👧 Veliler" },
    { id:"calendar", label:"📅 Takvim" },
    { id:"results",  label:"📊 Sonuçlar" },
  ];

  // ─────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────
  return (
    <div style={{ padding:"0 14px 14px" }}>
      <h2 style={{ color:C.text, fontSize:17, fontWeight:900, marginBottom:12 }}>⚙️ Ayarlar</h2>

      {/* ── Sekme çubuğu ── */}
      <div style={{ display:"flex", gap:4, marginBottom:14, overflowX:"auto", paddingBottom:4 }}>
        {TABS.filter(() => isCoach).map(t => (
          <button key={t.id} onClick={() => setSettingsTab(t.id)} style={{
            padding:"7px 11px", borderRadius:9, border:"none", cursor:"pointer",
            fontFamily:"inherit", fontWeight:800, fontSize:11, whiteSpace:"nowrap",
            background: settingsTab === t.id ? C.green : C.card,
            color:       settingsTab === t.id ? "#fff"   : C.muted,
          }}>{t.label}</button>
        ))}
      </div>

      {/* ════════════════════════════════════════
          SPORCULAR SEKMESİ
      ════════════════════════════════════════ */}
      {settingsTab === "athletes" && isCoach && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <span style={{ color:C.muted, fontSize:11 }}>{students.length} sporcu</span>
            <button onClick={() => setShowAddS(!showAddS)} style={{
              ...S.btn(C.green), padding:"7px 14px", borderRadius:9, fontSize:12,
            }}>+ Sporcu Ekle</button>
          </div>

          {showAddS && (
            <div style={{ background:C.card, borderRadius:12, padding:13, marginBottom:12, border:`1px solid ${C.border}` }}>
              <p style={{ color:C.muted, fontSize:10, fontWeight:800, letterSpacing:"0.08em", margin:"0 0 10px" }}>YENİ SPORCU</p>
              {[["İsim Soyisim","name","text"],["Doğum Yılı","birthYear","number"]].map(([lbl, field, type]) => (
                <div key={field} style={{ marginBottom:8 }}>
                  <span style={S.lbl}>{lbl}</span>
                  <input type={type} value={newStudent[field]}
                    onChange={e => setNewStudent(p => ({
                      ...p, [field]: type === "number" ? +e.target.value : e.target.value,
                    }))}
                    style={S.inp}/>
                </div>
              ))}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:8 }}>
                <div>
                  <span style={S.lbl}>CİNSİYET</span>
                  <select value={newStudent.gender}
                    onChange={e => setNewStudent(p => ({ ...p, gender: e.target.value }))}
                    style={S.inp}>
                    <option value="E">Erkek</option>
                    <option value="K">Kız</option>
                  </select>
                </div>
                <div>
                  <span style={S.lbl}>YAŞ GRUBU</span>
                  <select value={newStudent.ageGroup}
                    onChange={e => setNewStudent(p => ({ ...p, ageGroup: e.target.value }))}
                    style={S.inp}>
                    {["U9","U11","U13","U15","U17"].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom:10 }}>
                <span style={S.lbl}>KULÜP</span>
                <select value={newStudent.club}
                  onChange={e => setNewStudent(p => ({ ...p, club: e.target.value }))}
                  style={S.inp}>
                  <option>ENVA ÇEVRE SPOR KULÜBÜ</option>
                  <option>TOHUM ANKARA SK</option>
                </select>
              </div>
              <button onClick={() => {
                if (!newStudent.name.trim()) return;
                setStudents(p => [...p, { ...newStudent, id: Date.now() }]);
                setNewStudent({ name:"", gender:"E", ageGroup:"U11", birthYear:2017, club:"ENVA ÇEVRE SPOR KULÜBÜ" });
                setShowAddS(false);
              }} style={{
                ...S.btn(`linear-gradient(135deg,${C.green},${C.blue})`),
                width:"100%", padding:10, borderRadius:9, fontSize:13,
              }}>✅ Kaydet</button>
            </div>
          )}

          {["ENVA ÇEVRE SPOR KULÜBÜ","TOHUM ANKARA SK"].map(club => {
            const clubStudents = students.filter(s => s.club === club);
            return (
              <div key={club} style={{
                background:C.card, borderRadius:12, marginBottom:10,
                border:`1px solid ${C.border}`, overflow:"hidden",
              }}>
                <p style={{
                  color:C.green, fontSize:10, fontWeight:800, letterSpacing:"0.08em",
                  padding:"9px 13px 6px", margin:0, borderBottom:`1px solid ${C.border}`,
                }}>{club}</p>
                {clubStudents.map((s, i) => (
                  <div key={s.id} style={{
                    display:"flex", alignItems:"center", padding:"8px 13px",
                    borderTop: i > 0 ? `1px solid ${C.border}` : "none",
                  }}>
                    <span style={{ fontSize:14, marginRight:8 }}>{s.gender === "E" ? "♂" : "♀"}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ color:C.text, fontSize:12, fontWeight:800 }}>{s.name}</div>
                      <div style={{ color:C.muted, fontSize:10 }}>{s.ageGroup} · {s.birthYear}</div>
                    </div>
                    <span style={{
                      ...S.chip(s.ageGroup==="U9"?C.green:s.ageGroup==="U11"?C.blue:s.ageGroup==="U13"?C.yg:C.gold),
                      fontSize:9, marginRight:8,
                    }}>{s.ageGroup}</span>
                    {/* item 19: Ayarlar'da sporcu silme YOK — silme işlemi Sporcular sayfasından yapılır */}
                  </div>
                ))}
                {clubStudents.length === 0 && (
                  <p style={{ color:C.muted, fontSize:11, padding:"8px 13px", margin:0 }}>Sporcu yok.</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════
          ANTRENÖRLER SEKMESİ
      ════════════════════════════════════════ */}
      {settingsTab === "coaches" && isCoach && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <span style={{ color:C.muted, fontSize:11 }}>{coaches.length} antrenör</span>
            <button onClick={() => setShowAddC(!showAddC)} style={{
              ...S.btn(C.blue), padding:"7px 14px", borderRadius:9, fontSize:12,
            }}>+ Antrenör Ekle</button>
          </div>

          {showAddC && (
            <div style={{ background:C.card, borderRadius:12, padding:13, marginBottom:12, border:`1px solid ${C.border}` }}>
              <div style={{ marginBottom:8 }}>
                <span style={S.lbl}>AD SOYAD</span>
                <input value={newCoach.name}
                  onChange={e => {
                    const n = e.target.value;
                    setNewCoach(p => ({
                      ...p, name: n,
                      username: p.username || makeUsername(n),
                      password: p.password || makePassword(n),
                    }));
                  }}
                  style={S.inp}/>
              </div>
              <div style={{ marginBottom:8 }}>
                <span style={S.lbl}>KULLANICI ADI (otomatik)</span>
                <input value={newCoach.username}
                  onChange={e => setNewCoach(p => ({ ...p, username: e.target.value }))}
                  style={S.inp}/>
              </div>
              <div style={{ marginBottom:8 }}>
                <span style={S.lbl}>ŞİFRE (otomatik)</span>
                <input value={newCoach.password}
                  onChange={e => setNewCoach(p => ({ ...p, password: e.target.value }))}
                  style={S.inp}/>
              </div>
              {/* Fotoğraf yükleme */}
              <div style={{ marginBottom:10 }}>
                <span style={S.lbl}>FOTOĞRAF (isteğe bağlı)</span>
                <label style={{
                  display:"flex", alignItems:"center", gap:8, cursor:"pointer",
                  background:C.surface, borderRadius:8, padding:"8px 10px", border:`1px solid ${C.border}`,
                }}>
                  {newCoach.photo
                    ? <img src={newCoach.photo} style={{ width:36, height:36, borderRadius:9, objectFit:"cover" }} alt=""/>
                    : <div style={{ width:36, height:36, borderRadius:9, background:C.card,
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🎯</div>
                  }
                  <span style={{ color:C.muted, fontSize:11 }}>📷 Fotoğraf Seç</span>
                  <input type="file" accept="image/*" onChange={e => {
                    const f = e.target.files[0]; if (!f) return;
                    const r = new FileReader();
                    r.onload = ev => setNewCoach(p => ({ ...p, photo: ev.target.result }));
                    r.readAsDataURL(f);
                  }} style={{ display:"none" }}/>
                </label>
              </div>
              <button onClick={() => {
                if (!newCoach.name || !newCoach.username || !newCoach.password) return;
                setCoaches(p => [...p, { ...newCoach, id: Date.now(), role:"coach" }]);
                setNewCoach({ name:"", username:"", password:"", photo:null });
                setShowAddC(false);
              }} style={{
                ...S.btn(`linear-gradient(135deg,${C.blue},${C.green})`),
                width:"100%", padding:10, borderRadius:9, fontSize:13,
              }}>✅ Kaydet</button>
            </div>
          )}

          {coaches.map((c, i) => (
            <div key={c.id} style={{
              display:"flex", alignItems:"center", background:C.card, borderRadius:11,
              padding:"10px 13px", marginBottom:8, border:`1px solid ${C.border}`,
            }}>
              <div style={{
                width:36, height:36, borderRadius:10, background:`${C.blue}22`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, marginRight:10,
              }}>
                {c.photo
                  ? <img src={c.photo} style={{ width:36, height:36, borderRadius:10, objectFit:"cover" }} alt=""/>
                  : "🎯"
                }
              </div>
              <div style={{ flex:1 }}>
                <div style={{ color:C.text, fontSize:13, fontWeight:800 }}>{c.name}</div>
                <div style={{ color:C.muted, fontSize:10 }}>@{c.username}</div>
              </div>
              {c.id !== authUser.id && (
                editCoachId === c.id ? (
                  <div style={{display:"flex",gap:5}}>
                    <button onClick={()=>{setCoaches(p=>p.map(x=>x.id===c.id?{...x,...editCoachData}:x));setEditCoachId(null);}} style={{background:`${C.green}22`,color:C.green,border:"none",borderRadius:6,padding:"4px 8px",fontSize:11,cursor:"pointer",fontWeight:800}}>✅</button>
                    <button onClick={()=>setEditCoachId(null)} style={{background:C.surface,color:C.muted,border:"none",borderRadius:6,padding:"4px 8px",fontSize:11,cursor:"pointer"}}>✕</button>
                  </div>
                ) : (
                  <div style={{display:"flex",gap:5}}>
                    <button onClick={()=>{setEditCoachId(c.id);setEditCoachData({name:c.name,username:c.username});}} style={{background:`${C.blue}22`,color:C.blue,border:"none",borderRadius:6,padding:"4px 8px",fontSize:11,cursor:"pointer",fontWeight:800}}>✏️</button>
                    <button onClick={()=>{if(!window.confirm||window.confirm("Antrenör silinsin mi?"))setCoaches(p=>p.filter(x=>x.id!==c.id));}} style={{background:`${C.red}22`,color:C.red,border:"none",borderRadius:6,padding:"4px 8px",fontSize:11,cursor:"pointer",fontWeight:800}}>🗑️</button>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════
          VELİLER SEKMESİ
      ════════════════════════════════════════ */}
      {settingsTab === "parents" && isCoach && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <span style={{ color:C.muted, fontSize:11 }}>{parents.length} veli</span>
            <button onClick={() => setShowAddP(!showAddP)} style={{
              ...S.btn(C.yg), padding:"7px 14px", borderRadius:9, fontSize:12,
            }}>+ Veli Ekle</button>
          </div>

          {showAddP && (
            <div style={{ background:C.card, borderRadius:12, padding:13, marginBottom:12, border:`1px solid ${C.border}` }}>
              <div style={{ marginBottom:8 }}>
                <span style={S.lbl}>AD SOYAD</span>
                <input value={newParent.name}
                  onChange={e => {
                    const n = e.target.value;
                    setNewParent(p => ({
                      ...p, name: n,
                      username: p.username || makeUsername(n),
                      password: p.password || makePassword(n),
                    }));
                  }}
                  style={S.inp}/>
              </div>
              <div style={{ marginBottom:8 }}>
                <span style={S.lbl}>KULLANICI ADI (otomatik)</span>
                <input value={newParent.username}
                  onChange={e => setNewParent(p => ({ ...p, username: e.target.value }))}
                  style={S.inp}/>
              </div>
              <div style={{ marginBottom:8 }}>
                <span style={S.lbl}>ŞİFRE (otomatik)</span>
                <input value={newParent.password}
                  onChange={e => setNewParent(p => ({ ...p, password: e.target.value }))}
                  style={S.inp}/>
              </div>
              <div style={{ marginBottom:10 }}>
                <span style={S.lbl}>BAĞLI SPORCULAR</span>
                {students.map(s => (
                  <label key={s.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0", cursor:"pointer" }}>
                    <input type="checkbox"
                      checked={newParent.linkedStudentIds.includes(s.id)}
                      onChange={e => setNewParent(p => ({
                        ...p, linkedStudentIds: e.target.checked
                          ? [...p.linkedStudentIds, s.id]
                          : p.linkedStudentIds.filter(x => x !== s.id),
                      }))}
                    />
                    <span style={{ color:C.text, fontSize:12 }}>{s.name} ({s.ageGroup})</span>
                  </label>
                ))}
              </div>
              <button onClick={() => {
                if (!newParent.name || !newParent.username) return;
                setParents(p => [...p, { ...newParent, id: Date.now(), role:"parent" }]);
                setNewParent({ name:"", username:"", password:"", linkedStudentIds:[] });
                setShowAddP(false);
              }} style={{
                ...S.btn(`linear-gradient(135deg,${C.yg},${C.green})`),
                width:"100%", padding:10, borderRadius:9, fontSize:13,
              }}>✅ Kaydet</button>
            </div>
          )}

          {parents.length === 0 && (
            <p style={{ color:C.muted, fontSize:12, textAlign:"center", marginTop:20 }}>
              Henüz veli eklenmemiş.
            </p>
          )}
          {parents.map(p => (
            <div key={p.id} style={{
              display:"flex", alignItems:"center", background:C.card, borderRadius:11,
              padding:"10px 13px", marginBottom:8, border:`1px solid ${C.border}`,
            }}>
              <div style={{
                width:36, height:36, borderRadius:10, background:`${C.yg}22`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, marginRight:10,
              }}>👨‍👧</div>
              <div style={{ flex:1 }}>
                <div style={{ color:C.text, fontSize:13, fontWeight:800 }}>{p.name}</div>
                <div style={{ color:C.muted, fontSize:10 }}>
                  {p.linkedStudentIds?.map(id => students.find(s => s.id === id)?.name)
                    .filter(Boolean).join(", ") || "Sporcu bağlı değil"}
                </div>
              </div>
              <button onClick={() => setParents(prev => prev.filter(x => x.id !== p.id))} style={{
                background:`${C.red}22`, color:C.red, border:"none", borderRadius:6,
                padding:"4px 8px", fontSize:11, cursor:"pointer", fontWeight:800,
              }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════
          TAKVİM SEKMESİ
      ════════════════════════════════════════ */}
      {settingsTab === "calendar" && isCoach && (
        <div>
          {/* PDF Yükleme */}
          <div style={{ background:C.card, borderRadius:12, padding:13, marginBottom:12, border:`1px solid ${C.border}` }}>
            <p style={{ color:C.muted, fontSize:9, fontWeight:800, letterSpacing:"0.08em", margin:"0 0 8px" }}>
              📅 TAKVİM BELGESİ YÜKLE (TMPF PDF)
            </p>
            <p style={{ color:C.muted, fontSize:11, margin:"0 0 10px" }}>
              Resmi TMPF faaliyet takvimi PDF'ini yükleyerek takvimi otomatik güncelle.
            </p>
            <label style={{
              display:"block", background:`${C.blue}22`, border:`1px dashed ${C.blue}`,
              borderRadius:9, padding:"12px", textAlign:"center", cursor:"pointer", marginBottom:8,
            }}>
              <span style={{ color:C.blue, fontSize:13, fontWeight:800 }}>📂 PDF Seç</span>
              <input type="file" accept=".pdf" onChange={handleCalPDF} style={{ display:"none" }}/>
            </label>
            {calImportMsg && (
              <p style={{
                color: calImportMsg.startsWith("✅") ? C.green
                     : calImportMsg.startsWith("❌") ? C.red : C.gold,
                fontSize:12, margin:0, textAlign:"center", fontWeight:700,
              }}>{calImportMsg}</p>
            )}
          </div>

          {/* item 25: Dinamik filtreler — yıl + ay isimleri */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginBottom:6 }}>
            <div>
              <span style={S.lbl}>KATEGORİ</span>
              <select value={calFilter.cat} onChange={e=>setCalFilter(p=>({...p,cat:e.target.value}))} style={S.inp}>
                <option value="">Tümü</option>
                {["U9","U11","U13","U15","U17"].map(g=><option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <span style={S.lbl}>TÜR</span>
              <select value={calFilter.type} onChange={e=>setCalFilter(p=>({...p,type:e.target.value}))} style={S.inp}>
                <option value="">Tümü</option>
                {Object.entries(typeLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <span style={S.lbl}>YIL</span>
              <select value={calFilter.year} onChange={e=>setCalFilter(p=>({...p,year:e.target.value,month:""}))} style={S.inp}>
                <option value="">Tümü</option>
                {calYears.map(y=><option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <span style={S.lbl}>AY</span>
              <select value={calFilter.month} onChange={e=>setCalFilter(p=>({...p,month:e.target.value}))} style={S.inp}>
                <option value="">Tümü</option>
                {calMonths.filter(m=>!calFilter.year||m.startsWith(calFilter.year)).map(m=>{
                  const mo=parseInt(m.slice(5));
                  return <option key={m} value={m}>{CAL_MONTH_NAMES[mo]} {m.slice(0,4)}</option>;
                })}
              </select>
            </div>
          </div>

          <p style={{ color:C.muted, fontSize:10, margin:"0 0 8px" }}>{filteredCal.length} etkinlik</p>
          {filteredCal.length === 0 && (
            <p style={{ color:C.muted, fontSize:12, textAlign:"center", marginTop:16 }}>Etkinlik bulunamadı.</p>
          )}
          {/* item 23: kompakt liste + düzenle/sil onay */}
          {filteredCal.map(ev => (
            <div key={ev.id} style={{
              background:C.card, borderRadius:9, padding:"8px 11px",
              marginBottom:6, border:`1px solid ${C.border}`,
            }}>
              {editCalId === ev.id ? (
                <div>
                  <input value={editCalData.name||""} onChange={e=>setEditCalData(p=>({...p,name:e.target.value}))}
                    placeholder="Etkinlik adı" style={{...S.inp,marginBottom:5,fontSize:12}}/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:5}}>
                    <input value={editCalData.location||""} onChange={e=>setEditCalData(p=>({...p,location:e.target.value}))}
                      placeholder="Konum" style={{...S.inp,fontSize:12}}/>
                    <input value={editCalData.startDate||""} onChange={e=>setEditCalData(p=>({...p,startDate:e.target.value}))}
                      type="date" style={{...S.inp,fontSize:12}}/>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>{setCalendar(p=>p.map(x=>x.id===ev.id?{...x,...editCalData}:x));setEditCalId(null);}}
                      style={{...S.btn(C.green),flex:1,padding:8,borderRadius:8,fontSize:12}}>✅ Kaydet</button>
                    <button onClick={()=>setEditCalId(null)}
                      style={{...S.btn(C.surface,C.muted),padding:8,borderRadius:8,fontSize:12}}>İptal</button>
                  </div>
                </div>
              ) : (
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    {/* item 24: tür adı büyük harf */}
                    <div style={{display:"flex",gap:4,alignItems:"center",marginBottom:2}}>
                      <span style={{...S.chip(C.muted),background:C.surface,fontSize:8,textTransform:"uppercase"}}>
                        {typeLabels[ev.type]||ev.type}
                      </span>
                      {ev.categories.slice(0,3).map(cat=>(
                        <span key={cat} style={{...S.chip(cat==="U9"?C.green:cat==="U11"?C.blue:cat==="U13"?C.yg:C.gold),fontSize:7,padding:"1px 4px"}}>{cat}</span>
                      ))}
                    </div>
                    {/* item 6: fmtDate */}
                    <div style={{ color:C.text, fontSize:11, fontWeight:800 }}>{ev.name}</div>
                    <div style={{ color:C.muted, fontSize:9 }}>📍{ev.location} · {fmtDate(ev.startDate)}{ev.endDate!==ev.startDate?` – ${fmtDate(ev.endDate)}`:""}</div>
                  </div>
                  <div style={{display:"flex",gap:5,flexShrink:0}}>
                    <button onClick={()=>{setEditCalId(ev.id);setEditCalData({name:ev.name,location:ev.location,startDate:ev.startDate,endDate:ev.endDate});}}
                      style={{background:`${C.blue}22`,color:C.blue,border:"none",borderRadius:6,padding:"4px 7px",fontSize:10,cursor:"pointer",fontWeight:800}}>✏️</button>
                    <button onClick={()=>{if(!window.confirm||window.confirm("Etkinlik silinsin mi?"))setCalendar(p=>p.filter(x=>x.id!==ev.id));}}
                      style={{background:`${C.red}22`,color:C.red,border:"none",borderRadius:6,padding:"4px 7px",fontSize:10,cursor:"pointer",fontWeight:800}}>🗑️</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════
          YARIŞMA SONUÇLARI SEKMESİ
      ════════════════════════════════════════ */}
      {settingsTab === "results" && isCoach && (
        <div>
          <div style={{ background:C.card, borderRadius:12, padding:13, marginBottom:12, border:`1px solid ${C.border}` }}>
            <p style={{ color:C.muted, fontSize:9, fontWeight:800, letterSpacing:"0.08em", margin:"0 0 8px" }}>
              📊 YARIŞMA SONUÇ BELGESİ YÜKLE
            </p>
            <p style={{ color:C.muted, fontSize:11, margin:"0 0 6px" }}>
              Resmi TMPF sonuç PDF'ini yükle. Sistem kulübünüzün sporcularını otomatik tanıyarak sonuçları ekler.
            </p>
            <p style={{ color:`${C.gold}cc`, fontSize:10, margin:"0 0 10px", fontStyle:"italic" }}>
              📌 Tanınan kulüpler: ENVA ÇEVRE SPOR KULÜBÜ · TOHUM ANKARA SK
            </p>
            <label style={{
              display:"block", background:`${C.green}22`, border:`1px dashed ${C.green}`,
              borderRadius:9, padding:"14px", textAlign:"center", cursor:"pointer", marginBottom:8,
            }}>
              <div style={{ fontSize:28, marginBottom:4 }}>📂</div>
              <span style={{ color:C.green, fontSize:14, fontWeight:800 }}>PDF Sonuç Belgesi Seç</span>
              <div style={{ color:C.muted, fontSize:10, marginTop:3 }}>Gelişim Yarışları, Ulusal vb.</div>
              <input type="file" accept=".pdf" onChange={handleCompPDF} style={{ display:"none" }}/>
            </label>
            {importMsg && (
              <div style={{
                background: importMsg.startsWith("✅") ? `${C.green}22`
                          : importMsg.startsWith("❌") ? `${C.red}22` : `${C.gold}22`,
                borderRadius:9, padding:"10px 12px", textAlign:"center",
              }}>
                <p style={{
                  color: importMsg.startsWith("✅") ? C.green
                       : importMsg.startsWith("❌") ? C.red : C.gold,
                  fontSize:13, margin:0, fontWeight:700,
                }}>{importMsg}</p>
              </div>
            )}
          </div>

          {/* Mevcut yarışma sonuçları */}
          <p style={{ color:C.muted, fontSize:9, fontWeight:800, letterSpacing:"0.08em", margin:"0 0 8px" }}>
            MEVCUT YARIŞMA SONUÇLARI ({comps.length} kayıt)
          </p>
          {[...new Set(comps.map(c => c.name + "|" + c.date + "|" + c.location))]
            .slice(0, 30)
            .map(key => {
              const [name, date, loc] = key.split("|");
              const cnt = comps.filter(c => c.name === name && c.date === date).length;
              const isEditing = editCompKey === key;
              return (
                <div key={key} style={{
                  background:C.card, borderRadius:10, padding:"9px 13px",
                  marginBottom:7, border:`1px solid ${C.border}`,
                }}>
                  {isEditing ? (
                    <div>
                      <input value={editCompData.name} onChange={e=>setEditCompData(p=>({...p,name:e.target.value}))}
                        placeholder="Yarışma adı" style={{...S.inp,marginBottom:5,fontSize:12}}/>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:5}}>
                        <input value={editCompData.location} onChange={e=>setEditCompData(p=>({...p,location:e.target.value}))}
                          placeholder="Konum" style={{...S.inp,fontSize:12}}/>
                        <input value={editCompData.date} onChange={e=>setEditCompData(p=>({...p,date:e.target.value}))}
                          type="date" style={{...S.inp,fontSize:12}}/>
                      </div>
                      <div style={{display:"flex",gap:6}}>
                        <button onClick={()=>{
                          setComps(p=>p.map(c=>c.name===name&&c.date===date&&c.location===loc
                            ?{...c,name:editCompData.name,location:editCompData.location,date:editCompData.date}:c));
                          setEditCompKey(null);
                        }} style={{...S.btn(C.green),flex:1,padding:8,borderRadius:8,fontSize:12}}>✅ Kaydet</button>
                        <button onClick={()=>setEditCompKey(null)}
                          style={{...S.btn(C.surface,C.muted),padding:8,borderRadius:8,fontSize:12}}>İptal</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <div style={{ flex:1 }}>
                        <div style={{ color:C.text, fontSize:12, fontWeight:700 }}>{name}</div>
                        <div style={{ color:C.muted, fontSize:10 }}>📍{loc} · {fmtDate(date)} · {cnt} kayıt</div>
                      </div>
                      <button onClick={()=>{setEditCompKey(key);setEditCompData({name,location:loc,date});}}
                        style={{background:`${C.blue}22`,color:C.blue,border:"none",borderRadius:6,padding:"4px 7px",fontSize:10,cursor:"pointer",fontWeight:800}}>✏️</button>
                      <button onClick={()=>{if(!window.confirm||window.confirm(`"${name}" yarışmasının ${cnt} kaydı silinsin mi?`))setComps(p=>p.filter(c=>!(c.name===name&&c.date===date&&c.location===loc)));}} style={{
                        background:`${C.red}22`, color:C.red, border:"none", borderRadius:6,
                        padding:"4px 8px", fontSize:11, cursor:"pointer", fontWeight:800,
                      }}>🗑️</button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* ════════════════════════════════════════
          HAKKINDA SEKMESİ
      ════════════════════════════════════════ */}
      {settingsTab === "about" && (
        <div>
          <div style={{
            background:C.card, borderRadius:14, padding:18, marginBottom:12,
            border:`1px solid ${C.border}`, textAlign:"center",
          }}>
            <div style={{ fontSize:44, marginBottom:8 }}>🏅</div>
            <div style={{ color:C.text, fontSize:20, fontWeight:900, letterSpacing:"-0.5px", marginBottom:4 }}>
              <span style={{ color:"#4ddd6a" }}>EN</span>
              <span style={{ color:"#6bbfff" }}>VA</span>
            </div>
            <div style={{ color:C.muted, fontSize:11, letterSpacing:"0.12em", fontWeight:800, marginBottom:14 }}>
              PENTATLON SPORCU TAKİBİ
            </div>
            {[
              ["Geliştirici", "Fatih Hasdemir"],
              ["Kulüpler",    "ENVA ÇEVRE SPOR KULÜBÜ · TOHUM ANKARA SK"],
              ["Platform",    "PWA (Progressive Web App)"],
              ["Versiyon",    "2026.1"],
            ].map(([k, v]) => (
              <div key={k} style={{
                display:"flex", justifyContent:"space-between",
                padding:"8px 0", borderBottom:`1px solid ${C.border}`,
              }}>
                <span style={{ color:C.muted, fontSize:11 }}>{k}</span>
                <span style={{ color:C.text, fontSize:11, fontWeight:700, textAlign:"right", maxWidth:"60%" }}>{v}</span>
              </div>
            ))}
          </div>
          <button onClick={() => {
            localStorage.removeItem("enva_session");
            setAuthUser(null);
            setPage("login");
          }} style={{
            ...S.btn(`${C.red}cc`),
            width:"100%", padding:13, borderRadius:11, fontSize:14, marginTop:4,
          }}>🚪 Çıkış Yap</button>
        </div>
      )}
    </div>
  );
}
