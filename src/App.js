// ─────────────────────────────────────────────
//  ENVAApp.jsx  —  Kök bileşen (state + shell)
//
//  Bağımlılıklar:
//    constants.js  →  C, COMP_TYPES, INIT_*, LS_KEY
//    utils.js      →  fmtTime, toSec, todayStr, pad
//    PageDash      →  (henüz bölünmedi — inline kalıyor)
//    PageEntryView →  (henüz bölünmedi — inline kalıyor)
//    PageAthletes  →  (henüz bölünmedi — inline kalıyor)
//    PageReports   →  (henüz bölünmedi — inline kalıyor)
//    PageSettings  →  PageSettings.jsx'ten import
//    PageAbout     →  inline (küçük bileşen)
// ─────────────────────────────────────────────

import React, { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// ── Sabit veriler ─────────────────────────────
import {
  C as DARK_C, COMP_TYPES,
  INIT_COACHES, INIT_PARENTS, INIT_STUDENTS,
  INIT_TRAININGS, INIT_COMPS, INIT_CALENDAR,
  LS_KEY,
} from "./constants.js";

// ── Yardımcı fonksiyonlar ─────────────────────
import { fmtTime, toSec, todayStr, pad, fmtDate, makePassword } from "./utils.js";

// ── Ayrıştırılmış sayfalar ────────────────────
import PageSettings from "./PageSettings.jsx";

// ── Açık tema renk paleti ─────────────────────
const LIGHT_C = {
  bg:      "#EEF5FF",
  surface: "#E0EEFF",
  card:    "#FFFFFF",
  card2:   "#EBF3FF",
  border:  "#BDD0EE",
  green:   "#1E8830",
  greenL:  "#3DAA50",
  yg:      "#6A9000",
  blue:    "#2060A0",
  text:    "#0A1325",
  muted:   "#3D5A80",
  red:     "#C04040",
  gold:    "#946800",
};

// ─────────────────────────────────────────────
//  localStorage oturum yardımcısı
// ─────────────────────────────────────────────
const savedSession = (() => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "null"); }
  catch { return null; }
})();

// ─────────────────────────────────────────────
//  Renk sabitleri (diğer sayfalarda da kullanılır)
// ─────────────────────────────────────────────
const AGE_COLORS = { U9: DARK_C.green, U11: DARK_C.blue, U13: DARK_C.yg, U15: DARK_C.gold };
const PALETTE    = ["#5DC46A","#3B90D5","#A8D240","#F0C040","#FF7043","#C084FC","#FF8C57","#4DD9AC"];

// ─────────────────────────────────────────────
//  Ortak stil fabrikası  (S nesnesini üretir)
//  Kullanım: const S = makeStyles(C);
// ─────────────────────────────────────────────
export const makeStyles = (colors) => ({
  inp: {
    width: "100%", padding: "11px 12px",
    background: colors.card2, border: `1px solid ${colors.border}`,
    borderRadius: 10, color: colors.text, fontSize: 14,
    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  },
  lbl: {
    color: colors.muted, fontSize: 10, fontWeight: 800,
    display: "block", marginBottom: 5, letterSpacing: "0.09em",
  },
  btn: (bg, fg = "#fff") => ({
    padding: "11px 16px", borderRadius: 10, border: "none",
    cursor: "pointer", background: bg, color: fg,
    fontWeight: 800, fontSize: 13, fontFamily: "inherit",
  }),
  chip: (color) => ({
    fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 5,
    background: `${color}25`, color, letterSpacing: "0.04em",
  }),
});

// ─────────────────────────────────────────────
//  ENVAApp  —  Ana bileşen
// ─────────────────────────────────────────────
export default function ENVAApp() {

  // ── Tema state ───────────────────────────────
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("enva_dark") !== "false"; } catch { return true; }
  });
  const C = darkMode ? DARK_C : LIGHT_C;

  // ── Global state ────────────────────────────
  const [coaches,   setCoaches]   = useState(INIT_COACHES);
  const [parents,   setParents]   = useState(INIT_PARENTS);
  const [students,  setStudents]  = useState(INIT_STUDENTS);
  const [trainings, setTrainings] = useState(INIT_TRAININGS);
  const [comps,     setComps]     = useState(INIT_COMPS);
  const [calendar,  setCalendar]  = useState(INIT_CALENDAR);

  // Kaydedilmiş oturum varsa otomatik giriş
  const [authUser, setAuthUser] = useState(() => {
    if (!savedSession) return null;
    const all = [...INIT_COACHES, ...INIT_PARENTS];
    return all.find(x =>
      x.username === savedSession.username &&
      x.password === savedSession.password
    ) || null;
  });

  const [page, setPage] = useState(() => {
    if (!savedSession) return "login";
    const all = [...INIT_COACHES, ...INIT_PARENTS];
    return all.find(x =>
      x.username === savedSession.username &&
      x.password === savedSession.password
    ) ? "dash" : "login";
  });

  // ── Login state ──────────────────────────────
  const [lRole,     setLRole]     = useState("coach");
  const [lUser,     setLUser]     = useState("");
  const [lPass,     setLPass]     = useState("");
  const [lErr,      setLErr]      = useState("");
  const [lRemember, setLRemember] = useState(true);

  // ── Antrenman giriş state ────────────────────
  const [tSt,    setTSt]    = useState("");
  const [tDisc,  setTDisc]  = useState("swim");
  const [tDate,  setTDate]  = useState(todayStr());
  const [tMin,   setTMin]   = useState("");
  const [tSec,   setTSec]   = useState("");
  const [tMs,    setTMs]    = useState("0");
  const [tSaved, setTSaved] = useState(false);

  // ── Yarışma giriş state ──────────────────────

  // ── Sporcular state ──────────────────────────
  const [sSort,    setSSort]    = useState("name");
  const [sSortDir, setSSortDir] = useState({ swim:"asc", run:"asc", name:"asc" });

  // ── Raporlar state ───────────────────────────
  const [rSt,        setRSt]        = useState("");
  const [rDisc,      setRDisc]      = useState("swim");
  const [rMode,      setRMode]      = useState("training");
  const [rView,      setRView]      = useState("individual");
  const [rGrpGender, setRGrpGender] = useState("ALL");

  // ── Kullanıcı yönetimi state ─────────────────

  // ── Türetilmiş değerler ──────────────────────
  const isCoach = authUser?.role === "coach";
  const visibleStudents = isCoach
    ? students
    : students.filter(s => (authUser?.linkedStudentIds || []).includes(s.id));

  // ── Stil nesnesi ─────────────────────────────
  const S = makeStyles(C);

  // ── İşlevler ─────────────────────────────────
  const doLogin = () => {
    const uInput = lUser.trim().toLowerCase();
    const pInput = lPass.trim();
    const all = [...coaches, ...parents];
    const u = all.find(x => x.username.toLowerCase() === uInput && x.password === pInput);
    if (u) {
      setAuthUser(u);
      setLErr("");
      setPage("dash");
      try {
        if (lRemember) {
          localStorage.setItem(LS_KEY, JSON.stringify({ username: u.username, password: u.password }));
        } else {
          localStorage.removeItem(LS_KEY);
        }
      } catch(e) {}
    } else {
      setLErr("Kullanıcı adı veya şifre hatalı.");
    }
  };

  const saveTraining = () => {
    if (!tSt || !tMin || !tSec) return;
    setTrainings(prev => [...prev, {
      id: Date.now(), studentId: +tSt, date: tDate, discipline: tDisc,
      minutes: +tMin || 0, seconds: +tSec || 0,
      milliseconds: tDisc === "swim" ? (+tMs || 0) : 0,
    }]);
    setTMin(""); setTSec(""); setTMs("0");
    setTSaved(true);
    setTimeout(() => setTSaved(false), 2000);
  };

  const getBest = (studentId, discipline, src) => {
    const arr = (src === "comp" ? comps : trainings)
      .filter(p => p.studentId === studentId && p.discipline === discipline);
    if (!arr.length) return null;
    return arr.reduce((b, p) =>
      toSec(p.minutes, p.seconds, p.milliseconds || 0) <
      toSec(b.minutes, b.seconds, b.milliseconds || 0) ? p : b
    );
  };

  // ── Reusable bileşen: TimeRow ─────────────────
  const TimeRow = ({ disc, min, setMin, sec, setSec, ms, setMs, accent }) => (
    <div style={{ display:"flex", alignItems:"flex-start", gap:5 }}>
      {[
        { v:min, fn:setMin, l:"DAK", mx:59 },
        ":",
        { v:sec, fn:setSec, l:"SN", mx:59 },
        ...(disc === "swim" ? [".", { v:ms, fn:setMs, l:"SALİSE", mx:99 }] : []),
      ].map((f, i) =>
        typeof f === "string"
          ? <span key={i} style={{ color:C.muted, fontSize:24, paddingTop:10, fontWeight:300, flexShrink:0 }}>{f}</span>
          : <div key={i} style={{ flex:1, textAlign:"center" }}>
              <input
                type="number" min={0} max={f.mx} value={f.v}
                onChange={e => f.fn(e.target.value)} placeholder="00"
                style={{ ...S.inp, padding:"10px 2px", fontSize:24, fontWeight:900,
                  textAlign:"center", border:`2px solid ${accent}44` }}
              />
              <div style={{ color:C.muted, fontSize:9, marginTop:3, letterSpacing:"0.07em" }}>{f.l}</div>
            </div>
      )}
    </div>
  );

  // ── Navigasyon tanımı ─────────────────────────
  const NAV = [
    { id:"dash",     e:"🏠", l:"Ana" },
    { id:"entry",    e:"⏱️", l:"Antrenman" },
    { id:"athletes", e:"👥", l:"Sporcular" },
    { id:"reports",  e:"📊", l:"Analiz" },
    { id:"settings", e:"⚙️", l:"Ayarlar" },
  ];

  // ─────────────────────────────────────────────
  //  LOGIN SAYFASI
  // ─────────────────────────────────────────────
  if (page === "login") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:"24px 20px", fontFamily:"'Nunito',sans-serif",
      background:"linear-gradient(155deg, #0a2e1f 0%, #0d3d2e 25%, #0a2840 55%, #071e38 100%)",
      position:"relative", overflow:"hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap" rel="stylesheet"/>
      {/* Dekoratif bloblar */}
      <div style={{ position:"absolute", top:-80, left:-80, width:320, height:320, borderRadius:"50%",
        background:"radial-gradient(circle, #2E9B4033 0%, transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:-60, right:-60, width:280, height:280, borderRadius:"50%",
        background:"radial-gradient(circle, #3B90D533 0%, transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:"40%", right:-40, width:180, height:180, borderRadius:"50%",
        background:"radial-gradient(circle, #A8D24022 0%, transparent 70%)", pointerEvents:"none" }}/>

      <div style={{ textAlign:"center", marginBottom:32, position:"relative", zIndex:1 }}>
        <div style={{ fontSize:42, fontWeight:900, letterSpacing:"-2px", marginBottom:4 }}>
          <span style={{ color:"#4ddd6a" }}>EN</span>
          <span style={{ color:"#6bbfff" }}>VA</span>
        </div>
        <div style={{ color:"rgba(255,255,255,0.5)", fontSize:11, letterSpacing:"0.14em", fontWeight:800 }}>
          PENTATLON SPORCU TAKİBİ
        </div>
      </div>

      <div style={{
        width:"100%", maxWidth:400, background:"rgba(255,255,255,0.08)",
        borderRadius:20, padding:28, backdropFilter:"blur(16px)",
        border:"1px solid rgba(255,255,255,0.12)", position:"relative", zIndex:1,
      }}>
        {/* Rol seçimi */}
        <div style={{ display:"flex", gap:8, marginBottom:20,
          background:"rgba(0,0,0,0.2)", borderRadius:14, padding:4 }}>
          {[["coach","🎯","Antrenör"],["parent","👨‍👧","Veli"]].map(([r, img, l]) => (
            <button key={r} onClick={() => setLRole(r)} style={{
              flex:1, padding:"11px 8px", borderRadius:11, border:"none", cursor:"pointer",
              fontFamily:"inherit", fontWeight:800, fontSize:14,
              display:"flex", alignItems:"center", justifyContent:"center", gap:9,
              background: lRole === r ? "rgba(255,255,255,0.18)" : "transparent",
              color:       lRole === r ? "#fff" : "rgba(255,255,255,0.45)",
              transition:"all .25s",
              boxShadow:   lRole === r ? "0 2px 12px rgba(0,0,0,0.25)" : "none",
              backdropFilter: lRole === r ? "blur(8px)" : "none",
            }}>
              <span style={{ fontSize:22 }}>{img}</span>
              {l}
            </button>
          ))}
        </div>

        {/* Kullanıcı adı */}
        <div style={{ marginBottom:12 }}>
          <span style={{ color:"rgba(255,255,255,0.6)", fontSize:11, fontWeight:800,
            display:"block", marginBottom:6, letterSpacing:"0.09em" }}>KULLANICI ADI</span>
          <input
            value={lUser} onChange={e => setLUser(e.target.value.trim())}
            placeholder={lRole === "coach" ? "ahmet.antrenor" : "fatma.yilmaz"}
            style={{ ...S.inp, fontSize:16, padding:"13px 14px",
              background:"rgba(0,0,0,0.25)", border:"1px solid rgba(255,255,255,0.15)", color:"#fff" }}
          />
        </div>

        {/* Şifre */}
        <div style={{ marginBottom:10 }}>
          <span style={{ color:"rgba(255,255,255,0.6)", fontSize:11, fontWeight:800,
            display:"block", marginBottom:6, letterSpacing:"0.09em" }}>ŞİFRE</span>
          <input
            type="password" value={lPass} onChange={e => setLPass(e.target.value)}
            placeholder="••••••••"
            style={{ ...S.inp, fontSize:16, padding:"13px 14px",
              background:"rgba(0,0,0,0.25)", border:"1px solid rgba(255,255,255,0.15)", color:"#fff" }}
            onKeyDown={e => e.key === "Enter" && doLogin()}
          />
        </div>

        {lErr && <p style={{ color:"#ff8080", fontSize:13, margin:"4px 0 10px" }}>⚠ {lErr}</p>}

        <label style={{
          display:"flex", alignItems:"center", gap:8, marginBottom:14,
          cursor:"pointer", userSelect:"none",
        }}>
          <input
            type="checkbox"
            checked={lRemember}
            onChange={e => setLRemember(e.target.checked)}
            style={{ width:16, height:16, accentColor:"#4ddd6a", cursor:"pointer" }}
          />
          <span style={{ color:"rgba(255,255,255,0.65)", fontSize:13, fontWeight:700 }}>
            Beni hatırla
          </span>
        </label>

        <button onClick={doLogin} style={{
          ...S.btn(`linear-gradient(135deg,${C.green},${C.blue})`),
          width:"100%", padding:"15px", borderRadius:12, fontSize:17, marginTop:2,
          boxShadow:`0 4px 20px ${C.green}55`,
        }}>Giriş Yap →</button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────
  //  SAYFA YÖNLENDİRMESİ
  //  NOT: PageDash, PageEntryView, PageAthletes, PageReports
  //  ileride ayrı dosyalara taşınacak; şimdilik orijinal
  //  ENVAApp dosyasından kopyalanarak buraya yapıştırılmalı.
  //  PageSettings ayrı dosyadan import ediliyor.
  // ─────────────────────────────────────────────

  // Paylaşılan props nesnesi — tüm sayfalara iletilir
  const sharedProps = {
    // veri
    coaches, setCoaches,
    parents, setParents,
    students, setStudents,
    trainings, setTrainings,
    comps, setComps,
    calendar, setCalendar,
    // türetilmiş
    authUser, isCoach, visibleStudents,
    // navigasyon
    setPage,
    // logout
    doLogin, saveTraining, getBest,
    // yardımcılar
    C, S, COMP_TYPES, fmtTime, fmtDate, makePassword, toSec, todayStr, pad, AGE_COLORS, PALETTE,
    // reusable bileşenler
    TimeRow,
    // antrenman state
    tSt, setTSt, tDisc, setTDisc, tDate, setTDate,
    tMin, setTMin, tSec, setTSec, tMs, setTMs, tSaved,
    // sporcular state
    sSort, setSSort, sSortDir, setSSortDir,
    // raporlar state
    rSt, setRSt, rDisc, setRDisc, rMode, setRMode,
    rView, setRView, rGrpGender, setRGrpGender,
  };

  /**
   * İLERİ ADIM:
   * Aşağıdaki 4 satırı PageDash vb. import'larıyla değiştirin.
   * Şimdilik yer tutucu olarak boş div döndürülüyor —
   * gerçek JSX için orijinal ENVAApp'ten kopyalayın.
   */
  const renderPage = () => {
    if (page === "dash")     return <PageDash     {...sharedProps}/>;
    if (page === "entry")    return <PageEntryView {...sharedProps}/>;
    if (page === "athletes") return <PageAthletes  {...sharedProps}/>;
    if (page === "reports")  return <PageReports   {...sharedProps}/>;
    if (page === "settings") return (
      <PageSettings
        coaches={coaches}         setCoaches={setCoaches}
        parents={parents}         setParents={setParents}
        students={students}       setStudents={setStudents}
        comps={comps}             setComps={setComps}
        calendar={calendar}       setCalendar={setCalendar}
        authUser={authUser}       setAuthUser={setAuthUser}
        isCoach={isCoach}
        setPage={setPage}
        C={C} S={S}
      />
    );
    if (page === "about")    return <PageAbout {...sharedProps}/>;
    return null;
  };

  // ─────────────────────────────────────────────
  //  ANA SHELL (Header + renderPage + BottomNav)
  // ─────────────────────────────────────────────
  return (
    <div style={{
      background: darkMode
        ? "linear-gradient(155deg, #0a2e1f 0%, #0d3d2e 25%, #0a2840 55%, #071e38 100%)"
        : "linear-gradient(155deg, #e8f4ff 0%, #d6eaff 30%, #e0f0ff 60%, #cce3ff 100%)",
      minHeight:"100vh",
      fontFamily:"'Nunito',sans-serif",
      maxWidth:480, margin:"0 auto", paddingBottom:68,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap" rel="stylesheet"/>

      {/* ── Sticky Header ── */}
      <div style={{
        padding:"10px 14px 8px",
        borderBottom:`1px solid ${C.border}`,
        position:"sticky", top:0,
        background:`${C.bg}F2`, backdropFilter:"blur(10px)", zIndex:50,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {/* Logo — tıklayınca ana sayfa */}
          <button onClick={() => setPage("dash")} style={{
            background:"none", border:"none", cursor:"pointer", padding:0,
            display:"flex", alignItems:"center", gap:0,
          }}>
            <span style={{ color:C.green, fontSize:18, fontWeight:900, letterSpacing:"-0.5px" }}>EN</span>
            <span style={{ color:C.blue,  fontSize:18, fontWeight:900, letterSpacing:"-0.5px", marginLeft:-2 }}>VA</span>
          </button>
          {/* item 26: tema toggle */}
          <button onClick={() => {
            const next = !darkMode;
            setDarkMode(next);
            try { localStorage.setItem("enva_dark", String(next)); } catch {}
          }} style={{
            background:"none", border:"none", cursor:"pointer",
            fontSize:16, padding:"4px 6px", borderRadius:8,
            color:C.muted, lineHeight:1,
          }} title={darkMode ? "Açık temaya geç" : "Koyu temaya geç"}>
            {darkMode ? "☀️" : "🌙"}
          </button>

          {/* Profil alanı — tıklayınca about/çıkış sayfası */}
          <button onClick={() => setPage("about")} style={{
            marginLeft:"auto", background:"none", border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", gap:9, padding:"3px 6px",
            borderRadius:10,
          }}>
            {authUser?.photo ? (
              <img src={authUser.photo} alt="profil"
                style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", border:`2px solid ${C.border}` }}/>
            ) : (
              <div style={{
                width:32, height:32, borderRadius:"50%",
                background:C.card2, border:`2px solid ${C.border}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:18,
              }}>
                {authUser?.role === "coach" ? "🎯" : "👨‍👧"}
              </div>
            )}
            <div style={{ textAlign:"left" }}>
              <div style={{ color:C.text, fontSize:11, fontWeight:800, lineHeight:1.2 }}>
                {authUser?.name?.split(" ")[0]}
              </div>
              <div style={{ color:C.muted, fontSize:9, fontWeight:700, lineHeight:1.2 }}>
                {authUser?.role === "coach" ? "Antrenör" : "Veli"} · Çıkış →
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ── Sayfa içeriği ── */}
      <div style={{ paddingTop:11 }}>{renderPage()}</div>

      {/* ── Alt navigasyon çubuğu ── */}
      <div style={{
        position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:480,
        background:C.surface, borderTop:`1px solid ${C.border}`,
        display:"flex", zIndex:100,
      }}>
        {NAV.map(item => (
          <button key={item.id} onClick={() => setPage(item.id)} style={{
            flex:1, padding:"7px 0 9px", background:"none", border:"none", cursor:"pointer",
            display:"flex", flexDirection:"column", alignItems:"center", gap:2,
            fontFamily:"inherit", position:"relative",
          }}>
            <span style={{ fontSize:16, filter: page === item.id ? "none" : "grayscale(1) opacity(.4)" }}>
              {item.e}
            </span>
            <span style={{
              fontSize:9, fontWeight:900, letterSpacing:"0.04em",
              color: page === item.id ? C.green : C.muted,
            }}>{item.l}</span>
            {page === item.id && (
              <div style={{
                position:"absolute", bottom:0, width:20, height:2,
                borderRadius:"2px 2px 0 0", background:C.green,
              }}/>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  PageAbout  —  Küçük bileşen, burada kalabilir
//  ya da ayrı PageAbout.jsx'e taşınabilir.
// ─────────────────────────────────────────────
function PageAbout({ C, S, authUser, setAuthUser, setPage }) {
  return (
    <div style={{ padding:"0 14px 14px" }}>
      <div style={{
        background:C.card, borderRadius:16, padding:22, marginBottom:14,
        border:`1px solid ${C.border}`, textAlign:"center",
      }}>
        <div style={{ fontSize:36, fontWeight:900, letterSpacing:"-1px", marginBottom:4 }}>
          <span style={{ color:"#4ddd6a" }}>EN</span>
          <span style={{ color:"#6bbfff" }}>VA</span>
        </div>
        <div style={{ color:C.muted, fontSize:11, letterSpacing:"0.14em", fontWeight:800, marginBottom:18 }}>
          PENTATLON SPORCU TAKİBİ
        </div>
        {[
          ["Geliştirici", "Fatih Hasdemir"],
          ["Kulüpler",    "ENVA ÇEVRE SPOR KULÜBÜ · TOHUM ANKARA SK"],
          ["Antrenör",    "Arap Metin Yıldız"],
          ["Platform",    "PWA (Progressive Web App)"],
          ["Versiyon",    "2026.2 — Nisan 2026"],
        ].map(([k, v]) => (
          <div key={k} style={{
            display:"flex", justifyContent:"space-between",
            padding:"9px 0", borderBottom:`1px solid ${C.border}`,
          }}>
            <span style={{ color:C.muted, fontSize:12 }}>{k}</span>
            <span style={{ color:C.text, fontSize:12, fontWeight:700, textAlign:"right", maxWidth:"58%" }}>{v}</span>
          </div>
        ))}
      </div>
      <button onClick={() => {
        localStorage.removeItem("enva_session");
        setAuthUser(null);
        setPage("login");
      }} style={{
        ...S.btn(`${C.red}cc`),
        width:"100%", padding:13, borderRadius:11, fontSize:14,
      }}>🚪 Çıkış Yap</button>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Bağımsız sayfa bileşenleri ayrı dosyalarda.
//  src/ altına kopyalandıktan sonra buradan import edilebilir:
//    import PageDash      from "./PageDash";
//    import PageEntry     from "./PageEntry";
//    import PageAthletes  from "./PageAthletes";
//    import PageReports   from "./PageReports";
//
//  Şu an ENVAApp.jsx tek dosya olarak çalışıyor;
//  ayrı dosyaları kullanmak için yukarıdaki import'ları
//  açıp aşağıdaki inline tanımları silin.
// ─────────────────────────────────────────────

// ── PageDash inline (DashCalendar dahil) ─────────────────────────────────
function DashCalendar({calendar, todayD, C, S, COMP_TYPES}) {
  const [calCat,   setCalCat]   = React.useState("");
  const [calMonth, setCalMonth] = React.useState("");
  const months = [...new Set(calendar.map(e=>e.startDate.slice(0,7)))].sort();
  const filtered = calendar.filter(e=>{
    if(calCat && !e.categories.includes(calCat)) return false;
    if(calMonth && !e.startDate.startsWith(calMonth)) return false;
    return true;
  }).sort((a,b)=>a.startDate.localeCompare(b.startDate));
  const ageColors2 = {U9:C.green,U11:C.blue,U13:C.yg,U15:C.gold,U17:"#C084FC"};
  const typeColors = {gelisim:C.green,ulusal:C.blue,triathle:C.yg,tetratlon:C.gold,laserrun:"#FF7043",biathle:"#FF8C57",diger:C.muted};
  const typeLabels = {gelisim:"Gelişim",ulusal:"Ulusal",triathle:"Triathle",tetratlon:"Tetratlon",laserrun:"Laser Run",biathle:"Biathle",diger:"Diğer"};
  return (
    <div style={{background:C.card,borderRadius:12,marginBottom:10,border:`1px solid ${C.border}`,overflow:"hidden"}}>
      <div style={{padding:"10px 12px 8px",borderBottom:`1px solid ${C.border}`}}>
        <p style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.08em",margin:"0 0 8px"}}>📅 YARIIŞMA TAKVİMİ</p>
        <div style={{display:"flex",gap:6}}>
          <div style={{flex:1}}>
            <select value={calCat} onChange={e=>setCalCat(e.target.value)}
              style={{...S.inp,padding:"6px 8px",fontSize:10}}>
              <option value="">Tüm Kategoriler</option>
              {["U9","U11","U13","U15","U17"].map(g=><option key={g}>{g}</option>)}
            </select>
          </div>
          <div style={{flex:1}}>
            <select value={calMonth} onChange={e=>setCalMonth(e.target.value)}
              style={{...S.inp,padding:"6px 8px",fontSize:10}}>
              <option value="">Tüm Aylar</option>
              {months.map(m=>{
                const [y,mo]=m.split("-");
                const mNames=["","Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
                return <option key={m} value={m}>{mNames[+mo]} {y}</option>;
              })}
            </select>
          </div>
        </div>
      </div>
      {filtered.length===0&&(
        <p style={{color:C.muted,fontSize:11,padding:"12px",textAlign:"center",margin:0}}>Etkinlik bulunamadı.</p>
      )}
      {filtered.slice(0,8).map((ev,i)=>{
        const daysLeft = Math.ceil((new Date(ev.startDate)-new Date(todayD))/86400000);
        const isPast = daysLeft < 0;
        const tc = typeColors[ev.type]||C.muted;
        return (
          <div key={ev.id} style={{display:"flex",alignItems:"center",padding:"8px 12px",
            borderTop:i>0?`1px solid ${C.border}`:"none",opacity:isPast?0.45:1}}>
            <div style={{width:40,textAlign:"center",flexShrink:0,marginRight:10}}>
              <div style={{color:isPast?C.muted:C.gold,fontSize:11,fontWeight:900,lineHeight:1}}>
                {ev.startDate.slice(8)}.{ev.startDate.slice(5,7)}
              </div>
              {!isPast&&daysLeft<=30&&(
                <div style={{background:daysLeft===0?C.green:daysLeft<=7?C.red:C.gold,
                  color:"#fff",borderRadius:4,fontSize:8,fontWeight:900,marginTop:2,padding:"1px 3px"}}>
                  {daysLeft===0?"BUGÜN":`${daysLeft}g`}
                </div>
              )}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{color:C.text,fontSize:11,fontWeight:800,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ev.name}</div>
              <div style={{color:C.muted,fontSize:9}}>📍{ev.location}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0,marginLeft:6}}>
              <span style={{background:`${tc}22`,color:tc,borderRadius:5,fontSize:8,padding:"2px 5px",fontWeight:800}}>{typeLabels[ev.type]||ev.type}</span>
              <div style={{display:"flex",gap:2}}>
                {ev.categories.slice(0,3).map(cat=>(
                  <span key={cat} style={{background:`${ageColors2[cat]||C.muted}22`,color:ageColors2[cat]||C.muted,
                    borderRadius:4,fontSize:7,padding:"1px 4px",fontWeight:800}}>{cat}</span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
      {filtered.length>8&&(
        <div style={{padding:"7px 12px",textAlign:"center",borderTop:`1px solid ${C.border}`}}>
          <span style={{color:C.muted,fontSize:10}}>+{filtered.length-8} etkinlik daha (Ayarlar → Takvim)</span>
        </div>
      )}
    </div>
  );
}

function PageDash(props) {
  const {
    students, trainings, comps, calendar, visibleStudents,
    authUser, getBest, fmtTime, fmtDate, toSec,
    C, S, COMP_TYPES,
  } = props;
  const [expandedAge,    setExpandedAge]    = React.useState(null);
  const [selectedStudent,setSelectedStudent]= React.useState(null);
  const todayD = new Date().toISOString().slice(0,10);

  const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0,0,0,0);
  const swimPBs = visibleStudents.filter(s=>{
    const all=trainings.filter(p=>p.studentId===s.id&&p.discipline==="swim");
    if(all.length<2) return false;
    const recent=all.filter(p=>new Date(p.date)>=thisMonth);
    if(!recent.length) return false;
    const best=all.reduce((b,p)=>toSec(p.minutes,p.seconds,p.milliseconds||0)<toSec(b.minutes,b.seconds,b.milliseconds||0)?p:b);
    return recent.some(p=>p.id===best.id);
  }).length;
  const runPBs = visibleStudents.filter(s=>{
    const all=trainings.filter(p=>p.studentId===s.id&&p.discipline==="run");
    if(all.length<2) return false;
    const recent=all.filter(p=>new Date(p.date)>=thisMonth);
    if(!recent.length) return false;
    const best=all.reduce((b,p)=>toSec(p.minutes,p.seconds)<toSec(b.minutes,b.seconds)?p:b);
    return recent.some(p=>p.id===best.id);
  }).length;
  const totalPBs = swimPBs + runPBs;

  const upcomingComps = comps.filter(c=>c.date>=todayD).sort((a,b)=>a.date.localeCompare(b.date));
  const nextComp = upcomingComps[0];
  const daysToNext = nextComp ? Math.ceil((new Date(nextComp.date)-new Date(todayD))/(86400000)) : null;
  const activeCount = visibleStudents.filter(s=>trainings.some(t=>t.studentId===s.id&&new Date(t.date)>=thisMonth)).length;
  const swimCount = trainings.filter(t=>t.discipline==="swim").length;
  const runCount  = trainings.filter(t=>t.discipline==="run").length;
  const totalT    = swimCount+runCount||1;
  const maleCount   = visibleStudents.filter(s=>s.gender==="E").length;
  const femaleCount = visibleStudents.filter(s=>s.gender==="K").length;
  const activityMap = {};
  trainings.forEach(t=>{ if(new Date(t.date)>=thisMonth){ activityMap[t.studentId]=(activityMap[t.studentId]||0)+1; } });
  const top3 = visibleStudents.map(s=>({...s,cnt:activityMap[s.id]||0})).filter(s=>s.cnt>0).sort((a,b)=>b.cnt-a.cnt).slice(0,3);
  const ageColors2 = {U9:C.green,U11:C.blue,U13:C.yg,U15:C.gold};

  if(selectedStudent){
    const s=selectedStudent;
    const bSw=getBest(s.id,"swim","training"); const bRn=getBest(s.id,"run","training");
    const bSwC=getBest(s.id,"swim","comp");    const bRnC=getBest(s.id,"run","comp");
    const myTrainings=[...trainings].filter(t=>t.studentId===s.id).sort((a,b)=>b.date.localeCompare(a.date));
    const myComps=[...comps].filter(c=>c.studentId===s.id).sort((a,b)=>b.date.localeCompare(a.date));
    const ac=ageColors2[s.ageGroup]||C.green;
    return (
      <div style={{padding:"0 14px 14px"}}>
        <button onClick={()=>setSelectedStudent(null)} style={{
          display:"flex",alignItems:"center",gap:6,background:"none",border:"none",
          cursor:"pointer",color:C.muted,fontFamily:"inherit",fontWeight:800,fontSize:13,marginBottom:14,padding:0,
        }}>← Ana Sayfa</button>
        <div style={{background:C.card,borderRadius:14,padding:14,marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:52,height:52,borderRadius:14,background:s.gender==="E"?`${C.blue}22`:`${C.green}22`,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>
              {s.gender==="E"?"👦":"👧"}
            </div>
            <div>
              <div style={{color:C.text,fontSize:16,fontWeight:900}}>{s.name}</div>
              <div style={{display:"flex",gap:6,marginTop:4}}>
                <span style={{...S.chip(ac),fontSize:10}}>{s.ageGroup}</span>
                <span style={{...S.chip(C.muted),background:C.surface,fontSize:10}}>{s.birthYear||"?"}</span>
                <span style={{...S.chip(s.gender==="E"?C.blue:C.green),fontSize:10}}>{s.gender==="E"?"Erkek":"Kız"}</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          {[
            {l:"Ant. En İyi 🏊",v:bSw?fmtTime("swim",bSw.minutes,bSw.seconds,bSw.milliseconds||0):"—",c:C.blue},
            {l:"Ant. En İyi 🏃",v:bRn?fmtTime("run",bRn.minutes,bRn.seconds):"—",c:C.green},
            {l:"Yar. En İyi 🏊",v:bSwC?fmtTime("swim",bSwC.minutes,bSwC.seconds,bSwC.milliseconds||0):"—",c:C.gold},
            {l:"Yar. En İyi 🏃",v:bRnC?fmtTime("run",bRnC.minutes,bRnC.seconds):"—",c:C.gold},
          ].map(x=>(
            <div key={x.l} style={{background:C.card,borderRadius:11,padding:"11px 10px",border:`1px solid ${C.border}`,textAlign:"center"}}>
              <div style={{color:C.muted,fontSize:10,marginBottom:4}}>{x.l}</div>
              <div style={{color:x.c,fontSize:15,fontWeight:900}}>{x.v}</div>
            </div>
          ))}
        </div>
        <div style={{background:C.card,borderRadius:12,padding:13,marginBottom:12,border:`1px solid ${C.border}`}}>
          <p style={{color:C.muted,fontSize:10,fontWeight:800,letterSpacing:"0.08em",margin:"0 0 8px"}}>SON ANTRENMANLAR ({myTrainings.length})</p>
          {myTrainings.length===0&&<p style={{color:C.muted,fontSize:12,margin:0}}>Kayıt yok.</p>}
          {myTrainings.slice(0,6).map(t=>(
            <div key={t.id} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{color:C.muted,fontSize:12}}>{fmtDate(t.date)} {t.discipline==="swim"?"🏊":"🏃"}</span>
              <span style={{color:t.discipline==="swim"?C.blue:C.green,fontWeight:800,fontSize:12}}>
                {fmtTime(t.discipline,t.minutes,t.seconds,t.milliseconds||0)}
              </span>
            </div>
          ))}
        </div>
        <div style={{background:C.card,borderRadius:12,padding:13,border:`1px solid ${C.border}`}}>
          <p style={{color:C.muted,fontSize:10,fontWeight:800,letterSpacing:"0.08em",margin:"0 0 8px"}}>SON YARIŞMALAR ({myComps.length})</p>
          {myComps.length===0&&<p style={{color:C.muted,fontSize:12,margin:0}}>Kayıt yok.</p>}
          {myComps.slice(0,4).map(c=>(
            <div key={c.id} style={{padding:"7px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{color:C.gold,fontSize:12,fontWeight:700}}>{c.name}</span>
                <span style={{color:c.discipline==="swim"?C.blue:C.green,fontWeight:800,fontSize:12}}>
                  {fmtTime(c.discipline,c.minutes,c.seconds,c.milliseconds||0)}
                </span>
              </div>
              <div style={{color:C.muted,fontSize:10}}>📍{c.location} · {fmtDate(c.date)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:"0 14px 14px"}}>
      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:42,height:42,borderRadius:12,background:C.card,
            border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
            🎽
          </div>
          <div>
            <p style={{color:C.muted,fontSize:10,margin:0,letterSpacing:"0.08em"}}>HOŞ GELDİN</p>
            <h2 style={{color:C.text,fontSize:17,fontWeight:900,margin:"1px 0 0"}}>{authUser.name}</h2>
          </div>
        </div>
      </div>

      {/* 4 STAT TILES */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:10}}>
        {[
          {l:"Sporcu",    v:visibleStudents.length, emoji:"🏅", c:C.green},
          {l:"Antrenman", v:trainings.length,        emoji:"⏱️",  c:C.blue},
          {l:"PB/Ay",     v:totalPBs,               emoji:"⭐",  c:C.gold},
          {l:"Aktif/Ay",  v:activeCount,            emoji:"🔥",  c:"#FF7043"},
        ].map(s=>(
          <div key={s.l} style={{background:C.card,borderRadius:11,padding:"10px 4px",
            border:`1px solid ${C.border}`,textAlign:"center"}}>
            <div style={{fontSize:14,marginBottom:2}}>{s.emoji}</div>
            <div style={{color:s.c,fontSize:19,fontWeight:900,lineHeight:1}}>{s.v}</div>
            <div style={{color:C.muted,fontSize:8,marginTop:2}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* BU AY */}
      <div style={{background:C.card,borderRadius:12,padding:"10px 12px",marginBottom:10,border:`1px solid ${C.border}`}}>
        <p style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.08em",margin:"0 0 9px"}}>BU AY</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {[
            {label:"Yaklaşan Yarışma",
             value:daysToNext===null?"—":daysToNext===0?"Bugün!":`${daysToNext} gün`,
             sub:nextComp?nextComp.name:"—",emoji:"🏆",c:C.gold},
            {label:"Aktif Sporcu",value:`${activeCount}/${visibleStudents.length}`,sub:"Bu ay antrenman yaptı",emoji:"🔥",c:"#FF7043"},
            {label:"Kişisel Rekor",value:totalPBs,sub:"Bu ay PB kıran",emoji:"⭐",c:C.green},
            {label:"Toplam Antrenman",
             value:trainings.filter(t=>new Date(t.date).getTime()>Date.now()-7*86400000).length,
             sub:"Bu haftaki kayıt",emoji:"⏱️",c:C.blue},
          ].map(x=>(
            <div key={x.label} style={{background:C.surface,borderRadius:9,padding:"9px 10px"}}>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
                <span style={{fontSize:13}}>{x.emoji}</span>
                <span style={{color:C.muted,fontSize:9,fontWeight:800}}>{x.label.toUpperCase()}</span>
              </div>
              <div style={{color:x.c,fontSize:17,fontWeight:900,lineHeight:1}}>{x.value}</div>
              {x.sub&&<div style={{color:C.muted,fontSize:9,marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{x.sub}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* item 4: U11/U13 yaklaşan yarışma vurgusu */}
      {(()=>{
        const u1113Cal = calendar
          .filter(ev => ev.categories && (ev.categories.includes("U11") || ev.categories.includes("U13")))
          .filter(ev => ev.startDate >= todayD)
          .sort((a,b) => a.startDate.localeCompare(b.startDate));
        const nxt = u1113Cal[0];
        if(!nxt) return null;
        const dLeft = Math.ceil((new Date(nxt.startDate) - new Date(todayD)) / 86400000);
        const urgColor = dLeft === 0 ? C.green : dLeft <= 7 ? C.red : C.gold;
        return (
          <div style={{background:`${urgColor}18`,border:`1px solid ${urgColor}55`,borderRadius:12,padding:"10px 13px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:22,flexShrink:0}}>🏆</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{color:urgColor,fontSize:9,fontWeight:900,letterSpacing:"0.1em",marginBottom:2}}>YAKLAŞAN U11/U13 YARIŞMASI</div>
              <div style={{color:C.text,fontSize:12,fontWeight:800,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{nxt.name}</div>
              <div style={{color:C.muted,fontSize:9}}>📍{nxt.location} · {nxt.startDate.slice(8)}.{nxt.startDate.slice(5,7)}.{nxt.startDate.slice(0,4)}</div>
            </div>
            <div style={{textAlign:"center",flexShrink:0}}>
              <div style={{color:urgColor,fontSize:18,fontWeight:900,lineHeight:1}}>{dLeft===0?"BUGÜN!":dLeft}</div>
              {dLeft>0&&<div style={{color:C.muted,fontSize:8,fontWeight:800}}>GÜN</div>}
            </div>
          </div>
        );
      })()}

      {/* TAKVİM */}
      <DashCalendar calendar={calendar} todayD={todayD} C={C} S={S} COMP_TYPES={COMP_TYPES}/>

      {/* CİNSİYET + BRANŞ */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:10}}>
        <div style={{background:C.card,borderRadius:12,padding:"10px 12px",border:`1px solid ${C.border}`}}>
          <p style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.08em",margin:"0 0 8px"}}>CİNSİYET DAĞILIMI</p>
          {[{label:"👦 Erkek",count:maleCount,color:C.blue},{label:"👧 Kız",count:femaleCount,color:C.green}].map(({label,count,color})=>(
            <div key={label} style={{marginBottom:5}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                <span style={{color,fontSize:11,fontWeight:800}}>{label}</span>
                <span style={{color:C.muted,fontSize:10}}>{count}</span>
              </div>
              <div style={{background:C.surface,borderRadius:3,height:5}}>
                <div style={{width:`${(count/(maleCount+femaleCount||1))*100}%`,height:5,borderRadius:3,background:color}}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:C.card,borderRadius:12,padding:"10px 12px",border:`1px solid ${C.border}`}}>
          <p style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.08em",margin:"0 0 8px"}}>BRANŞ AKTİVİTESİ</p>
          {[{label:"🏊 Yüzme",count:swimCount,color:C.blue},{label:"🏃 Koşma",count:runCount,color:C.green}].map(({label,count,color})=>(
            <div key={label} style={{marginBottom:5}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                <span style={{color,fontSize:11,fontWeight:800}}>{label}</span>
                <span style={{color:C.muted,fontSize:10}}>{count}</span>
              </div>
              <div style={{background:C.surface,borderRadius:3,height:5}}>
                <div style={{width:`${(count/totalT)*100}%`,height:5,borderRadius:3,background:color}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* YAŞ GRUBU ACCORDION */}
      <div style={{background:C.card,borderRadius:12,marginBottom:10,border:`1px solid ${C.border}`,overflow:"hidden"}}>
        <p style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.08em",margin:"10px 12px 8px"}}>YAŞ GRUBU DAĞILIMI</p>
        {[{g:"U9",c:C.green},{g:"U11",c:C.blue},{g:"U13",c:C.yg},{g:"U15",c:C.gold}].map(({g,c},gi)=>{
          const groupStudents=visibleStudents.filter(s=>s.ageGroup===g);
          const pct=visibleStudents.length?(groupStudents.length/visibleStudents.length)*100:0;
          const isExpanded=expandedAge===g;
          return (
            <div key={g} style={{borderTop:gi>0?`1px solid ${C.border}`:"none"}}>
              <div onClick={()=>setExpandedAge(isExpanded?null:g)}
                style={{display:"flex",alignItems:"center",padding:"8px 12px",cursor:"pointer",
                  background:isExpanded?`${c}11`:"transparent"}}>
                <span style={{...S.chip(c),fontSize:9,marginRight:8,minWidth:28,textAlign:"center"}}>{g}</span>
                <div style={{flex:1,height:5,background:C.surface,borderRadius:3,marginRight:10,overflow:"hidden"}}>
                  <div style={{width:`${pct}%`,height:5,borderRadius:3,background:c}}/>
                </div>
                <span style={{color:C.muted,fontSize:11,marginRight:8}}>{groupStudents.length}</span>
                <span style={{color:c,fontSize:12}}>{isExpanded?"▲":"▼"}</span>
              </div>
              {isExpanded&&(
                <div style={{background:`${c}08`,borderTop:`1px solid ${c}22`}}>
                  {groupStudents.length===0
                    ? <p style={{color:C.muted,fontSize:11,padding:"8px 14px",margin:0}}>Bu grupta sporcu yok.</p>
                    : groupStudents.map((s,si)=>{
                      const bSw=getBest(s.id,"swim","training");
                      const bRn=getBest(s.id,"run","training");
                      return (
                        <div key={s.id} onClick={()=>setSelectedStudent(s)}
                          style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                            padding:"7px 14px",cursor:"pointer",
                            borderBottom:si<groupStudents.length-1?`1px solid ${c}22`:"none"}}>
                          <div style={{display:"flex",alignItems:"center",gap:7}}>
                            <span style={{fontSize:13}}>{s.gender==="E"?"👦":"👧"}</span>
                            <span style={{color:C.text,fontSize:12,fontWeight:700}}>{s.name}</span>
                            <span style={{color:C.muted,fontSize:10}}>{s.birthYear||""}</span>
                          </div>
                          <div style={{display:"flex",gap:8,alignItems:"center"}}>
                            <span style={{color:C.blue,fontSize:10,fontWeight:800}}>🏊{bSw?fmtTime("swim",bSw.minutes,bSw.seconds,bSw.milliseconds||0):"—"}</span>
                            <span style={{color:C.green,fontSize:10,fontWeight:800}}>🏃{bRn?fmtTime("run",bRn.minutes,bRn.seconds):"—"}</span>
                            <span style={{color:c,fontSize:10}}>›</span>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* TOP 3 */}
      {top3.length>0&&(
        <div style={{background:C.card,borderRadius:12,marginBottom:10,border:`1px solid ${C.border}`}}>
          <p style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.08em",margin:"10px 12px 8px"}}>EN AKTİF SPORCULAR (BU AY)</p>
          {top3.map((s,i)=>{
            const medals=["🥇","🥈","🥉"];
            return (
              <div key={s.id} style={{display:"flex",alignItems:"center",padding:"7px 12px",borderTop:i>0?`1px solid ${C.border}`:"none"}}>
                <span style={{fontSize:16,marginRight:9}}>{medals[i]}</span>
                <span style={{fontSize:12,marginRight:7}}>{s.gender==="E"?"👦":"👧"}</span>
                <span style={{color:C.text,fontSize:12,fontWeight:800,flex:1}}>{s.name}</span>
                <span style={{...S.chip(C.green),fontSize:9}}>{s.cnt} ant.</span>
              </div>
            );
          })}
        </div>
      )}

      {/* SON AKTİVİTE */}
      <div style={{background:C.card,borderRadius:12,padding:12,border:`1px solid ${C.border}`}}>
        <p style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.08em",margin:"0 0 8px"}}>SON AKTİVİTE</p>
        {[...trainings.map(t=>({...t,_src:"t"})),...comps.map(c=>({...c,_src:"c"}))]
          .sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5).map(p=>{
          const s=students.find(x=>x.id===p.studentId);
          const isC=p._src==="c";
          return (
            <div key={`${p._src}${p.id}`} style={{display:"flex",alignItems:"center",
              justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <div style={{width:26,height:26,borderRadius:7,
                  background:isC?`${C.gold}22`:p.discipline==="swim"?`${C.blue}22`:`${C.green}22`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>
                  {isC?"🏅":p.discipline==="swim"?"🏊":"🏃"}
                </div>
                <div>
                  <div style={{color:C.text,fontSize:11,fontWeight:800}}>{s?.name||"?"}</div>
                  <div style={{color:C.muted,fontSize:9}}>{isC?p.name:fmtDate(p.date)}</div>
                </div>
              </div>
              <span style={{fontWeight:900,fontSize:11,color:isC?C.gold:p.discipline==="swim"?C.blue:C.green}}>
                {fmtTime(p.discipline,p.minutes,p.seconds,p.milliseconds||0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── PageEntry inline ──────────────────────────────────────────────────────
function PageEntryView(props) {
  const {tDisc,setTDisc,tSt,setTSt,tDate,setTDate,tMin,setTMin,tSec,setTSec,
    tMs,setTMs,tSaved,saveTraining,visibleStudents,trainings,setTrainings,fmtTime,fmtDate,C,S,TimeRow}=props;
  const [editId, setEditId] = React.useState(null);
  const [editMin,setEditMin]=React.useState("");
  const [editSec,setEditSec]=React.useState("");
  const [editMs, setEditMs] =React.useState("0");

  const startEdit=(p)=>{setEditId(p.id);setEditMin(String(p.minutes));setEditSec(String(p.seconds));setEditMs(String(p.milliseconds||0));};
  const saveEdit=(p)=>{setTrainings(prev=>prev.map(x=>x.id===p.id?{...x,minutes:+editMin||0,seconds:+editSec||0,milliseconds:tDisc==="swim"?(+editMs||0):0}:x));setEditId(null);};
  const delEntry=(id)=>{if(!window.confirm||window.confirm("Bu antrenman kaydı silinsin mi?"))setTrainings(prev=>prev.filter(x=>x.id!==id));};

  const myRecs=tSt?trainings.filter(p=>p.studentId===+tSt&&p.discipline===tDisc).sort((a,b)=>b.date.localeCompare(a.date)):[];

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
        <select value={tSt} onChange={e=>{setTSt(e.target.value);setEditId(null);}} style={S.inp}>
          <option value="">— Sporcu Seç —</option>
          {visibleStudents.map(s=><option key={s.id} value={s.id}>{s.name} ({s.ageGroup}·{s.gender})</option>)}
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

      {/* Kayıt listesi — düzenle/sil */}
      {tSt&&(
        <div style={{background:C.card,borderRadius:11,marginTop:13,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          <p style={{color:C.muted,fontSize:10,fontWeight:800,margin:"10px 12px 8px",letterSpacing:"0.08em"}}>
            SON KAYITLAR — {visibleStudents.find(s=>s.id===+tSt)?.name}
          </p>
          {myRecs.length===0&&<p style={{color:C.muted,fontSize:12,padding:"0 12px 10px",margin:0}}>Henüz antrenman kaydı yok.</p>}
          {myRecs.slice(0,8).map((p,pi)=>(
            <div key={p.id} style={{padding:"7px 12px",borderTop:pi>0?`1px solid ${C.border}`:"none"}}>
              {editId===p.id ? (
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{color:C.muted,fontSize:10,flexShrink:0}}>{fmtDate(p.date)}</span>
                  {["swim","run"].includes(tDisc)&&[
                    {v:editMin,fn:setEditMin,l:"DAK"},
                    {sep:":"},
                    {v:editSec,fn:setEditSec,l:"SN"},
                    ...(tDisc==="swim"?[{sep:"."},{v:editMs,fn:setEditMs,l:"MS"}]:[]),
                  ].map((f,i)=>f.sep
                    ?<span key={i} style={{color:C.muted}}>{f.sep}</span>
                    :<input key={i} type="number" value={f.v} onChange={e=>f.fn(e.target.value)}
                      style={{...S.inp,width:44,padding:"4px 3px",fontSize:13,textAlign:"center"}} placeholder="00"/>
                  )}
                  <button onClick={()=>saveEdit(p)} style={{...S.btn(C.green),padding:"5px 10px",fontSize:11,borderRadius:7}}>✅</button>
                  <button onClick={()=>setEditId(null)} style={{...S.btn(C.surface,C.muted),padding:"5px 8px",fontSize:11,borderRadius:7}}>✕</button>
                </div>
              ) : (
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{color:C.muted,fontSize:12}}>{fmtDate(p.date)}</span>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{color:tDisc==="swim"?C.blue:C.green,fontWeight:900,fontSize:12}}>
                      {fmtTime(tDisc,p.minutes,p.seconds,p.milliseconds||0)}
                    </span>
                    <button onClick={()=>startEdit(p)} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,padding:"2px 4px"}}>✏️</button>
                    <button onClick={()=>delEntry(p.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,padding:"2px 4px"}}>🗑️</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PageAthletes inline ───────────────────────────────────────────────────
function PageAthletes(props) {
  const {setStudents,comps,trainings,visibleStudents,isCoach,
    sSort,setSSort,sSortDir,setSSortDir,getBest,fmtTime,fmtDate,toSec,AGE_COLORS:ageColors,C,S}=props;
  const [selStudent,setSelStudent]=React.useState(null);
  const [editMode,setEditMode]=React.useState(false);
  const [editData,setEditData]=React.useState({});
  const [dataFilter,setDataFilter]=React.useState("comp");
  const [ageFilter,setAgeFilter]=React.useState("ALL");
  const [gendFilter,setGendFilter]=React.useState("ALL");
  const [nameFilter,setNameFilter]=React.useState("");
  const [compFilter,setCompFilter]=React.useState("ALL");

  // item 7: yarışma isim/konum listesi
  const compOptions=[...new Set(comps.map(c=>c.name+"||"+c.location))].sort();


  const toggleSort=(field)=>{if(sSort===field){setSSortDir(d=>({...d,[field]:d[field]==="asc"?"desc":"asc"}));}else{setSSort(field);}};
  const dir=sSortDir[sSort]==="asc"?1:-1;

  // item 8: belirgin cinsiyet ikonu
  const gIcon=(gender)=>gender==="E"
    ?<div style={{width:"100%",height:"100%",background:`${C.blue}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:C.blue,borderRadius:8}}>♂</div>
    :<div style={{width:"100%",height:"100%",background:`${C.green}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:C.green,borderRadius:8}}>♀</div>;

  const filtered=visibleStudents
    .filter(s=>{
      if(ageFilter!=="ALL"&&s.ageGroup!==ageFilter)return false;
      if(gendFilter!=="ALL"&&s.gender!==gendFilter)return false;
      if(nameFilter&&!s.name.toLowerCase().includes(nameFilter.toLowerCase()))return false;
      if(compFilter!=="ALL"){const[cn,cl]=compFilter.split("||");if(!comps.some(c=>c.studentId===s.id&&c.name===cn&&c.location===cl))return false;}
      return true;
    })
    .map(s=>({...s,
      _sw:getBest(s.id,"swim",dataFilter==="comp"?"comp":"training"),
      _rn:getBest(s.id,"run",dataFilter==="comp"?"comp":"training"),
    }))
    .sort((a,b)=>{
      if(sSort==="swim"){const as=a._sw?toSec(a._sw.minutes,a._sw.seconds,a._sw.milliseconds||0):9999;const bs=b._sw?toSec(b._sw.minutes,b._sw.seconds,b._sw.milliseconds||0):9999;return(as-bs)*dir;}
      if(sSort==="run"){const ar=a._rn?toSec(a._rn.minutes,a._rn.seconds):9999;const br=b._rn?toSec(b._rn.minutes,b._rn.seconds):9999;return(ar-br)*dir;}
      return a.name.localeCompare(b.name,"tr")*dir;
    });

  const SortBtn=({field,label,color})=>{
    const active=sSort===field; const d=sSortDir[field];
    return(<button onClick={()=>toggleSort(field)} style={{padding:"5px 9px",borderRadius:6,border:`1px solid ${active?color:C.border}`,cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:800,background:active?`${color}22`:C.card,color:active?color:C.muted,display:"flex",alignItems:"center",gap:3}}>
      {label}<span style={{fontSize:9}}>{active?(d==="asc"?"↑":"↓"):"↕"}</span>
    </button>);
  };

  // ── SPORCU DETAY ─────────────────────────────────────────────────────────
  if(selStudent){
    const s=selStudent; const ac=ageColors[s.ageGroup]||C.green;
    const myComps=comps.filter(c=>c.studentId===s.id).sort((a,b)=>b.date.localeCompare(a.date));
    const myTrains=trainings.filter(t=>t.studentId===s.id).sort((a,b)=>b.date.localeCompare(a.date));
    const bSwT=getBest(s.id,"swim","training"); const bRnT=getBest(s.id,"run","training");
    const bSwC=getBest(s.id,"swim","comp");     const bRnC=getBest(s.id,"run","comp");
    const compEvents=[...new Set(myComps.map(c=>c.name+"|"+c.date+"|"+c.location))];
    const handlePhoto=(e)=>{
      const file=e.target.files[0]; if(!file)return;
      const reader=new FileReader();
      reader.onload=(ev)=>{setStudents(prev=>prev.map(x=>x.id===s.id?{...x,photo:ev.target.result}:x));setSelStudent(prev=>({...prev,photo:ev.target.result}));};
      reader.readAsDataURL(file);
    };
    // item 11: sil sadece altta
    const doDelete=()=>{
      if(window.confirm&&!window.confirm("Bu sporcu ve tüm kayıtları silinsin mi?"))return;
      setStudents(prev=>prev.filter(x=>x.id!==s.id)); setSelStudent(null);
    };
    // item 13: mini analiz için veri
    const swRecs=[...trainings].filter(t=>t.studentId===s.id&&t.discipline==="swim")
      .sort((a,b)=>a.date.localeCompare(b.date)).slice(-10)
      .map(t=>({date:fmtDate(t.date).slice(0,5),v:parseFloat(toSec(t.minutes,t.seconds,t.milliseconds||0).toFixed(2)),l:fmtTime("swim",t.minutes,t.seconds,t.milliseconds||0)}));
    const rnRecs=[...trainings].filter(t=>t.studentId===s.id&&t.discipline==="run")
      .sort((a,b)=>a.date.localeCompare(b.date)).slice(-10)
      .map(t=>({date:fmtDate(t.date).slice(0,5),v:parseFloat(toSec(t.minutes,t.seconds).toFixed(2)),l:fmtTime("run",t.minutes,t.seconds)}));
    const chartData=(()=>{
      const dates=[...new Set([...swRecs.map(r=>r.date),...rnRecs.map(r=>r.date)])].sort();
      return dates.map(d=>({date:d,sw:swRecs.find(r=>r.date===d)?.v,sl:swRecs.find(r=>r.date===d)?.l,rn:rnRecs.find(r=>r.date===d)?.v,rl:rnRecs.find(r=>r.date===d)?.l}));
    })();

    return(
      <div style={{padding:"0 14px 14px"}}>
        <button onClick={()=>{setSelStudent(null);setEditMode(false);}} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:C.muted,fontFamily:"inherit",fontWeight:800,fontSize:13,marginBottom:14,padding:0}}>← Sporcular</button>

        {/* Profil kartı */}
        <div style={{background:C.card,borderRadius:14,padding:14,marginBottom:12,border:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:editMode?0:0}}>
            <label style={{cursor:"pointer",flexShrink:0}}>
              <div style={{width:58,height:58,borderRadius:15,overflow:"hidden",border:`2px solid ${ac}44`,position:"relative"}}>
                {s.photo?<img src={s.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:gIcon(s.gender)}
                <div style={{position:"absolute",bottom:0,right:0,width:18,height:18,background:C.green,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,color:"#fff"}}>+</div>
              </div>
              <input type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
            </label>
            <div style={{flex:1}}>
              {editMode?(
                <div>
                  <input value={editData.name||s.name} onChange={e=>setEditData(p=>({...p,name:e.target.value}))} style={{...S.inp,marginBottom:6,fontSize:14}}/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5}}>
                    <select value={editData.gender||s.gender} onChange={e=>setEditData(p=>({...p,gender:e.target.value}))} style={S.inp}><option value="E">♂ Erkek</option><option value="K">♀ Kız</option></select>
                    <select value={editData.ageGroup||s.ageGroup} onChange={e=>setEditData(p=>({...p,ageGroup:e.target.value}))} style={S.inp}>{["U9","U11","U13","U15","U17"].map(g=><option key={g}>{g}</option>)}</select>
                    <input type="number" value={editData.birthYear||s.birthYear} onChange={e=>setEditData(p=>({...p,birthYear:+e.target.value}))} style={S.inp} placeholder="Yıl"/>
                  </div>
                </div>
              ):(
                <div>
                  <div style={{color:C.text,fontSize:17,fontWeight:900,marginBottom:5}}>{s.name}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    <span style={{...S.chip(ac),fontSize:10}}>{s.ageGroup}</span>
                    <span style={{...S.chip(s.gender==="E"?C.blue:C.green),fontSize:10}}>{s.gender==="E"?"♂ Erkek":"♀ Kız"}</span>
                    <span style={{...S.chip(C.muted),background:C.surface,fontSize:10}}>{s.birthYear}</span>
                    {s.club&&<span style={{...S.chip(C.muted),background:C.surface,fontSize:9}}>{s.club}</span>}
                  </div>
                </div>
              )}
            </div>
            {/* item 11: sadece düzenle buraya, sil en alta */}
            {isCoach&&(
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                {editMode?(
                  <>
                    <button onClick={()=>{setStudents(prev=>prev.map(x=>x.id===s.id?{...x,...editData}:x));setSelStudent(p=>({...p,...editData}));setEditMode(false);setEditData({});}} style={{...S.btn(C.green),padding:"6px 10px",fontSize:11,borderRadius:8}}>✅</button>
                    <button onClick={()=>{setEditMode(false);setEditData({});}} style={{...S.btn(C.surface,C.muted),padding:"6px 10px",fontSize:11,borderRadius:8}}>✕</button>
                  </>
                ):(
                  <button onClick={()=>{setEditMode(true);setEditData({name:s.name,gender:s.gender,ageGroup:s.ageGroup,birthYear:s.birthYear});}} style={{...S.btn(C.blue),padding:"6px 10px",fontSize:11,borderRadius:8}}>✏️ Düzenle</button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* item 12: yüzme + koşu ayrı kartta, antrenman + yarışma birlikte */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9,marginBottom:12}}>
          <div style={{background:C.card,borderRadius:11,padding:"11px 9px",border:`1px solid ${C.blue}44`,textAlign:"center"}}>
            <div style={{color:C.blue,fontSize:11,fontWeight:900,marginBottom:6}}>🏊 YÜZME</div>
            <div style={{display:"flex",justifyContent:"space-around"}}>
              <div><div style={{color:C.blue,fontSize:14,fontWeight:900}}>{bSwT?fmtTime("swim",bSwT.minutes,bSwT.seconds,bSwT.milliseconds||0):"—"}</div><div style={{color:C.muted,fontSize:8,marginTop:2}}>Antrenman</div></div>
              <div style={{width:1,background:C.border}}/>
              <div><div style={{color:C.gold,fontSize:14,fontWeight:900}}>{bSwC?fmtTime("swim",bSwC.minutes,bSwC.seconds,bSwC.milliseconds||0):"—"}</div><div style={{color:C.muted,fontSize:8,marginTop:2}}>Yarışma</div></div>
            </div>
          </div>
          <div style={{background:C.card,borderRadius:11,padding:"11px 9px",border:`1px solid ${C.green}44`,textAlign:"center"}}>
            <div style={{color:C.green,fontSize:11,fontWeight:900,marginBottom:6}}>🏃 KOŞU</div>
            <div style={{display:"flex",justifyContent:"space-around"}}>
              <div><div style={{color:C.green,fontSize:14,fontWeight:900}}>{bRnT?fmtTime("run",bRnT.minutes,bRnT.seconds):"—"}</div><div style={{color:C.muted,fontSize:8,marginTop:2}}>Antrenman</div></div>
              <div style={{width:1,background:C.border}}/>
              <div><div style={{color:C.gold,fontSize:14,fontWeight:900}}>{bRnC?fmtTime("run",bRnC.minutes,bRnC.seconds):"—"}</div><div style={{color:C.muted,fontSize:8,marginTop:2}}>Yarışma</div></div>
            </div>
          </div>
        </div>

        {/* item 13: mini analiz grafiği */}
        {chartData.length>1&&(
          <div style={{background:C.card,borderRadius:12,padding:"10px 4px 7px",marginBottom:12,border:`1px solid ${C.border}`}}>
            <p style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.08em",margin:"0 8px 8px"}}>GELİŞİM GRAFİĞİ (son 10 kayıt, sn)</p>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.surface}/>
                <XAxis dataKey="date" tick={{fill:C.muted,fontSize:8}}/>
                <YAxis tick={{fill:C.muted,fontSize:8}} domain={["auto","auto"]} width={28}/>
                <Tooltip contentStyle={{background:C.bg||C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontFamily:"inherit",fontSize:10}}
                  formatter={(v,key,{payload})=>key==="sw"?[payload.sl,"🏊 Yüzme"]:key==="rn"?[payload.rl,"🏃 Koşu"]:[v,key]}/>
                {swRecs.length>1&&<Line type="monotone" dataKey="sw" stroke={C.blue} strokeWidth={2.5} dot={{r:3,strokeWidth:0}} activeDot={{r:5}} connectNulls={false}/>}
                {rnRecs.length>1&&<Line type="monotone" dataKey="rn" stroke={C.green} strokeWidth={2.5} dot={{r:3,strokeWidth:0}} activeDot={{r:5}} connectNulls={false}/>}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Yarışma sonuçları — item 6 (fmtDate), item 15 (konum) */}
        <div style={{background:C.card,borderRadius:12,marginBottom:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          <p style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.08em",margin:"10px 13px 8px"}}>YARIŞMA SONUÇLARI ({compEvents.length})</p>
          {compEvents.length===0&&<p style={{color:C.muted,fontSize:11,padding:"8px 13px",margin:0}}>Kayıt yok.</p>}
          {compEvents.map((key,ei)=>{
            const[nm,dt,loc]=key.split("|");
            const evComps=myComps.filter(c=>c.name===nm&&c.date===dt);
            const sw=evComps.find(c=>c.discipline==="swim"); const rn=evComps.find(c=>c.discipline==="run");
            return(
              <div key={key} style={{padding:"9px 13px",borderTop:ei>0?`1px solid ${C.border}`:"none"}}>
                {/* isim */}
                <div style={{color:C.text,fontSize:12,fontWeight:800,marginBottom:5}}>{nm}</div>
                {/* item 10: yüzme/koşu süreleri ortada */}
                <div style={{display:"flex",gap:8,marginBottom:5}}>
                  {sw&&<span style={{color:C.blue,fontSize:11,fontWeight:800,background:`${C.blue}18`,padding:"3px 8px",borderRadius:6}}>🏊 {fmtTime("swim",sw.minutes,sw.seconds,sw.milliseconds||0)}</span>}
                  {rn&&<span style={{color:C.green,fontSize:11,fontWeight:800,background:`${C.green}18`,padding:"3px 8px",borderRadius:6}}>🏃 {fmtTime("run",rn.minutes,rn.seconds,rn.milliseconds||0)}</span>}
                </div>
                {/* konum + tarih + skor */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{color:C.muted,fontSize:10}}>📍{loc} · {fmtDate(dt)}</div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {sw?.score&&<span style={{...S.chip(C.gold),fontSize:10}}>{sw.score} puan</span>}
                    {sw?.rank&&<span style={{color:C.muted,fontSize:10}}>{sw.rank}/{sw.totalParticipants||"?"}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Antrenman kayıtları — item 6 (fmtDate) */}
        <div style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden",marginBottom:12}}>
          <p style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.08em",margin:"10px 13px 8px"}}>ANTRENMAN KAYITLARI ({myTrains.length})</p>
          {myTrains.length===0&&<p style={{color:C.muted,fontSize:11,padding:"8px 13px",margin:0}}>Kayıt yok.</p>}
          {myTrains.slice(0,10).map((t,ti)=>(
            <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 13px",borderTop:ti>0?`1px solid ${C.border}`:"none"}}>
              <span style={{color:C.muted,fontSize:11}}>{fmtDate(t.date)} {t.discipline==="swim"?"🏊":"🏃"}</span>
              <span style={{color:t.discipline==="swim"?C.blue:C.green,fontWeight:800,fontSize:12}}>{fmtTime(t.discipline,t.minutes,t.seconds,t.milliseconds||0)}</span>
            </div>
          ))}
        </div>

        {/* item 11: Sil butonu en altta, büyük kırmızı */}
        {isCoach&&!editMode&&(
          <button onClick={doDelete} style={{...S.btn(`${C.red}cc`),width:"100%",padding:13,borderRadius:11,fontSize:14,marginTop:4}}>
            🗑️ Sporcuyu Sil
          </button>
        )}
      </div>
    );
  }

  // ── ANA LİSTE ─────────────────────────────────────────────────────────────
  return(
    <div style={{padding:"0 14px 14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <h2 style={{color:C.text,fontSize:18,fontWeight:900,margin:0}}>Sporcular <span style={{color:C.muted,fontSize:13}}>({filtered.length})</span></h2>
      </div>

      {/* item 7: isim arama + yarışma filtresi */}
      <input value={nameFilter} onChange={e=>setNameFilter(e.target.value)} placeholder="🔍 İsimle ara..." style={{...S.inp,marginBottom:6,fontSize:13}}/>
      {compOptions.length>0&&(
        <select value={compFilter} onChange={e=>setCompFilter(e.target.value)} style={{...S.inp,marginBottom:8,fontSize:11}}>
          <option value="ALL">🏅 Tüm Yarışmalar</option>
          {compOptions.map(opt=>{const[cn,cl]=opt.split("||");return <option key={opt} value={opt}>🏆 {cn} — 📍{cl}</option>;})}
        </select>
      )}

      {/* Veri kaynağı */}
      <div style={{display:"flex",background:C.card,borderRadius:9,padding:3,marginBottom:8,gap:4}}>
        {[["comp","🏅 Yarışma",C.gold],["training","⏱️ Antrenman",C.blue]].map(([v,l,c])=>(
          <button key={v} onClick={()=>setDataFilter(v)} style={{flex:1,padding:"7px 4px",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:800,fontSize:11,background:dataFilter===v?`${c}33`:C.surface,color:dataFilter===v?c:C.muted,borderBottom:dataFilter===v?`2px solid ${c}`:"2px solid transparent"}}>{l}</button>
        ))}
      </div>

      {/* Yaş filtresi */}
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:6}}>
        {["ALL","U9","U11","U13","U15","U17"].map(g=>(
          <button key={g} onClick={()=>setAgeFilter(g)} style={{padding:"4px 9px",borderRadius:6,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:800,background:ageFilter===g?C.green:C.card,color:ageFilter===g?"#fff":C.muted}}>{g==="ALL"?"Tümü":g}</button>
        ))}
        {/* item 8: cinsiyet filtresi — belirgin ♂ ♀ */}
        <div style={{marginLeft:"auto",display:"flex",background:C.card,borderRadius:7,padding:2}}>
          {[["ALL","👤 Tümü"],["E","♂"],["K","♀"]].map(([v,l])=>(
            <button key={v} onClick={()=>setGendFilter(v)} style={{padding:"4px 9px",borderRadius:5,border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:v==="ALL"?10:14,fontWeight:900,background:gendFilter===v?C.surface:"transparent",color:gendFilter===v?C.text:C.muted}}>{l}</button>
          ))}
        </div>
      </div>

      {/* Sıralama */}
      <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center"}}>
        <span style={{color:C.muted,fontSize:10,fontWeight:800,letterSpacing:"0.07em"}}>SIRALA:</span>
        <SortBtn field="name" label="İSİM" color={C.text}/>
        <SortBtn field="swim" label="🏊 Yüzme" color={C.blue}/>
        <SortBtn field="run"  label="🏃 Koşu"  color={C.green}/>
      </div>

      {/* Tablo başlığı */}
      <div style={{display:"flex",alignItems:"center",padding:"5px 11px",background:C.surface,borderRadius:"8px 8px 0 0",border:`1px solid ${C.border}`,borderBottom:"none"}}>
        <div style={{flex:1,color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.07em"}}>SPORCU</div>
        <div style={{width:78,textAlign:"center",color:dataFilter==="comp"?C.gold:C.blue,fontSize:9,fontWeight:800}}>🏊 YÜZME</div>
        <div style={{width:70,textAlign:"center",color:dataFilter==="comp"?C.gold:C.green,fontSize:9,fontWeight:800}}>🏃 KOŞU</div>
      </div>

      <div style={{background:C.card,borderRadius:"0 0 11px 11px",border:`1px solid ${C.border}`,overflow:"hidden"}}>
        {filtered.map((s,i)=>{
          const ac=ageColors[s.ageGroup]||C.green;
          const swTime=s._sw?fmtTime("swim",s._sw.minutes,s._sw.seconds,s._sw.milliseconds||0):"—";
          const rnTime=s._rn?fmtTime("run",s._rn.minutes,s._rn.seconds):"—";
          return(
            <div key={s.id} style={{display:"flex",alignItems:"center",padding:"8px 11px",
              borderBottom:i<filtered.length-1?`1px solid ${C.border}`:"none",
              background:i%2===0?C.card:C.card2,cursor:"pointer"}} onClick={()=>setSelStudent(s)}>
              <div style={{display:"flex",alignItems:"center",gap:7,flex:1,minWidth:0}}>
                {/* item 8: belirgin cinsiyet */}
                <div style={{width:32,height:32,borderRadius:9,flexShrink:0,overflow:"hidden",border:`1.5px solid ${s.gender==="E"?C.blue:C.green}55`}}>
                  {s.photo?<img src={s.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:gIcon(s.gender)}
                </div>
                <div style={{minWidth:0}}>
                  <div style={{color:C.text,fontSize:12,fontWeight:800,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</div>
                  <div style={{display:"flex",gap:4,marginTop:2}}>
                    <span style={{...S.chip(ac),fontSize:8,padding:"1px 5px"}}>{s.ageGroup}</span>
                    <span style={{fontSize:11,color:s.gender==="E"?C.blue:C.green,fontWeight:900}}>{s.gender==="E"?"♂":"♀"}</span>
                  </div>
                </div>
              </div>
              <div style={{width:78,textAlign:"center",color:s._sw?C.blue:C.muted,fontSize:11,fontWeight:s._sw?900:400}}>{swTime}</div>
              <div style={{width:70,textAlign:"center",color:s._rn?C.green:C.muted,fontSize:11,fontWeight:s._rn?900:400}}>{rnTime}</div>
              <div style={{width:20,textAlign:"center",color:C.muted,fontSize:12}}>›</div>
            </div>
          );
        })}
        {filtered.length===0&&<p style={{color:C.muted,textAlign:"center",padding:"26px 0",fontSize:13}}>Sporcu bulunamadı.</p>}
      </div>
    </div>
  );
}


function PageReports(props) {
  const {
    rSt, rDisc, rView, rGrpGender,
    setRSt, setRDisc, setRView, setRGrpGender,
    comps, trainings, visibleStudents,
    fmtTime, fmtDate, toSec, AGE_COLORS: ageColors, C, S,
  } = props;

  // item 16: farklı renk paleti — daha belirgin
  const PALETTE = ["#4ADE80","#60A5FA","#FBBF24","#F472B6","#A78BFA","#FB923C","#34D399","#38BDF8"];

  const [chartType,   setChartType]   = React.useState("line");
  const [rGrpAge,     setRGrpAge]     = React.useState("ALL");
  const [activeStuds, setActiveStuds] = React.useState(null);
  // item 14: kaynak birleştirme — "both" seçeneği
  const [rSrcMode, setRSrcMode] = React.useState("training"); // "training"|"comp"|"both"

  // Bireysel veri — item 14: hem antrenman hem yarışma gösterebilir
  const buildSrcData = (mode) =>
    (mode === "both"
      ? [...trainings.map(p=>({...p,_type:"t"})), ...comps.map(p=>({...p,_type:"c"}))]
      : mode === "comp" ? comps.map(p=>({...p,_type:"c"})) : trainings.map(p=>({...p,_type:"t"}))
    ).filter(p => p.studentId === +rSt && p.discipline === rDisc);

  const srcData = buildSrcData(rSrcMode);
  const cd = [...srcData]
    .sort((a,b) => a.date.localeCompare(b.date))
    .map(p => ({
      date: fmtDate(p.date).slice(0,5),
      süre: parseFloat(toSec(p.minutes, p.seconds, p.milliseconds||0).toFixed(2)),
      label: fmtTime(rDisc, p.minutes, p.seconds, p.milliseconds||0),
      rank: p.rank||null, score: p.score||null,
      nm: p.name||"", loc: p.location||"",
      _type: p._type,
    }));

  const best = cd.length ? cd.reduce((b,c) => c.süre < b.süre ? c : b) : null;
  const imp  = cd.length > 1 ? (cd[0].süre - cd[cd.length-1].süre).toFixed(2) : null;
  const lc   = rDisc === "swim" ? C.blue : C.green;

  // Grup verileri
  const grpStudents = visibleStudents.filter(s => {
    if(rGrpGender !== "ALL" && s.gender !== rGrpGender) return false;
    if(rGrpAge !== "ALL" && s.ageGroup !== rGrpAge) return false;
    return true;
  });
  const displayStuds = activeStuds !== null
    ? grpStudents.filter(s => activeStuds.includes(s.id))
    : grpStudents;

  const grpSource = rSrcMode === "comp" ? comps
    : rSrcMode === "both" ? [...trainings, ...comps]
    : trainings;

  const allDates = [...new Set(
    grpSource.filter(p => displayStuds.some(s=>s.id===p.studentId) && p.discipline===rDisc)
      .map(p => p.date)
  )].sort();

  const grpChartData = allDates.map(date => {
    const row = { date: fmtDate(date).slice(0,5) };
    displayStuds.forEach(s => {
      const rec = grpSource.filter(p=>p.studentId===s.id && p.discipline===rDisc && p.date===date);
      if(rec.length){
        const b = rec.reduce((bx,p)=>toSec(p.minutes,p.seconds,p.milliseconds||0)<toSec(bx.minutes,bx.seconds,bx.milliseconds||0)?p:bx);
        row[`s${s.id}`] = parseFloat(toSec(b.minutes, b.seconds, b.milliseconds||0).toFixed(2));
        row[`l${s.id}`] = fmtTime(rDisc, b.minutes, b.seconds, b.milliseconds||0);
      }
    });
    return row;
  });

  const sortedBest = [...displayStuds].map(s => {
    const recs = grpSource.filter(p=>p.studentId===s.id && p.discipline===rDisc);
    const bst  = recs.length ? recs.reduce((b,p)=>toSec(p.minutes,p.seconds,p.milliseconds||0)<toSec(b.minutes,b.seconds,b.milliseconds||0)?p:b) : null;
    return { s, bst, secs: bst ? toSec(bst.minutes,bst.seconds,bst.milliseconds||0) : 9999 };
  }).sort((a,b) => a.secs - b.secs);

  const toggleStudent = (id) => {
    if(activeStuds === null){
      setActiveStuds(grpStudents.map(s=>s.id).filter(x=>x!==id));
    } else if(activeStuds.includes(id)){
      const next = activeStuds.filter(x=>x!==id);
      setActiveStuds(next.length === 0 ? null : next);
    } else {
      const next = [...activeStuds, id];
      setActiveStuds(next.length === grpStudents.length ? null : next);
    }
  };

  // Kaynak seçici — item 14
  const SrcTabs = () => (
    <div style={{display:"flex",gap:6,marginBottom:7}}>
      {[["training","⏱️ Antrenman",C.blue],["comp","🏅 Yarışma",C.gold],["both","🔀 İkisi",C.green]].map(([m,l,c])=>(
        <button key={m} onClick={()=>setRSrcMode(m)} style={{
          flex:1,padding:8,borderRadius:8,cursor:"pointer",fontFamily:"inherit",
          fontWeight:800,fontSize:11,border:`2px solid ${rSrcMode===m?c:C.border}`,
          background:rSrcMode===m?`${c}22`:C.card,color:rSrcMode===m?c:C.muted,
        }}>{l}</button>
      ))}
    </div>
  );

  return (
    <div style={{padding:"0 14px 14px"}}>
      <h2 style={{color:C.text,fontSize:18,fontWeight:900,marginBottom:11}}>Gelişim Analizi</h2>

      {/* Bireysel / Karşılaştırma */}
      <div style={{display:"flex",background:C.card,borderRadius:10,padding:3,marginBottom:11}}>
        {[["individual","👤 Bireysel"],["group","👥 Karşılaştırma"]].map(([v,l])=>(
          <button key={v} onClick={()=>setRView(v)} style={{
            flex:1,padding:"8px",borderRadius:8,border:"none",cursor:"pointer",
            fontFamily:"inherit",fontWeight:800,fontSize:12,
            background:rView===v?C.green:"transparent",color:rView===v?"#fff":C.muted,
          }}>{l}</button>
        ))}
      </div>

      {/* item 14: kaynak seçici (antrenman / yarışma / her ikisi) */}
      <SrcTabs/>

      {/* Branş */}
      <div style={{display:"flex",gap:6,marginBottom:11}}>
        {[["swim","🏊 Yüzme"],["run","🏃 Koşu"]].map(([d,l])=>(
          <button key={d} onClick={()=>setRDisc(d)} style={{
            flex:1,padding:8,borderRadius:8,cursor:"pointer",fontFamily:"inherit",
            fontWeight:800,fontSize:11,border:`2px solid ${rDisc===d?C.green:C.border}`,
            background:rDisc===d?`${C.green}22`:C.card,color:rDisc===d?C.green:C.muted,
          }}>{l}</button>
        ))}
      </div>

      {/* ════ BİREYSEL ════ */}
      {rView === "individual" && (<>
        <select
          value={rSt}
          onChange={e => setRSt(e.target.value)}
          style={{...S.inp, marginBottom:11}}>
          <option value="">— Sporcu Seç —</option>
          {visibleStudents.map(s=><option key={s.id} value={s.id}>{s.name} ({s.ageGroup})</option>)}
        </select>
        {rSt && cd.length > 0 ? (<>
          <div style={{background:C.card,borderRadius:12,padding:"12px 4px 7px",marginBottom:10,border:`1px solid ${C.border}`}}>
            <p style={{color:C.muted,fontSize:10,fontWeight:800,letterSpacing:"0.08em",margin:"0 8px 8px"}}>
              SÜRE GRAFİĞİ (sn)
              {rSrcMode==="both"&&<span style={{color:C.green,marginLeft:6,fontSize:9}}>— 🔀 Ant+Yar</span>}
            </p>
            <ResponsiveContainer width="100%" height={175}>
              <LineChart data={cd}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.surface}/>
                <XAxis dataKey="date" tick={{fill:C.muted,fontSize:10}}/>
                <YAxis tick={{fill:C.muted,fontSize:10}} domain={["auto","auto"]} width={34}/>
                <Tooltip
                  contentStyle={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,fontFamily:"inherit",fontSize:11}}
                  labelStyle={{color:C.text,fontWeight:800}}
                  formatter={(v,n,{payload})=>[payload.label, payload._type==="c"?"🏅 Yarışma":"⏱️ Antrenman"]}/>
                <Line type="monotone" dataKey="süre" stroke={lc} strokeWidth={3}
                  dot={({cx,cy,payload})=>(
                    <circle key={cx} cx={cx} cy={cy} r={4}
                      fill={payload._type==="c"?C.gold:lc} strokeWidth={0}/>
                  )}
                  activeDot={{r:6}}/>
              </LineChart>
            </ResponsiveContainer>
            {rSrcMode==="both"&&(
              <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:3}}>
                <span style={{color:lc,fontSize:9,fontWeight:800}}>● ⏱️ Antrenman</span>
                <span style={{color:C.gold,fontSize:9,fontWeight:800}}>● 🏅 Yarışma</span>
              </div>
            )}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:10}}>
            {[
              {l:"En İyi",  v:best?.label||"—", c:C.gold},
              {l:"Kayıt",   v:cd.length,         c:C.green},
              {l:"Gelişim", v:imp!==null?`${+imp>0?"+":"-"}${Math.abs(imp)}s`:"—", c:+imp>0?C.green:C.red||"#f87171"},
            ].map(s=>(
              <div key={s.l} style={{background:C.card,borderRadius:9,padding:"9px 6px",textAlign:"center",border:`1px solid ${C.border}`}}>
                <div style={{color:s.c,fontSize:14,fontWeight:900}}>{s.v}</div>
                <div style={{color:C.muted,fontSize:10,marginTop:2}}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Kayıt tablosu — item 15 (konum), item 6 (fmtDate) */}
          <div style={{background:C.card,borderRadius:11,border:`1px solid ${C.border}`,overflow:"hidden"}}>
            <p style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.08em",
              padding:"9px 11px 6px",margin:0,borderBottom:`1px solid ${C.border}`}}>TÜM KAYITLAR</p>
            {[...srcData].sort((a,b)=>b.date.localeCompare(a.date)).map((p,pi)=>(
              <div key={p.id||pi} style={{display:"flex",alignItems:"center",padding:"5px 11px",
                borderBottom:`1px solid ${C.border}`,background:pi%2===0?C.card:C.card2}}>
                <span style={{color:C.muted,fontSize:10,width:52,flexShrink:0}}>{fmtDate(p.date).slice(0,5)}</span>
                {/* item 15: konum */}
                {p.location&&<span style={{color:C.muted,fontSize:9,marginRight:5,flexShrink:0}}>📍{p.location}</span>}
                {p.name&&<span style={{color:C.muted,fontSize:10,flex:1,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:4}}>{p.name}</span>}
                {/* kaynak etiketi */}
                <span style={{fontSize:9,marginRight:4,flexShrink:0,color:p._type==="c"?C.gold:C.blue}}>
                  {p._type==="c"?"🏅":"⏱️"}
                </span>
                {p.rank&&<span style={{color:C.muted,fontSize:9,marginRight:5,flexShrink:0}}>{p.rank}/{p.totalParticipants||"?"}</span>}
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

      {/* ════ KARŞILAŞTIRMA ════ */}
      {rView === "group" && (<>
        <div style={{display:"flex",gap:6,marginBottom:8}}>
          <div style={{flex:1}}>
            <span style={{...S.lbl,fontSize:9}}>CİNSİYET</span>
            <div style={{display:"flex",background:C.card,borderRadius:8,padding:2}}>
              {[["ALL","Tümü"],["E","♂ Erkek"],["K","♀ Kız"]].map(([v,l])=>(
                <button key={v} onClick={()=>setRGrpGender(v)} style={{
                  flex:1,padding:"6px 4px",borderRadius:6,border:"none",cursor:"pointer",
                  fontFamily:"inherit",fontSize:10,fontWeight:800,
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

        {/* item 18: genişletilmiş grafik seçenekleri */}
        <div style={{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}}>
          <span style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.07em",alignSelf:"center",marginRight:2}}>GRAFİK:</span>
          {[["line","📈 Çizgi"],["bar","📊 Sütun"],["area","🏔️ Alan"],["scatter","⚡ En İyi"]].map(([t,l])=>(
            <button key={t} onClick={()=>setChartType(t)} style={{
              padding:"5px 10px",borderRadius:7,border:`1px solid ${chartType===t?C.green:C.border}`,
              cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:800,
              background:chartType===t?`${C.green}22`:C.card,
              color:chartType===t?C.green:C.muted,
            }}>{l}</button>
          ))}
        </div>

        {/* Sporcu seçimi */}
        <div style={{background:C.card,borderRadius:11,padding:"9px 10px",marginBottom:10,border:`1px solid ${C.border}`}}>
          <p style={{color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.07em",margin:"0 0 7px"}}>
            SPORCULAR — tıkla ekle/çıkar
          </p>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {grpStudents.map((s,i)=>{
              const active = activeStuds===null || activeStuds.includes(s.id);
              return(
                <button key={s.id} onClick={()=>toggleStudent(s.id)} style={{
                  display:"flex",alignItems:"center",gap:4,
                  padding:"4px 9px",borderRadius:7,cursor:"pointer",fontFamily:"inherit",
                  border:`1px solid ${active?PALETTE[i%PALETTE.length]:C.border}`,
                  background:active?`${PALETTE[i%PALETTE.length]}22`:C.surface,
                  opacity:active?1:0.5,
                }}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:PALETTE[i%PALETTE.length]}}/>
                  <span style={{color:active?C.text:C.muted,fontSize:10,fontWeight:800}}>{s.name}</span>
                  <span style={{...S.chip(ageColors[s.ageGroup]||C.green),fontSize:8,padding:"1px 4px"}}>{s.ageGroup}</span>
                </button>
              );
            })}
          </div>
        </div>

        {displayStuds.length > 0 && grpChartData.length > 0 ? (<>
          <div style={{background:C.card,borderRadius:12,padding:"12px 4px 7px",marginBottom:11,border:`1px solid ${C.border}`}}>
            <p style={{color:C.muted,fontSize:10,fontWeight:800,letterSpacing:"0.08em",margin:"0 8px 8px"}}>
              KARŞILAŞTIRMA — {rDisc==="swim"?"YÜZME":"KOŞU"} (sn)
            </p>
            <ResponsiveContainer width="100%" height={220}>
              {chartType==="line"?(
                <LineChart data={grpChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.surface}/>
                  <XAxis dataKey="date" tick={{fill:C.muted,fontSize:9}}/>
                  <YAxis tick={{fill:C.muted,fontSize:9}} domain={["auto","auto"]} width={34}/>
                  <Tooltip
                    contentStyle={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,fontFamily:"inherit",fontSize:10}}
                    formatter={(v,key,{payload})=>{const sid=+key.replace("s","");const st=displayStuds.find(s=>s.id===sid);return[payload[`l${sid}`]||`${v}s`,st?.name||key];}}/>
                  {displayStuds.map((s,i)=>(
                    <Line key={s.id} type="monotone" dataKey={`s${s.id}`}
                      stroke={PALETTE[grpStudents.findIndex(x=>x.id===s.id)%PALETTE.length]}
                      strokeWidth={2.5} dot={{r:4,strokeWidth:0}} activeDot={{r:6}} connectNulls={false}/>
                  ))}
                </LineChart>
              ):chartType==="area"?(
                <LineChart data={grpChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.surface}/>
                  <XAxis dataKey="date" tick={{fill:C.muted,fontSize:9}}/>
                  <YAxis tick={{fill:C.muted,fontSize:9}} domain={["auto","auto"]} width={34}/>
                  <Tooltip
                    contentStyle={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,fontFamily:"inherit",fontSize:10}}
                    formatter={(v,key,{payload})=>{const sid=+key.replace("s","");const st=displayStuds.find(s=>s.id===sid);return[payload[`l${sid}`]||`${v}s`,st?.name||key];}}/>
                  {displayStuds.map((s,i)=>(
                    <Line key={s.id} type="monotone" dataKey={`s${s.id}`}
                      stroke={PALETTE[grpStudents.findIndex(x=>x.id===s.id)%PALETTE.length]}
                      strokeWidth={2} dot={false} activeDot={{r:5}} connectNulls={false}
                      fill={`${PALETTE[grpStudents.findIndex(x=>x.id===s.id)%PALETTE.length]}22`}/>
                  ))}
                </LineChart>
              ):chartType==="bar"?(
                <BarChart data={grpChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.surface}/>
                  <XAxis dataKey="date" tick={{fill:C.muted,fontSize:9}}/>
                  <YAxis tick={{fill:C.muted,fontSize:9}} domain={["auto","auto"]} width={34}/>
                  <Tooltip
                    contentStyle={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,fontFamily:"inherit",fontSize:10}}
                    formatter={(v,key,{payload})=>{const sid=+key.replace("s","");const st=displayStuds.find(s=>s.id===sid);return[payload[`l${sid}`]||`${v}s`,st?.name||key];}}/>
                  {displayStuds.map((s,i)=>(
                    <Bar key={s.id} dataKey={`s${s.id}`}
                      fill={PALETTE[grpStudents.findIndex(x=>x.id===s.id)%PALETTE.length]}
                      radius={[3,3,0,0]}/>
                  ))}
                </BarChart>
              ):(
                // scatter: en iyi süre per sporcu — renkli sütun
                <BarChart data={sortedBest.filter(x=>x.bst).map(({s,secs,bst})=>({
                  name:s.name.split(" ")[0],val:secs,
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
            {/* item 16: renk açıklama satırı */}
            <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginTop:6,padding:"0 8px"}}>
              {displayStuds.map((s,i)=>{
                const colIdx=grpStudents.findIndex(x=>x.id===s.id);
                return(
                  <span key={s.id} style={{display:"flex",alignItems:"center",gap:3,fontSize:9,fontWeight:800,color:C.text}}>
                    <span style={{width:10,height:10,borderRadius:"50%",background:PALETTE[colIdx%PALETTE.length],display:"inline-block"}}/>
                    {s.name.split(" ")[0]}
                  </span>
                );
              })}
            </div>
          </div>

          {/* En iyi süreler tablosu — item 15 (konum eklenebilir) */}
          <div style={{background:C.card,borderRadius:11,border:`1px solid ${C.border}`,overflow:"hidden"}}>
            <div style={{display:"flex",padding:"5px 11px",background:C.surface}}>
              <div style={{width:22,color:C.muted,fontSize:9,fontWeight:800}}>#</div>
              <div style={{flex:1,color:C.muted,fontSize:9,fontWeight:800,letterSpacing:"0.07em"}}>SPORCU</div>
              <div style={{width:70,textAlign:"center",color:C.muted,fontSize:9,fontWeight:800}}>EN İYİ</div>
              <div style={{width:40,textAlign:"center",color:C.muted,fontSize:9,fontWeight:800}}>KAYIT</div>
            </div>
            {sortedBest.map(({s,bst},i)=>{
              if(!activeStuds || activeStuds.includes(s.id)){
                const recs = grpSource.filter(p=>p.studentId===s.id && p.discipline===rDisc);
                const colIdx = grpStudents.findIndex(x=>x.id===s.id);
                return(
                  <div key={s.id} style={{display:"flex",alignItems:"center",padding:"7px 11px",
                    background:i%2===0?C.card:C.card2,
                    borderBottom:i<sortedBest.length-1?`1px solid ${C.border}`:"none"}}>
                    <div style={{width:22,color:C.muted,fontSize:10}}>{bst?i+1:"—"}</div>
                    <div style={{flex:1,display:"flex",alignItems:"center",gap:5}}>
                      <div style={{width:9,height:9,borderRadius:"50%",background:PALETTE[colIdx%PALETTE.length],flexShrink:0}}/>
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
              {displayStuds.length===0 ? "Bu filtrede sporcu yok." : "Henüz veri yok."}
            </p>
          </div>
        )}
      </>)}
    </div>
  );
}