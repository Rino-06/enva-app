// ─────────────────────────────────────────────
//  constants.js  —  ENVA sabit veri ve yapılandırma
// ─────────────────────────────────────────────

// ── Renk paleti ──────────────────────────────
export const C = {
  bg:"#071510", surface:"#0C2018", card:"#112A1E", card2:"#163523",
  border:"#1E4030", green:"#2E9B40", greenL:"#5DC46A", yg:"#A8D240",
  blue:"#3B90D5", text:"#E8F5EE", muted:"#5F9070",
  red:"#E05555", gold:"#F0C040",
};

// ── Sabit liste değerleri ─────────────────────
export const AGE_GROUPS = ["U9","U11","U13","U15"];

export const COMP_TYPES = [
  {id:"gelisim",    label:"Gelişim",         emoji:"🌱"},
  {id:"ulusal",     label:"Ulusal Sıralama",  emoji:"🏅"},
  {id:"biathle",    label:"Biathle",          emoji:"🏊"},
  {id:"triathle",   label:"Triathle",         emoji:"3️⃣"},
  {id:"laserrun",   label:"Laser Run",        emoji:"🔫"},
  {id:"tetrathlon", label:"Tetrathlon",       emoji:"4️⃣"},
  {id:"duathlon",   label:"Duathlon",         emoji:"🚴"},
  {id:"aquathlon",  label:"Aquathlon",        emoji:"🌊"},
  {id:"pentatlon",  label:"Modern Pentatlon", emoji:"🏆"},
];

// ── Başlangıç verileri ────────────────────────
export const INIT_COACHES = [
  {id:1, name:"Arap Metin Yıldız", username:"arap.metin", password:"Enva@2024", role:"coach"},
];

export const INIT_PARENTS = [];

export const INIT_STUDENTS = [
  // ENVA ÇEVRE SPOR KULÜBÜ
  {id:1,  name:"Neva Toraman",        gender:"K", ageGroup:"U11", birthYear:2017, club:"ENVA ÇEVRE SPOR KULÜBÜ"},
  {id:2,  name:"Asim Emin Hasdemir",  gender:"E", ageGroup:"U11", birthYear:2017, club:"ENVA ÇEVRE SPOR KULÜBÜ"},
  {id:3,  name:"Mustafa Emir Altun",  gender:"E", ageGroup:"U11", birthYear:2017, club:"ENVA ÇEVRE SPOR KULÜBÜ"},
  {id:4,  name:"Rana Eyşan Hasdemir", gender:"K", ageGroup:"U13", birthYear:2014, club:"ENVA ÇEVRE SPOR KULÜBÜ"},
  // TOHUM ANKARA SK
  {id:5,  name:"Ömer Talha Şahin",    gender:"E", ageGroup:"U11", birthYear:2017, club:"TOHUM ANKARA SK"},
  {id:6,  name:"Emir Yahya Şahin",    gender:"E", ageGroup:"U11", birthYear:2017, club:"TOHUM ANKARA SK"},
  {id:7,  name:"Cem Kaan Sicacik",    gender:"E", ageGroup:"U11", birthYear:2016, club:"TOHUM ANKARA SK"},
  {id:8,  name:"Elif Rana Yetkin",    gender:"K", ageGroup:"U11", birthYear:2017, club:"TOHUM ANKARA SK"},
  {id:9,  name:"Alp Taha Akbulut",    gender:"E", ageGroup:"U11", birthYear:2016, club:"TOHUM ANKARA SK"},
  {id:10, name:"Emir Öztürk",         gender:"E", ageGroup:"U11", birthYear:2016, club:"TOHUM ANKARA SK"},
  {id:11, name:"Ahmet Erdem Yetkin",  gender:"E", ageGroup:"U13", birthYear:2015, club:"TOHUM ANKARA SK"},
  {id:12, name:"Demir Okumuş",        gender:"E", ageGroup:"U13", birthYear:2014, club:"TOHUM ANKARA SK"},
];

export const INIT_TRAININGS = [];

// ── Yarışma sonuçları (swim/run ayrı satır) ───
export const INIT_COMPS = [
  // ── GELİŞİM YARIŞLARI 1 - ÇORUM (31.01.2026) ──
  {id:1,  studentId:1,  date:"2026-01-31", name:"Gelişim Yarışları 1", location:"Çorum",     type:"gelisim", discipline:"swim", minutes:1, seconds:18, milliseconds:85, rank:23, totalParticipants:27, score:655},
  {id:2,  studentId:1,  date:"2026-01-31", name:"Gelişim Yarışları 1", location:"Çorum",     type:"gelisim", discipline:"run",  minutes:4, seconds:28, milliseconds:30, rank:23, totalParticipants:27, score:655},
  {id:3,  studentId:2,  date:"2026-01-31", name:"Gelişim Yarışları 1", location:"Çorum",     type:"gelisim", discipline:"swim", minutes:0, seconds:55, milliseconds:22, rank:26, totalParticipants:32, score:774},
  {id:4,  studentId:2,  date:"2026-01-31", name:"Gelişim Yarışları 1", location:"Çorum",     type:"gelisim", discipline:"run",  minutes:3, seconds:16, milliseconds:10, rank:26, totalParticipants:32, score:774},
  {id:5,  studentId:3,  date:"2026-01-31", name:"Gelişim Yarışları 1", location:"Çorum",     type:"gelisim", discipline:"swim", minutes:0, seconds:55, milliseconds:83, rank:28, totalParticipants:32, score:725},
  {id:6,  studentId:3,  date:"2026-01-31", name:"Gelişim Yarışları 1", location:"Çorum",     type:"gelisim", discipline:"run",  minutes:4, seconds:4,  milliseconds:65, rank:28, totalParticipants:32, score:725},
  {id:7,  studentId:4,  date:"2026-01-31", name:"Gelişim Yarışları 1", location:"Çorum",     type:"gelisim", discipline:"swim", minutes:2, seconds:0,  milliseconds:48, rank:25, totalParticipants:38, score:705},
  {id:8,  studentId:4,  date:"2026-01-31", name:"Gelişim Yarışları 1", location:"Çorum",     type:"gelisim", discipline:"run",  minutes:4, seconds:45, milliseconds:81, rank:25, totalParticipants:38, score:705},
  {id:9,  studentId:5,  date:"2026-01-31", name:"Gelişim Yarışları 1", location:"Çorum",     type:"gelisim", discipline:"swim", minutes:0, seconds:39, milliseconds:62, rank:5,  totalParticipants:32, score:840},
  {id:10, studentId:5,  date:"2026-01-31", name:"Gelişim Yarışları 1", location:"Çorum",     type:"gelisim", discipline:"run",  minutes:2, seconds:41, milliseconds:8,  rank:5,  totalParticipants:32, score:840},
  {id:11, studentId:6,  date:"2026-01-31", name:"Gelişim Yarışları 1", location:"Çorum",     type:"gelisim", discipline:"swim", minutes:0, seconds:42, milliseconds:89, rank:8,  totalParticipants:32, score:835},
  {id:12, studentId:6,  date:"2026-01-31", name:"Gelişim Yarışları 1", location:"Çorum",     type:"gelisim", discipline:"run",  minutes:2, seconds:40, milliseconds:8,  rank:8,  totalParticipants:32, score:835},
  {id:13, studentId:7,  date:"2026-01-31", name:"Gelişim Yarışları 1", location:"Çorum",     type:"gelisim", discipline:"swim", minutes:0, seconds:50, milliseconds:57, rank:17, totalParticipants:32, score:804},
  {id:14, studentId:7,  date:"2026-01-31", name:"Gelişim Yarışları 1", location:"Çorum",     type:"gelisim", discipline:"run",  minutes:2, seconds:55, milliseconds:17, rank:17, totalParticipants:32, score:804},
  {id:15, studentId:8,  date:"2026-01-31", name:"Gelişim Yarışları 1", location:"Çorum",     type:"gelisim", discipline:"swim", minutes:0, seconds:41, milliseconds:64, rank:5,  totalParticipants:27, score:826},
  {id:16, studentId:8,  date:"2026-01-31", name:"Gelişim Yarışları 1", location:"Çorum",     type:"gelisim", discipline:"run",  minutes:2, seconds:51, milliseconds:61, rank:5,  totalParticipants:27, score:826},
  {id:17, studentId:9,  date:"2026-01-31", name:"Gelişim Yarışları 1", location:"Çorum",     type:"gelisim", discipline:"swim", minutes:0, seconds:46, milliseconds:4,  rank:32, totalParticipants:32, score:248},
  {id:18, studentId:11, date:"2026-01-31", name:"Gelişim Yarışları 1", location:"Çorum",     type:"gelisim", discipline:"swim", minutes:1, seconds:35, milliseconds:6,  rank:33, totalParticipants:49, score:754},
  {id:19, studentId:11, date:"2026-01-31", name:"Gelişim Yarışları 1", location:"Çorum",     type:"gelisim", discipline:"run",  minutes:4, seconds:38, milliseconds:54, rank:33, totalParticipants:49, score:754},
  {id:20, studentId:12, date:"2026-01-31", name:"Gelişim Yarışları 1", location:"Çorum",     type:"gelisim", discipline:"swim", minutes:1, seconds:39, milliseconds:92, rank:35, totalParticipants:49, score:752},
  {id:21, studentId:12, date:"2026-01-31", name:"Gelişim Yarışları 1", location:"Çorum",     type:"gelisim", discipline:"run",  minutes:4, seconds:39, milliseconds:74, rank:35, totalParticipants:49, score:752},
  // ── GELİŞİM YARIŞLARI 2 - DİYARBAKIR (28.03.2026) ──
  {id:22, studentId:1,  date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"swim", minutes:1, seconds:1,  milliseconds:53, rank:22, totalParticipants:23, score:664},
  {id:23, studentId:1,  date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"run",  minutes:4, seconds:52, milliseconds:29, rank:22, totalParticipants:23, score:664},
  {id:24, studentId:2,  date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"swim", minutes:0, seconds:48, milliseconds:99, rank:19, totalParticipants:34, score:788},
  {id:25, studentId:2,  date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"run",  minutes:3, seconds:14, milliseconds:84, rank:19, totalParticipants:34, score:788},
  {id:26, studentId:4,  date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"swim", minutes:1, seconds:43, milliseconds:86, rank:23, totalParticipants:38, score:718},
  {id:27, studentId:4,  date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"run",  minutes:4, seconds:44, milliseconds:24, rank:23, totalParticipants:38, score:718},
  {id:28, studentId:5,  date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"swim", minutes:0, seconds:38, milliseconds:4,  rank:5,  totalParticipants:34, score:850},
  {id:29, studentId:5,  date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"run",  minutes:2, seconds:33, milliseconds:30, rank:5,  totalParticipants:34, score:850},
  {id:30, studentId:6,  date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"swim", minutes:0, seconds:41, milliseconds:53, rank:11, totalParticipants:34, score:831},
  {id:31, studentId:6,  date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"run",  minutes:2, seconds:45, milliseconds:79, rank:11, totalParticipants:34, score:831},
  {id:32, studentId:7,  date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"swim", minutes:0, seconds:50, milliseconds:4,  rank:17, totalParticipants:34, score:797},
  {id:33, studentId:7,  date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"run",  minutes:3, seconds:2,  milliseconds:62, rank:17, totalParticipants:34, score:797},
  {id:34, studentId:8,  date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"swim", minutes:0, seconds:40, milliseconds:0,  rank:6,  totalParticipants:23, score:814},
  {id:35, studentId:8,  date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"run",  minutes:3, seconds:5,  milliseconds:45, rank:6,  totalParticipants:23, score:814},
  {id:36, studentId:9,  date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"swim", minutes:0, seconds:42, milliseconds:38, rank:15, totalParticipants:34, score:807},
  {id:37, studentId:9,  date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"run",  minutes:3, seconds:8,  milliseconds:72, rank:15, totalParticipants:34, score:807},
  {id:38, studentId:10, date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"swim", minutes:0, seconds:49, milliseconds:35, rank:20, totalParticipants:34, score:783},
  {id:39, studentId:10, date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"run",  minutes:3, seconds:18, milliseconds:58, rank:20, totalParticipants:34, score:783},
  {id:40, studentId:11, date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"swim", minutes:1, seconds:35, milliseconds:6,  rank:28, totalParticipants:52, score:746},
  {id:41, studentId:11, date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"run",  minutes:4, seconds:33, milliseconds:38, rank:28, totalParticipants:52, score:746},
  {id:42, studentId:12, date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"swim", minutes:1, seconds:33, milliseconds:57, rank:27, totalParticipants:52, score:750},
  {id:43, studentId:12, date:"2026-03-28", name:"Gelişim Yarışları 2", location:"Diyarbakır", type:"gelisim", discipline:"run",  minutes:4, seconds:32, milliseconds:2,  rank:27, totalParticipants:52, score:750},
];

// ── 2026 Yarışma Takvimi (TMPF resmi) ─────────
export const INIT_CALENDAR = [
  {id:1,  name:"Gelişim Yarışları 1",                                          location:"Çorum",          startDate:"2026-01-31", endDate:"2026-01-31", categories:["U9","U11","U13"],              type:"gelisim"},
  {id:2,  name:"U17-U19 Ulusal Sıralama 1",                                   location:"Ankara",         startDate:"2026-03-10", endDate:"2026-03-12", categories:["U17"],                         type:"ulusal"},
  {id:3,  name:"Gelişim Yarışları 2",                                          location:"Diyarbakır",     startDate:"2026-03-28", endDate:"2026-03-28", categories:["U9","U11","U13"],              type:"gelisim"},
  {id:4,  name:"Tetratlon Türkiye Sıralaması 1",                               location:"Ankara",         startDate:"2026-04-17", endDate:"2026-04-18", categories:["U15"],                         type:"tetratlon"},
  {id:5,  name:"U17-U19 Ulusal Sıralama 2",                                   location:"Ankara",         startDate:"2026-04-16", endDate:"2026-04-18", categories:["U17"],                         type:"ulusal"},
  {id:6,  name:"Triathle Ulusal Sıralama 1 ve Masterler",                     location:"Antalya-Alanya", startDate:"2026-04-24", endDate:"2026-04-26", categories:["U9","U11","U13","U15","U17"],  type:"triathle"},
  {id:7,  name:"Tetratlon Türkiye Sıralaması 2",                               location:"Bursa",          startDate:"2026-05-19", endDate:"2026-05-20", categories:["U15"],                         type:"tetratlon"},
  {id:8,  name:"U17-U19 Ulusal Sıralama 3 ve Yeşilay Türkiye Şampiyonası",   location:"Bursa",          startDate:"2026-05-18", endDate:"2026-05-20", categories:["U17"],                         type:"ulusal"},
  {id:9,  name:"Gelişim Yarışları Yeşilay Türkiye Şampiyonası",               location:"Gaziantep",      startDate:"2026-06-06", endDate:"2026-06-06", categories:["U9","U11","U13"],              type:"gelisim"},
  {id:10, name:"Tetratlon Yeşilay Türkiye Şampiyonası 3",                     location:"Ankara",         startDate:"2026-06-26", endDate:"2026-06-28", categories:["U15"],                         type:"tetratlon"},
  {id:11, name:"15 Temmuz Milli Birlik — Para Biathle-Triathle-Laser Run",    location:"Konya",          startDate:"2026-07-15", endDate:"2026-07-15", categories:["U9","U11","U13","U15","U17"],  type:"laserrun"},
  {id:12, name:"30 Ağustos Zafer Bayramı Laser Run",                          location:"Adıyaman",       startDate:"2026-08-30", endDate:"2026-08-30", categories:["U9","U11","U13","U15","U17"],  type:"laserrun"},
  {id:13, name:"Triathle Ulusal Sıralama 2 ve Masterler — Spor Toto Türkiye Şampiyonası", location:"Bursa", startDate:"2026-09-18", endDate:"2026-09-20", categories:["U9","U11","U13","U15","U17"], type:"triathle"},
  {id:14, name:"29 Ekim Cumhuriyet Bayramı Laser Run",                        location:"Malatya",        startDate:"2026-10-29", endDate:"2026-10-29", categories:["U9","U11","U13","U15","U17"],  type:"laserrun"},
];

// ── localStorage sabiti ───────────────────────
export const LS_KEY = "enva_session";
