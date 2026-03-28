// ===== SYMPTOM DATA =====
const symptomData = {
  "General": ["Fever","Fatigue","Weakness","Weight loss","Night sweats","Chills","Loss of appetite","Swollen lymph nodes","Dehydration","Dizziness"],
  "Head & Neuro": ["Headache","Migraine","Confusion","Memory loss","Numbness","Tremors","Seizures","Blurred vision","Fainting","Neck stiffness"],
  "Respiratory": ["Cough","Shortness of breath","Wheezing","Chest tightness","Sore throat","Runny nose","Nasal congestion","Sneezing","Hoarseness","Coughing blood"],
  "Digestive": ["Nausea","Vomiting","Diarrhoea","Constipation","Abdominal pain","Bloating","Heartburn","Blood in stool","Loss of appetite","Jaundice"],
  "Skin": ["Rash","Itching","Hives","Blisters","Dry skin","Bruising","Yellowing skin","Pale skin","Hair loss","Nail changes"],
  "Musculoskeletal": ["Joint pain","Muscle pain","Back pain","Stiffness","Swelling","Muscle weakness","Cramps","Bone pain","Limited mobility","Tenderness"],
  "Cardiovascular": ["Chest pain","Palpitations","Irregular heartbeat","Leg swelling","Shortness of breath","High blood pressure","Cold extremities","Dizziness","Fatigue","Fainting"],
  "Mental Health": ["Anxiety","Depression","Mood swings","Insomnia","Irritability","Difficulty concentrating","Panic attacks","Hallucinations","Social withdrawal","Fatigue"]
};

const symptomDiseaseMap = {
  "Fever,Cough,Sore throat": {name:"Influenza (Flu)", match:92, description:"A viral respiratory illness caused by influenza viruses.", urgency:"moderate"},
  "Fever,Headache,Neck stiffness": {name:"Meningitis", match:87, description:"Inflammation of membranes surrounding the brain and spinal cord.", urgency:"high"},
  "Chest pain,Shortness of breath,Palpitations": {name:"Cardiac Arrhythmia", match:84, description:"Abnormal heart rhythm that may cause chest discomfort.", urgency:"high"},
  "Fatigue,Weight loss,Night sweats": {name:"Lymphoma", match:78, description:"Cancer of the lymphatic system. Requires immediate evaluation.", urgency:"high"},
  "Nausea,Abdominal pain,Diarrhoea": {name:"Gastroenteritis", match:91, description:"Inflammation of the stomach and intestines, often viral.", urgency:"low"},
  "Headache,Blurred vision,Dizziness": {name:"Hypertension", match:82, description:"High blood pressure that can cause neurological symptoms.", urgency:"moderate"},
  "Joint pain,Stiffness,Swelling": {name:"Rheumatoid Arthritis", match:88, description:"Autoimmune disease causing joint inflammation.", urgency:"moderate"},
  "Rash,Itching,Fever": {name:"Dengue Fever", match:85, description:"Mosquito-borne viral infection common in tropical regions.", urgency:"moderate"},
  "Cough,Shortness of breath,Wheezing": {name:"Asthma", match:90, description:"Chronic respiratory condition causing airway inflammation.", urgency:"moderate"},
  "Anxiety,Insomnia,Fatigue": {name:"Anxiety Disorder", match:86, description:"Persistent anxiety affecting daily functioning.", urgency:"low"},
};

let selectedSymptoms = [];
let currentCategory = "General";
let bmiUnit = 'metric';
let map, markers = [];

// ===== INIT =====
function initSymptomChecker() {
  const tabs = document.getElementById('catTabs');
  tabs.innerHTML = '';
  const L = translations[currentLang];
  Object.keys(symptomData).forEach((cat,i) => {
    const btn = document.createElement('button');
    btn.className = 'cat-tab' + (i===0?' active':'');
    btn.textContent = (L.symptom_cats && L.symptom_cats[cat]) || cat;
    btn.setAttribute('data-cat', cat);
    btn.onclick = () => selectCategory(cat, btn);
    tabs.appendChild(btn);
  });
  renderSymptoms(currentCategory);
}

function selectCategory(cat, btn) {
  document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentCategory = cat;
  renderSymptoms(cat);
}

function renderSymptoms(cat) {
  const grid = document.getElementById('symptomsGrid');
  grid.innerHTML = '';
  symptomData[cat].forEach(s => {
    const chip = document.createElement('div');
    chip.className = 'symptom-chip' + (selectedSymptoms.includes(s)?' selected':'');
    chip.textContent = s;
    chip.onclick = () => toggleSymptom(s, chip);
    grid.appendChild(chip);
  });
}

function toggleSymptom(s, chip) {
  if (selectedSymptoms.includes(s)) {
    selectedSymptoms = selectedSymptoms.filter(x => x !== s);
    chip.classList.remove('selected');
  } else {
    selectedSymptoms.push(s);
    chip.classList.add('selected');
  }
  updateSelectedDisplay();
}

function updateSelectedDisplay() {
  document.getElementById('selCount').textContent = selectedSymptoms.length;
  const area = document.getElementById('selectedChips');
  area.innerHTML = selectedSymptoms.map(s => `<div class="sel-chip">${s}<button onclick="removeSymptom('${s}')">×</button></div>`).join('');
}

function removeSymptom(s) {
  selectedSymptoms = selectedSymptoms.filter(x => x !== s);
  updateSelectedDisplay();
  renderSymptoms(currentCategory);
}

function analyzeSymptoms() {
  if (selectedSymptoms.length < 2) { alert('Please select at least 2 symptoms for analysis.'); return; }
  const resultDiv = document.getElementById('analysisResult');
  resultDiv.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--mint)">' + (translations[currentLang].sym_analysing||'🔬 Analysing symptoms...') + '</div>';
  setTimeout(() => {
    let results = [];
    Object.entries(symptomDiseaseMap).forEach(([key, val]) => {
      const keySymptoms = key.split(',');
      const matchCount = keySymptoms.filter(s => selectedSymptoms.includes(s)).length;
      if (matchCount > 0) {
        const score = Math.round((matchCount / keySymptoms.length) * val.match);
        results.push({...val, match: score});
      }
    });
    if (results.length === 0) {
      results = [{name:"Common Cold / Viral Infection", match:72, description:"Most common cause of multiple mild symptoms.", urgency:"low"}];
    }
    results.sort((a,b) => b.match - a.match);
    const urgencyColor = {high:'var(--danger)',moderate:'var(--warn)',low:'var(--mint)'};
    resultDiv.innerHTML = results.slice(0,3).map(r => `
      <div class="disease-result">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div class="disease-name">${r.name}</div>
          <span style="font-size:.72rem;background:${urgencyColor[r.urgency]};color:var(--navy);padding:.2rem .6rem;border-radius:6px;font-weight:700">${r.urgency.toUpperCase()}</span>
        </div>
        <div class="disease-match">${r.match}% match</div>
        <div class="match-bar"><div class="match-fill" style="width:${r.match}%"></div></div>
        <div style="font-size:.78rem;color:var(--muted);margin-top:.5rem">${r.description}</div>
      </div>`).join('') +
      `<div class="result-disclaimer">${translations[currentLang].sym_disclaimer||'⚠️ This is an AI-based analysis for informational purposes only.'}</div>`;
  }, 1200);
}

// ===== DISEASE DATABASE =====
const diseases = [
  {name:"Diabetes Mellitus",cat:"Metabolic",icon:"🩸",bg:"rgba(255,179,71,0.15)",desc:"Chronic condition affecting blood sugar regulation.",symptoms:["Frequent urination","Excessive thirst","Blurred vision"],treatment:"Insulin, oral medications, lifestyle changes.",prevention:"Healthy diet, exercise, weight management."},
  {name:"Hypertension",cat:"Cardiovascular",icon:"❤️",bg:"rgba(255,77,109,0.15)",desc:"High blood pressure increasing heart disease risk.",symptoms:["Headache","Dizziness","Chest pain"],treatment:"ACE inhibitors, diuretics, lifestyle modification.",prevention:"Low-salt diet, exercise, stress reduction."},
  {name:"Asthma",cat:"Respiratory",icon:"💨",bg:"rgba(77,166,255,0.15)",desc:"Chronic airway inflammation causing breathing difficulty.",symptoms:["Wheezing","Shortness of breath","Chest tightness"],treatment:"Inhalers, corticosteroids, bronchodilators.",prevention:"Avoid triggers, regular medication, clean air."},
  {name:"Dengue Fever",cat:"Infectious",icon:"🦟",bg:"rgba(0,200,150,0.1)",desc:"Mosquito-borne viral fever common in tropical regions.",symptoms:["High fever","Severe headache","Rash","Joint pain"],treatment:"Supportive care, hydration, pain relief.",prevention:"Mosquito control, repellents, protective clothing."},
  {name:"Tuberculosis",cat:"Infectious",icon:"🫁",bg:"rgba(0,200,150,0.1)",desc:"Bacterial infection primarily affecting the lungs.",symptoms:["Persistent cough","Night sweats","Weight loss"],treatment:"6-month antibiotic regimen (DOTS therapy).",prevention:"BCG vaccination, ventilation, early detection."},
  {name:"Malaria",cat:"Infectious",icon:"🦠",bg:"rgba(0,200,150,0.1)",desc:"Parasitic disease spread by Anopheles mosquitoes.",symptoms:["Cyclical fever","Chills","Anaemia"],treatment:"Antimalarial drugs (artemisinin combination therapy).",prevention:"Mosquito nets, prophylactics, drainage of stagnant water."},
  {name:"Arthritis",cat:"Musculoskeletal",icon:"🦴",bg:"rgba(255,179,71,0.15)",desc:"Inflammation of joints causing pain and stiffness.",symptoms:["Joint pain","Swelling","Reduced motion"],treatment:"NSAIDs, physiotherapy, DMARDs for RA.",prevention:"Weight management, exercise, joint protection."},
  {name:"Anaemia",cat:"Haematological",icon:"💉",bg:"rgba(255,77,109,0.15)",desc:"Deficiency of red blood cells or haemoglobin.",symptoms:["Fatigue","Pale skin","Shortness of breath"],treatment:"Iron supplements, B12 injections, dietary changes.",prevention:"Balanced diet rich in iron and vitamins."},
  {name:"Migraine",cat:"Neurological",icon:"🧠",bg:"rgba(168,109,255,0.15)",desc:"Recurring severe headaches often with nausea and light sensitivity.",symptoms:["Severe headache","Nausea","Photophobia"],treatment:"Triptans, NSAIDs, preventive medications.",prevention:"Identify triggers, regular sleep, stress management."},
];

let activeDiseaseFilter = 'All';

function initDiseaseDB() {
  const cats = ['All',...[...new Set(diseases.map(d=>d.cat))]];
  const filterDiv = document.getElementById('diseaseCatFilter');
  cats.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'cat-tab' + (c==='All'?' active':'');
    btn.textContent = c;
    btn.onclick = () => { activeDiseaseFilter=c; document.querySelectorAll('#diseaseCatFilter .cat-tab').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); filterDiseases(); };
    filterDiv.appendChild(btn);
  });
  renderDiseases(diseases);
}

function filterDiseases() {
  const q = document.getElementById('diseaseSearch').value.toLowerCase();
  const filtered = diseases.filter(d => {
    const matchCat = activeDiseaseFilter==='All'||d.cat===activeDiseaseFilter;
    const matchQ = !q || d.name.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q) || d.symptoms.some(s=>s.toLowerCase().includes(q));
    return matchCat && matchQ;
  });
  renderDiseases(filtered);
}

function renderDiseases(list) {
  document.getElementById('diseaseCards').innerHTML = list.map(d => `
    <div class="d-card" onclick="openDiseaseModal('${d.name}')">
      <div class="d-card-top"><div class="d-icon" style="background:${d.bg}">${d.icon}</div><div><div class="d-name">${d.name}</div><div class="d-category">${d.cat}</div></div></div>
      <div class="d-desc">${d.desc}</div>
      <div class="d-tags">${d.symptoms.slice(0,3).map(s=>`<span class="d-tag">${s}</span>`).join('')}</div>
    </div>`).join('') || '<p style="color:var(--muted);grid-column:1/-1;text-align:center;padding:2rem">No diseases found.</p>';
}

function openDiseaseModal(name) {
  const d = diseases.find(x=>x.name===name);
  if (!d) return;
  document.getElementById('modalContent').innerHTML = `
    <span class="modal-badge">${d.cat}</span>
    <h2>${d.icon} ${d.name}</h2>
    <p>${d.desc}</p>
    <div class="modal-section"><h3>Common Symptoms</h3><ul class="modal-list">${d.symptoms.map(s=>`<li>${s}</li>`).join('')}</ul></div>
    <div class="modal-section"><h3>Treatment Options</h3><ul class="modal-list"><li>${d.treatment}</li></ul></div>
    <div class="modal-section"><h3>Prevention</h3><ul class="modal-list"><li>${d.prevention}</li></ul></div>
    <div style="background:rgba(255,77,109,0.08);border:1px solid rgba(255,77,109,0.2);border-radius:10px;padding:1rem;font-size:.82rem;color:var(--muted)">⚠️ Always consult a certified medical professional for diagnosis and treatment.</div>`;
  document.getElementById('diseaseModal').classList.add('open');
}

function closeModal() { document.getElementById('diseaseModal').classList.remove('open'); }
document.getElementById('diseaseModal').onclick = e => { if(e.target===document.getElementById('diseaseModal')) closeModal(); };

// ===== VITAL LOGGING =====
function logVital(type) {
  const feedback = document.getElementById('vitalFeedback');
  const map2 = {hr:['hrIn','hrDisplay',' bpm'],bp:['bpIn','bpDisplay','/80 mmHg'],temp:['tempIn','tempDisplay',' °F'],weight:['weightIn','weightDisplay',' kg']};
  const [inId, dispId, suffix] = map2[type];
  const val = document.getElementById(inId).value;
  if (!val) return;
  document.getElementById(dispId).textContent = val + suffix;
  document.getElementById(inId).value = '';
  feedback.textContent = translations[currentLang].log_success || '✓ Logged successfully!';
  setTimeout(()=>feedback.textContent='',2000);
}

// ===== DOCTOR BOOKING =====
function bookDoctor(name) {
  alert(`Booking consultation with ${name}...\n\nIn a full implementation, this would open a scheduling widget with available time slots, video call setup, and payment processing.`);
}

// ===== MAP =====
function initMap() {
  // Default to Srivilliputhur, Tamil Nadu
  const defaultLat = 9.5127, defaultLng = 77.6369;
  map = L.map('map').setView([defaultLat, defaultLng], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  const places = [
    {lat:9.5127,lng:77.6369,name:"Srivilliputhur Government Hospital",type:"hospital",info:"24/7 Emergency • General Medicine"},
    {lat:9.5185,lng:77.6420,name:"Meenakshi Clinic",type:"clinic",info:"General Practice • Mon-Sat 9AM-6PM"},
    {lat:9.5070,lng:77.6310,name:"Apollo Pharmacy",type:"pharmacy",info:"Open 24 hours • Home delivery"},
    {lat:9.5200,lng:77.6350,name:"City Health Centre",type:"clinic",info:"Primary Care • Vaccinations"},
    {lat:9.5090,lng:77.6450,name:"Sri Kumaran Hospital",type:"hospital",info:"Multi-specialty • Emergency Care"},
    {lat:9.5150,lng:77.6280,name:"MedPlus Pharmacy",type:"pharmacy",info:"Open 8AM-10PM • Prescription"},
  ];

  const icons = {
    hospital: L.divIcon({html:'<div style="background:#ff4d6d;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🏥</div>',iconSize:[32,32],iconAnchor:[16,16],className:''}),
    clinic: L.divIcon({html:'<div style="background:#4da6ff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🏨</div>',iconSize:[32,32],iconAnchor:[16,16],className:''}),
    pharmacy: L.divIcon({html:'<div style="background:#00C896;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">💊</div>',iconSize:[32,32],iconAnchor:[16,16],className:''}),
  };

  places.forEach(p => {
    const m = L.marker([p.lat,p.lng],{icon:icons[p.type]}).addTo(map);
    m._type = p.type;
    m.bindPopup(`<b>${p.name}</b><br><small>${p.info}</small><br><a href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}" target="_blank" style="color:#00C896">Get Directions ↗</a>`);
    markers.push(m);
  });

  // Add user marker
  L.circleMarker([defaultLat, defaultLng], {radius:10,fillColor:'#00C896',fillOpacity:0.7,color:'#fff',weight:3}).addTo(map).bindPopup('📍 You are here');
}

function filterMap(type, btn) {
  document.querySelectorAll('.map-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  markers.forEach(m => {
    if (type==='all'||m._type===type) { map.addLayer(m); } else { map.removeLayer(m); }
  });
}

function locateMe() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      map.setView([pos.coords.latitude, pos.coords.longitude], 15);
    }, () => alert('Location access denied.'));
  }
}

// ===== BMI =====
function setUnit(unit) {
  bmiUnit = unit;
  document.getElementById('metricBtn').classList.toggle('active', unit==='metric');
  document.getElementById('imperialBtn').classList.toggle('active', unit==='imperial');
  document.getElementById('weightLabel').textContent = unit==='metric'?'Weight (kg)':'Weight (lbs)';
  document.getElementById('heightLabel').textContent = unit==='metric'?'Height (cm)':'Height (inches)';
}

function calculateBMI() {
  let w = parseFloat(document.getElementById('bmiWeight').value);
  let h = parseFloat(document.getElementById('bmiHeight').value);
  if (!w||!h) { alert('Please enter weight and height.'); return; }
  if (bmiUnit==='imperial') { w=w*0.453592; h=h*2.54; }
  const bmi = w / ((h/100)**2);
  const bmiRound = Math.round(bmi*10)/10;
  let label='', color='', tips='', markerPct=0;
  const L = translations[currentLang];
  if (bmi<18.5) { label=L.bmi_under||'Underweight'; color='var(--info)'; tips='Consider increasing caloric intake with nutrient-dense foods. Consult a nutritionist.'; markerPct=10; }
  else if (bmi<25) { label=L.bmi_normal||'Normal weight'; color='var(--mint)'; tips='Great! Maintain your weight with balanced diet and regular exercise.'; markerPct=35; }
  else if (bmi<30) { label=L.bmi_over||'Overweight'; color='var(--warn)'; tips='Consider moderate caloric reduction and increasing physical activity to 150 min/week.'; markerPct=62; }
  else { label=L.bmi_obese||'Obese'; color='var(--danger)'; tips='Please consult a doctor. A structured weight loss programme with medical supervision is recommended.'; markerPct=88; }
  document.getElementById('bmiResult').innerHTML = `
    <div class="bmi-num" style="color:${color}">${bmiRound}</div>
    <div class="bmi-label" style="color:${color}">${label}</div>
    <div class="bmi-scale">
      <div class="scale-bar"><div class="scale-marker" style="left:${markerPct}%"></div></div>
      <div class="scale-labels"><span>${L.scale_under||'Underweight'}</span><span>${L.scale_normal||'Normal'}</span><span>${L.scale_over||'Overweight'}</span><span>${L.scale_obese||'Obese'}</span></div>
    </div>
    <div class="bmi-tips">${tips}</div>`;
}

// ===== AI CHAT =====
const aiResponses = {
  "diabetes": "Diabetes is a chronic condition where the body cannot properly regulate blood sugar. Key signs include frequent urination, excessive thirst, unexplained weight loss, and blurred vision. Type 1 requires insulin therapy; Type 2 can often be managed with lifestyle changes and oral medication. Regular HbA1c tests are essential for monitoring.",
  "blood pressure": "To lower blood pressure naturally: reduce sodium intake to less than 2,300mg/day, exercise 30 minutes most days, maintain a healthy weight, limit alcohol, quit smoking, manage stress through meditation or yoga, and eat a DASH diet rich in fruits, vegetables, and whole grains. Monitor regularly.",
  "heart": "Heart-healthy foods include: fatty fish (salmon, mackerel) for omega-3s, olive oil, nuts and seeds, whole grains, legumes, leafy greens, berries, and avocado. Limit saturated fats, trans fats, processed meats, and high-sodium foods. The Mediterranean diet has strong evidence for cardiovascular protection.",
  "water": "General recommendation is 8 glasses (2 litres) per day, but needs vary. Men typically need about 3.7L and women 2.7L total daily fluids from all sources. Increase intake during exercise, hot weather, illness, or pregnancy. Your urine should be pale yellow — a good hydration indicator.",
  "covid": "COVID-19 symptoms include fever, dry cough, fatigue, loss of taste/smell, sore throat, headache, muscle aches, and shortness of breath. Severe cases may cause difficulty breathing. If you have symptoms, isolate and get tested. Seek emergency care for chest pain, confusion, or inability to breathe.",
  "sleep": "To improve sleep quality: maintain consistent sleep/wake times even on weekends, keep bedroom cool and dark, avoid screens 1 hour before bed (blue light suppresses melatonin), limit caffeine after 2PM, avoid alcohol near bedtime, exercise regularly but not too close to sleep, and try relaxation techniques like deep breathing.",
  "default": "Thank you for your question! I'm here to provide general health information and guidance. For personalised medical advice, diagnosis, or treatment, please consult a qualified healthcare professional. You can also use our symptom checker tool or book a consultation with one of our doctors above."
};

function sendChat() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;
  addMessage(msg, 'user');
  input.value = '';
  setTimeout(() => {
    const lower = msg.toLowerCase();
    let response = aiResponses.default;
    for (const [key, val] of Object.entries(aiResponses)) {
      if (lower.includes(key)) { response = val; break; }
    }
    addMessage(response, 'ai');
  }, 800);
}

function addMessage(text, type) {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'msg ' + type;
  div.textContent = (type==='ai'?'🤖 ':'')+text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function askQuick(q) {
  document.getElementById('chatInput').value = q;
  sendChat();
}

// ===== SETTINGS =====
let currentLang = 'en';
let currentRegion = 'TN';

const translations = {
  en: {
    settings: "Settings",
    language: "🌐 Language",
    region: "📍 Region",
    emergency_numbers: "Indian Emergency Numbers",
    settings_footer: "Settings are saved automatically",
    nav_home: "Home", nav_monitor: "Monitor", nav_symptoms: "Symptom Check",
    nav_diseases: "Diseases", nav_consult: "Consult", nav_hospitals: "Hospitals",
    nav_bmi: "BMI", nav_ask: "Ask AI",
    hero_badge: "AI-Powered Healthcare",
    hero_title: "Your Smart <span class='accent'>Health</span> Assistant",
    hero_sub: "Cure.ai combines artificial intelligence with medical expertise to monitor your health, analyse symptoms, connect you with doctors, and guide you toward a healthier life.",
    hero_btn1: "Check Symptoms", hero_btn2: "Talk to a Doctor",
    stat1_label: "Diseases tracked", stat2_label: "Doctors online", stat3_label: "AI accuracy",
    feat_label: "Everything you need", feat_title: "Complete Health Platform",
    feat1_title: "Health Monitoring", feat1_desc: "Track vitals, log health data, and get AI insights on trends in real time.",
    feat2_title: "Symptom Analyser", feat2_desc: "Select symptoms from categorised tables. AI cross-references 10,000+ conditions.",
    feat3_title: "Disease Database", feat3_desc: "In-depth encyclopaedia of diseases: causes, symptoms, treatments, prevention.",
    feat4_title: "Doctor Consulting", feat4_desc: "Book instant video or chat consultations with certified specialists.",
    feat5_title: "Nearby Hospitals", feat5_desc: "Live map of hospitals, clinics, and pharmacies near your location.",
    feat6_title: "BMI Calculator", feat6_desc: "Calculate your Body Mass Index and get personalised nutrition guidance.",
    monitor_label: "Real-time tracking", monitor_title: "Health Monitoring",
    monitor_sub: "Log your daily vitals. Our AI tracks trends and alerts you to any concerning changes.",
    monitor_today: "Today's Vitals", monitor_log: "Log New Reading",
    vital_hr: "❤️ Heart Rate", vital_bp: "🩸 Blood Pressure", vital_temp: "🌡️ Temperature",
    vital_spo2: "💨 Oxygen (SpO2)", vital_weight: "⚖️ Weight",
    label_hr: "Heart Rate (bpm)", label_bp: "Blood Pressure (systolic)",
    label_temp: "Temperature (°F)", label_weight: "Weight (kg)",
    log_btn: "Log", log_success: "✓ Logged successfully!",
    sym_label: "AI Diagnosis", sym_title: "Symptom Analyser",
    sym_sub: "Select your symptoms from the categorised table. Our AI will analyse and suggest possible conditions.",
    sym_selected: "Selected symptoms:", sym_analyze: "🔬 Analyse with AI",
    sym_result_title: "AI Analysis Results",
    sym_placeholder: "Select symptoms and click Analyse to get AI-powered condition suggestions.",
    sym_analysing: "🔬 Analysing symptoms...",
    sym_disclaimer: "⚠️ This is an AI-based analysis for informational purposes only. It is NOT a medical diagnosis. Please consult a qualified doctor for proper evaluation and treatment.",
    db_label: "Medical encyclopedia", db_title: "Disease Database",
    db_sub: "Explore our comprehensive database of diseases, conditions, and treatments.",
    db_placeholder: "Search diseases, conditions, symptoms...", db_btn: "Search",
    consult_label: "Expert care", consult_title: "Doctor Consulting",
    consult_sub: "Connect with certified specialists for instant video or chat consultations.",
    avail_now: "Available now", book_btn: "Book Consultation",
    hosp_label: "Find care near you", hosp_title: "Nearby Hospitals",
    hosp_sub: "Live map of hospitals, clinics, and pharmacies near your current location.",
    map_all: "All", map_hosp: "🏥 Hospitals", map_clinic: "🏨 Clinics",
    map_pharma: "💊 Pharmacies", map_locate: "📍 My Location",
    bmi_label: "Body metrics", bmi_title: "BMI Calculator",
    bmi_sub: "Calculate your Body Mass Index and understand what it means for your health.",
    metric_btn: "Metric (kg/cm)", imperial_btn: "Imperial (lb/in)",
    weight_label: "Weight (kg)", height_label: "Height (cm)",
    age_label: "Age", gender_label: "Gender",
    gender_male: "Male", gender_female: "Female",
    calc_btn: "Calculate BMI", bmi_enter: "Enter your details and click Calculate",
    bmi_under: "Underweight", bmi_normal: "Normal weight", bmi_over: "Overweight", bmi_obese: "Obese",
    scale_under: "Underweight", scale_normal: "Normal", scale_over: "Overweight", scale_obese: "Obese",
    chat_label: "Powered by AI", chat_title: "Ask Cure.ai",
    chat_sub: "Chat with our AI health assistant for personalised guidance, medication info, and general wellness advice.",
    chat_name: "Cure.ai Assistant", chat_status: "Online & Ready",
    chat_placeholder: "Ask about symptoms, medications, diet, exercise...",
    quick_title: "Quick Questions",
    q1:"Signs of diabetes?",q2:"Lower blood pressure",q3:"Heart-healthy foods",q4:"Daily water intake",q5:"COVID-19 symptoms",q6:"Better sleep tips",
    q1f:"What are signs of diabetes?",q2f:"How to lower blood pressure naturally?",q3f:"Best foods for heart health?",q4f:"How much water should I drink daily?",q5f:"What are COVID-19 symptoms?",q6f:"How to improve sleep quality?",
    emergency_title: "⚠️ Emergency?",
    emergency_desc: "Chest pain, difficulty breathing, or sudden numbness?",
    emergency_btn: "📞 Call 108 Now",
    modal_symptoms: "Common Symptoms", modal_treatment: "Treatment Options", modal_prevention: "Prevention",
    modal_disclaimer: "⚠️ Always consult a certified medical professional for diagnosis and treatment.",
    footer_features: "Features", footer_care: "Care", footer_info: "Info",
    footer_copy: "© 2026 Cure.ai — For informational purposes only. Always consult a qualified healthcare professional.",
    footer_made: "Made with ❤️ for better health",
    get_directions: "Get Directions ↗",
    you_are_here: "📍 You are here",
    chat_welcome: "👋 Hello! I'm your Cure.ai health assistant. I can help you understand symptoms, answer health questions, explain medications, and guide you toward the right care. How can I help you today?",
    symptom_cats: {
      "General":"General","Head & Neuro":"Head & Neuro","Respiratory":"Respiratory",
      "Digestive":"Digestive","Skin":"Skin","Musculoskeletal":"Musculoskeletal",
      "Cardiovascular":"Cardiovascular","Mental Health":"Mental Health"
    }
  },
  ta: {
    settings: "அமைப்புகள்",
    language: "🌐 மொழி",
    region: "📍 பகுதி",
    emergency_numbers: "இந்திய அவசர எண்கள்",
    settings_footer: "அமைப்புகள் தானாகவே சேமிக்கப்படும்",
    nav_home: "முகப்பு", nav_monitor: "கண்காணிப்பு", nav_symptoms: "அறிகுறி சோதனை",
    nav_diseases: "நோய்கள்", nav_consult: "ஆலோசனை", nav_hospitals: "மருத்துவமனைகள்",
    nav_bmi: "உடல் எடை குறியீடு", nav_ask: "AI கேளுங்கள்",
    hero_badge: "AI ஆல் இயங்கும் சுகாதார சேவை",
    hero_title: "உங்கள் அறிவார்ந்த <span class='accent'>சுகாதார</span> உதவியாளர்",
    hero_sub: "Cure.ai செயற்கை நுண்ணறிவையும் மருத்துவ நிபுணத்துவத்தையும் இணைத்து உங்கள் உடல்நலத்தை கண்காணிக்கிறது, அறிகுறிகளை பகுப்பாய்வு செய்கிறது மற்றும் மருத்துவர்களுடன் இணைக்கிறது.",
    hero_btn1: "அறிகுறிகளை சோதிக்கவும்", hero_btn2: "மருத்துவரிடம் பேசுங்கள்",
    stat1_label: "கண்காணிக்கப்படும் நோய்கள்", stat2_label: "ஆன்லைன் மருத்துவர்கள்", stat3_label: "AI துல்லியம்",
    feat_label: "தேவையான அனைத்தும்", feat_title: "முழுமையான சுகாதார தளம்",
    feat1_title: "உடல்நல கண்காணிப்பு", feat1_desc: "உடல் அளவுகளை கண்காணிக்கவும், தரவை பதிவு செய்யவும், AI நுண்ணறிவு பெறவும்.",
    feat2_title: "அறிகுறி பகுப்பாய்வு", feat2_desc: "வகைப்படுத்தப்பட்ட அட்டவணையில் அறிகுறிகளை தேர்ந்தெடுக்கவும். AI 10,000+ நிலைமைகளை ஆய்வு செய்யும்.",
    feat3_title: "நோய் தரவுத்தளம்", feat3_desc: "நோய்கள் பற்றிய விரிவான கலைக்களஞ்சியம்: காரணங்கள், அறிகுறிகள், சிகிச்சை, தடுப்பு.",
    feat4_title: "மருத்துவர் ஆலோசனை", feat4_desc: "சான்றளிக்கப்பட்ட நிபுணர்களுடன் உடனடி வீடியோ அல்லது அரட்டை ஆலோசனை பெறுங்கள்.",
    feat5_title: "அருகிலுள்ள மருத்துவமனைகள்", feat5_desc: "உங்கள் இடத்திற்கு அருகில் உள்ள மருத்துவமனைகள், கிளினிக்குகள் மற்றும் மருந்தகங்களின் நேரடி வரைபடம்.",
    feat6_title: "உடல் எடை குறியீடு கணிப்பான்", feat6_desc: "உங்கள் BMI கணக்கிட்டு தனிப்பயனாக்கப்பட்ட ஊட்டச்சத்து வழிகாட்டுதல் பெறுங்கள்.",
    monitor_label: "நிகழ்நேர கண்காணிப்பு", monitor_title: "உடல்நல கண்காணிப்பு",
    monitor_sub: "உங்கள் தினசரி உடல் அளவுகளை பதிவு செய்யுங்கள். AI போக்குகளை கண்காணித்து எச்சரிக்கைகளை வழங்கும்.",
    monitor_today: "இன்றைய உடல் அளவுகள்", monitor_log: "புதிய அளவை பதிவு செய்யவும்",
    vital_hr: "❤️ இதய துடிப்பு", vital_bp: "🩸 இரத்த அழுத்தம்", vital_temp: "🌡️ உடல் வெப்பநிலை",
    vital_spo2: "💨 ஆக்சிஜன் (SpO2)", vital_weight: "⚖️ எடை",
    label_hr: "இதய துடிப்பு (bpm)", label_bp: "இரத்த அழுத்தம் (சிஸ்டோலிக்)",
    label_temp: "வெப்பநிலை (°F)", label_weight: "எடை (கிலோ)",
    log_btn: "பதிவு செய்", log_success: "✓ வெற்றிகரமாக பதிவாகியது!",
    sym_label: "AI நோய் கண்டறிதல்", sym_title: "அறிகுறி பகுப்பாய்வு",
    sym_sub: "வகைப்படுத்தப்பட்ட அட்டவணையில் உங்கள் அறிகுறிகளை தேர்ந்தெடுக்கவும். AI நிலைமைகளை பரிந்துரைக்கும்.",
    sym_selected: "தேர்ந்தெடுத்த அறிகுறிகள்:", sym_analyze: "🔬 AI யால் பகுப்பாய்வு செய்",
    sym_result_title: "AI பகுப்பாய்வு முடிவுகள்",
    sym_placeholder: "அறிகுறிகளை தேர்ந்தெடுத்து பகுப்பாய்வு செய்ய கிளிக் செய்யுங்கள்.",
    sym_analysing: "🔬 அறிகுறிகளை பகுப்பாய்வு செய்கிறது...",
    sym_disclaimer: "⚠️ இது AI அடிப்படையிலான தகவல் மட்டுமே. இது மருத்துவ நோய் கண்டறிதல் அல்ல. சரியான மதிப்பீட்டிற்கு தகுதிவாய்ந்த மருத்துவரை அணுகவும்.",
    db_label: "மருத்துவ கலைக்களஞ்சியம்", db_title: "நோய் தரவுத்தளம்",
    db_sub: "நோய்கள், நிலைமைகள் மற்றும் சிகிச்சைகளின் விரிவான தரவுத்தளத்தை ஆராயுங்கள்.",
    db_placeholder: "நோய்கள், நிலைமைகள், அறிகுறிகளை தேடுங்கள்...", db_btn: "தேடு",
    consult_label: "நிபுணர் சேவை", consult_title: "மருத்துவர் ஆலோசனை",
    consult_sub: "சான்றளிக்கப்பட்ட நிபுணர்களுடன் உடனடி வீடியோ அல்லது அரட்டை ஆலோசனை பெறுங்கள்.",
    avail_now: "இப்போது கிடைக்கிறார்", book_btn: "ஆலோசனை பதிவு செய்யவும்",
    hosp_label: "அருகில் சேவை கண்டுபிடிக்கவும்", hosp_title: "அருகிலுள்ள மருத்துவமனைகள்",
    hosp_sub: "உங்கள் தற்போதைய இடத்திற்கு அருகில் உள்ள மருத்துவமனைகள், கிளினிக்குகள் மற்றும் மருந்தகங்களின் நேரடி வரைபடம்.",
    map_all: "அனைத்தும்", map_hosp: "🏥 மருத்துவமனைகள்", map_clinic: "🏨 கிளினிக்குகள்",
    map_pharma: "💊 மருந்தகங்கள்", map_locate: "📍 என் இடம்",
    bmi_label: "உடல் அளவீடுகள்", bmi_title: "உடல் எடை குறியீடு கணிப்பான்",
    bmi_sub: "உங்கள் BMI கணக்கிட்டு அது உங்கள் உடல்நலத்திற்கு என்ன அர்த்தம் என்று புரிந்துகொள்ளுங்கள்.",
    metric_btn: "மெட்ரிக் (கிலோ/செ.மீ)", imperial_btn: "இம்பீரியல் (பவுண்ட்/அங்குலம்)",
    weight_label: "எடை (கிலோ)", height_label: "உயரம் (செ.மீ)",
    age_label: "வயது", gender_label: "பாலினம்",
    gender_male: "ஆண்", gender_female: "பெண்",
    calc_btn: "BMI கணக்கிடு", bmi_enter: "விவரங்களை உள்ளிட்டு கணக்கிடு கிளிக் செய்யுங்கள்",
    bmi_under: "எடை குறைவு", bmi_normal: "சாதாரண எடை", bmi_over: "அதிக எடை", bmi_obese: "பருமன்",
    scale_under: "எடை குறைவு", scale_normal: "சாதாரண", scale_over: "அதிக எடை", scale_obese: "பருமன்",
    chat_label: "AI ஆல் இயக்கப்படுகிறது", chat_title: "Cure.ai கேளுங்கள்",
    chat_sub: "தனிப்பயனாக்கப்பட்ட வழிகாட்டுதல், மருந்து தகவல்கள் மற்றும் பொது ஆரோக்கிய ஆலோசனைகளுக்கு AI உதவியாளரிடம் அரட்டை அடிக்கவும்.",
    chat_name: "Cure.ai உதவியாளர்", chat_status: "ஆன்லைன் & தயார்",
    chat_placeholder: "அறிகுறிகள், மருந்துகள், உணவு, உடற்பயிற்சி பற்றி கேளுங்கள்...",
    quick_title: "விரைவு கேள்விகள்",
    q1:"நீரிழிவு அறிகுறிகள்?",q2:"இரத்த அழுத்தம் குறைக்க",q3:"இதயத்திற்கு நல்ல உணவு",q4:"தினசரி தண்ணீர் அளவு",q5:"COVID-19 அறிகுறிகள்",q6:"தூக்கம் மேம்பட",
    q1f:"நீரிழிவு நோயின் அறிகுறிகள் என்ன?",q2f:"இரத்த அழுத்தத்தை இயற்கையாக எப்படி குறைப்பது?",q3f:"இதய ஆரோக்கியத்திற்கு சிறந்த உணவுகள் என்ன?",q4f:"தினசரி எவ்வளவு தண்ணீர் குடிக்க வேண்டும்?",q5f:"COVID-19 அறிகுறிகள் என்ன?",q6f:"தூக்கத்தின் தரத்தை எவ்வாறு மேம்படுத்துவது?",
    emergency_title: "⚠️ அவசரநிலையா?",
    emergency_desc: "நெஞ்சு வலி, சுவாசிக்க சிரமம் அல்லது திடீர் மரத்துப்போதல்?",
    emergency_btn: "📞 108 அழைக்கவும்",
    modal_symptoms: "பொதுவான அறிகுறிகள்", modal_treatment: "சிகிச்சை விருப்பங்கள்", modal_prevention: "தடுப்பு",
    modal_disclaimer: "⚠️ நோய் கண்டறிதல் மற்றும் சிகிச்சைக்கு எப்போதும் சான்றளிக்கப்பட்ட மருத்துவ நிபுணரை அணுகவும்.",
    footer_features: "அம்சங்கள்", footer_care: "சேவை", footer_info: "தகவல்",
    footer_copy: "© 2026 Cure.ai — தகவல் நோக்கங்களுக்கு மட்டுமே. எப்போதும் தகுதிவாய்ந்த சுகாதார நிபுணரை அணுகவும்.",
    footer_made: "சிறந்த ஆரோக்கியத்திற்காக ❤️ உடன் உருவாக்கப்பட்டது",
    get_directions: "வழிகாட்டுதல் பெறுங்கள் ↗",
    you_are_here: "📍 நீங்கள் இங்கே இருக்கிறீர்கள்",
    chat_welcome: "👋 வணக்கம்! நான் உங்கள் Cure.ai உடல்நல உதவியாளர். அறிகுறிகளை புரிந்துகொள்ள, சுகாதார கேள்விகளுக்கு பதிலளிக்க, மருந்துகளை விளக்க உதவுவேன். இன்று எப்படி உதவட்டுமா?",
    symptom_cats: {
      "General":"பொது","Head & Neuro":"தலை & நரம்பியல்","Respiratory":"சுவாச",
      "Digestive":"செரிமான","Skin":"தோல்","Musculoskeletal":"தசை எலும்பு",
      "Cardiovascular":"இதயம் & இரத்தம்","Mental Health":"மன நலம்"
    }
  }
};

const regionData = {
  TN: { name:"Tamil Nadu", center:[11.1271,78.6569], zoom:7,
    hospitals:[
      {lat:9.9252,lng:78.1198,name:"Madurai Government Hospital",type:"hospital",info:"24/7 அவசர சேவை • பொது மருத்துவம்"},
      {lat:13.0827,lng:80.2707,name:"Stanley Medical College Hospital, Chennai",type:"hospital",info:"24/7 அவசர சேவை • சிறப்பு சேவைகள்"},
      {lat:10.7905,lng:78.7047,name:"Thanjavur Medical College Hospital",type:"hospital",info:"24/7 அவசர சேவை"},
      {lat:11.6643,lng:78.1460,name:"Salem Government Hospital",type:"hospital",info:"அவசர சேவை • பொது மருத்துவம்"},
      {lat:9.5127,lng:77.6369,name:"Srivilliputhur Govt Hospital",type:"hospital",info:"24/7 அவசர சேவை"},
      {lat:9.5185,lng:77.6420,name:"Meenakshi Clinic",type:"clinic",info:"பொது மருத்துவம் • திங்கள்-சனி 9AM-6PM"},
      {lat:9.5070,lng:77.6310,name:"Apollo Pharmacy",type:"pharmacy",info:"24 மணி நேரமும் திறந்திருக்கும்"},
      {lat:11.0168,lng:76.9558,name:"Coimbatore Medical College Hospital",type:"hospital",info:"24/7 அவசர சேவை"},
      {lat:8.7139,lng:77.7567,name:"Tirunelveli Medical College",type:"hospital",info:"24/7 அவசர சேவை"},
    ],
    emergency:[
      {num:"108",label:"Ambulance / Ambulance"},
      {num:"104",label:"Health Helpline / ஆரோக்கிய"},
      {num:"100",label:"Police / காவல்"},
      {num:"101",label:"Fire / தீயணைப்பு"},
      {num:"1800-425-4425",label:"AYUSH Helpline"},
      {num:"14410",label:"NHA / தேசிய சுகாதாரம்"},
    ]
  },
  MH: { name:"Maharashtra", center:[19.7515,75.7139], zoom:7,
    hospitals:[
      {lat:19.0760,lng:72.8777,name:"KEM Hospital, Mumbai",type:"hospital",info:"24/7 Emergency • Multi-specialty"},
      {lat:18.5204,lng:73.8567,name:"Sassoon General Hospital, Pune",type:"hospital",info:"24/7 Emergency"},
      {lat:21.1458,lng:79.0882,name:"Government Medical College, Nagpur",type:"hospital",info:"24/7 Emergency"},
      {lat:19.0760,lng:72.8900,name:"Hinduja Hospital",type:"hospital",info:"Private • 24/7"},
      {lat:18.5204,lng:73.8700,name:"Jehangir Hospital, Pune",type:"clinic",info:"Multi-specialty Clinic"},
      {lat:19.0760,lng:72.8650,name:"MedPlus Pharmacy Mumbai",type:"pharmacy",info:"Open 8AM-10PM"},
    ],
    emergency:[
      {num:"108",label:"Ambulance"},
      {num:"104",label:"Health Helpline"},
      {num:"100",label:"Police"},
      {num:"101",label:"Fire"},
      {num:"1916",label:"Maharashtra CM Helpline"},
      {num:"14410",label:"NHA Helpline"},
    ]
  },
  KA: { name:"Karnataka", center:[15.3173,75.7139], zoom:7,
    hospitals:[
      {lat:12.9716,lng:77.5946,name:"Bowring & Lady Curzon Hospital, Bengaluru",type:"hospital",info:"24/7 Emergency"},
      {lat:12.9716,lng:77.6000,name:"Victoria Hospital, Bengaluru",type:"hospital",info:"24/7 Emergency • Trauma Centre"},
      {lat:12.2958,lng:76.6394,name:"K R Hospital, Mysuru",type:"hospital",info:"24/7 Emergency"},
      {lat:15.3647,lng:75.1240,name:"KIMS Hospital, Hubballi",type:"hospital",info:"24/7 Emergency"},
      {lat:12.9716,lng:77.5800,name:"Manipal Hospital, Bengaluru",type:"clinic",info:"Multi-specialty"},
      {lat:12.9716,lng:77.6100,name:"Apollo Pharmacy Bengaluru",type:"pharmacy",info:"Open 24 hours"},
    ],
    emergency:[
      {num:"108",label:"Ambulance"},
      {num:"104",label:"Health Helpline"},
      {num:"100",label:"Police"},
      {num:"112",label:"Emergency Response"},
      {num:"1800-425-9999",label:"Karnataka Health"},
      {num:"14410",label:"NHA Helpline"},
    ]
  },
  KE: { name:"Kerala", center:[10.8505,76.2711], zoom:7,
    hospitals:[
      {lat:8.5241,lng:76.9366,name:"Government Medical College, Thiruvananthapuram",type:"hospital",info:"24/7 Emergency"},
      {lat:9.9312,lng:76.2673,name:"Medical College Hospital, Kochi",type:"hospital",info:"24/7 Emergency"},
      {lat:11.2588,lng:75.7804,name:"Government Medical College, Kozhikode",type:"hospital",info:"24/7 Emergency"},
      {lat:8.5241,lng:76.9500,name:"KIMS Hospital, Trivandrum",type:"clinic",info:"Multi-specialty"},
      {lat:9.9312,lng:76.2800,name:"Lakeshore Hospital, Kochi",type:"hospital",info:"24/7 Emergency"},
      {lat:9.9312,lng:76.2500,name:"MedPlus Pharmacy Kochi",type:"pharmacy",info:"Open 8AM-10PM"},
    ],
    emergency:[
      {num:"108",label:"Ambulance"},
      {num:"104",label:"Health Helpline"},
      {num:"100",label:"Police"},
      {num:"1056",label:"Kerala Health"},
      {num:"0471-2552056",label:"Health Dept TVM"},
      {num:"14410",label:"NHA Helpline"},
    ]
  },
  DL: { name:"Delhi NCR", center:[28.6139,77.2090], zoom:10,
    hospitals:[
      {lat:28.6139,lng:77.2090,name:"AIIMS, New Delhi",type:"hospital",info:"24/7 Emergency • Premier Institute"},
      {lat:28.6517,lng:77.2219,name:"Safdarjung Hospital",type:"hospital",info:"24/7 Emergency"},
      {lat:28.6692,lng:77.2239,name:"Ram Manohar Lohia Hospital",type:"hospital",info:"24/7 Emergency"},
      {lat:28.5355,lng:77.3910,name:"Fortis Hospital, Noida",type:"hospital",info:"24/7 Emergency"},
      {lat:28.6139,lng:77.2200,name:"Apollo Pharmacy Delhi",type:"pharmacy",info:"Open 24 hours"},
      {lat:28.6300,lng:77.2100,name:"Max Clinic Delhi",type:"clinic",info:"Multi-specialty"},
    ],
    emergency:[
      {num:"108",label:"Ambulance"},
      {num:"102",label:"Delhi Ambulance"},
      {num:"100",label:"Police"},
      {num:"1031",label:"Delhi Health"},
      {num:"011-23978046",label:"AIIMS Emergency"},
      {num:"14410",label:"NHA Helpline"},
    ]
  },
  TG: { name:"Telangana", center:[18.1124,79.0193], zoom:7,
    hospitals:[
      {lat:17.3850,lng:78.4867,name:"Osmania General Hospital, Hyderabad",type:"hospital",info:"24/7 Emergency"},
      {lat:17.3850,lng:78.5000,name:"Gandhi Hospital, Hyderabad",type:"hospital",info:"24/7 Emergency • COVID Centre"},
      {lat:17.4000,lng:78.4700,name:"Niloufer Hospital",type:"hospital",info:"24/7 Emergency • Paediatrics"},
      {lat:17.4126,lng:78.4071,name:"KIMS Hospitals, Hyderabad",type:"clinic",info:"Multi-specialty"},
      {lat:17.3850,lng:78.5100,name:"Apollo Pharmacy Hyderabad",type:"pharmacy",info:"Open 24 hours"},
      {lat:17.3600,lng:78.4800,name:"Care Hospital, Hyderabad",type:"hospital",info:"24/7 Emergency"},
    ],
    emergency:[
      {num:"108",label:"Ambulance"},
      {num:"104",label:"Health Helpline"},
      {num:"100",label:"Police"},
      {num:"1902",label:"TS CM Helpline"},
      {num:"040-23453456",label:"TS Health Dept"},
      {num:"14410",label:"NHA Helpline"},
    ]
  }
};

function t(key) { return translations[currentLang][key] || translations['en'][key] || key; }

function applyTranslations() {
  const L = translations[currentLang];
  const isTamil = currentLang === 'ta';
  document.documentElement.lang = currentLang;
  document.body.style.fontFamily = isTamil ? "'Noto Sans Tamil','DM Sans',sans-serif" : "'DM Sans',sans-serif";

  // Nav links
  const navLinks = document.querySelectorAll('.nav-links a:not(.nav-cta)');
  const navKeys = ['nav_home','nav_monitor','nav_symptoms','nav_diseases','nav_consult','nav_hospitals','nav_bmi'];
  navLinks.forEach((a,i) => { if(navKeys[i]) a.textContent = L[navKeys[i]] || a.textContent; });
  const ctaLink = document.querySelector('.nav-cta');
  if(ctaLink) ctaLink.textContent = L.nav_ask;

  // Settings panel translations
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if(L[key]) el.textContent = L[key];
  });

  // Hero
  const heroBadge = document.querySelector('.hero-badge');
  if(heroBadge) { heroBadge.innerHTML = `<span></span>${L.hero_badge}`; }
  const heroTitle = document.querySelector('h1');
  if(heroTitle) heroTitle.innerHTML = L.hero_title;
  const heroSub = document.querySelector('.hero-sub');
  if(heroSub) heroSub.textContent = L.hero_sub;
  const heroBtn1 = document.querySelector('.hero-btns .btn-primary');
  if(heroBtn1) heroBtn1.textContent = L.hero_btn1;
  const heroBtn2 = document.querySelector('.hero-btns .btn-outline');
  if(heroBtn2) heroBtn2.textContent = L.hero_btn2;

  // Stats
  const statLabels = document.querySelectorAll('.stat-label');
  if(statLabels[0]) statLabels[0].textContent = L.stat1_label;
  if(statLabels[1]) statLabels[1].textContent = L.stat2_label;
  if(statLabels[2]) statLabels[2].textContent = L.stat3_label;

  // Features section
  setTxt('.features-grid', [['.section-label',L.feat_label],['.section-title',L.feat_title]], true, document);
  const sl = document.querySelectorAll('section');
  sl.forEach(sec => {
    const lbl = sec.querySelector('.section-label');
    const ttl = sec.querySelector('.section-title');
    const sub = sec.querySelector('.section-sub');
    const id = sec.id;
    if(id==='monitor'){ if(lbl) lbl.textContent=L.monitor_label; if(ttl) ttl.textContent=L.monitor_title; if(sub) sub.textContent=L.monitor_sub; }
    if(id==='symptoms'){ if(lbl) lbl.textContent=L.sym_label; if(ttl) ttl.textContent=L.sym_title; if(sub) sub.textContent=L.sym_sub; }
    if(id==='diseases'){ if(lbl) lbl.textContent=L.db_label; if(ttl) ttl.textContent=L.db_title; if(sub) sub.textContent=L.db_sub; }
    if(id==='consult'){ if(lbl) lbl.textContent=L.consult_label; if(ttl) ttl.textContent=L.consult_title; if(sub) sub.textContent=L.consult_sub; }
    if(id==='hospitals'){ if(lbl) lbl.textContent=L.hosp_label; if(ttl) ttl.textContent=L.hosp_title; if(sub) sub.textContent=L.hosp_sub; }
    if(id==='bmi'){ if(lbl) lbl.textContent=L.bmi_label; if(ttl) ttl.textContent=L.bmi_title; if(sub) sub.textContent=L.bmi_sub; }
    if(id==='ai-chat'){ if(lbl) lbl.textContent=L.chat_label; if(ttl) ttl.textContent=L.chat_title; if(sub) sub.textContent=L.chat_sub; }
  });

  // Feature cards
  const fcTitles = document.querySelectorAll('.feature-title');
  const fcDescs = document.querySelectorAll('.feature-desc');
  const fcT = [L.feat1_title,L.feat2_title,L.feat3_title,L.feat4_title,L.feat5_title,L.feat6_title];
  const fcD = [L.feat1_desc,L.feat2_desc,L.feat3_desc,L.feat4_desc,L.feat5_desc,L.feat6_desc];
  fcTitles.forEach((el,i) => { if(fcT[i]) el.textContent=fcT[i]; });
  fcDescs.forEach((el,i) => { if(fcD[i]) el.textContent=fcD[i]; });

  // Monitor
  const mTitles = document.querySelectorAll('.monitor-title');
  if(mTitles[0]) mTitles[0].textContent = L.monitor_today;
  if(mTitles[1]) mTitles[1].textContent = L.monitor_log;
  const vNames = document.querySelectorAll('.vital-name');
  const vNKeys = ['vital_hr','vital_bp','vital_temp','vital_spo2','vital_weight'];
  vNames.forEach((el,i)=>{ if(vNKeys[i]) el.innerHTML = L[vNKeys[i]] || el.innerHTML; });
  const formLabels = document.querySelectorAll('#monitor .form-label');
  const fLKeys = ['label_hr','label_bp','label_temp','label_weight'];
  formLabels.forEach((el,i)=>{ if(fLKeys[i]) el.textContent=L[fLKeys[i]]; });
  const miniBtns = document.querySelectorAll('.mini-btn');
  miniBtns.forEach(b => b.textContent = L.log_btn);

  // Symptom checker
  const selLbl = document.querySelector('.selected-label');
  if(selLbl) { selLbl.innerHTML = `${L.sym_selected} <span id="selCount">${selectedSymptoms.length}</span>`; }
  const analyzeBtn = document.querySelector('.analyze-btn');
  if(analyzeBtn) analyzeBtn.textContent = L.sym_analyze;
  const resultTitle = document.querySelector('.result-title');
  if(resultTitle) resultTitle.textContent = L.sym_result_title;
  const phEl = document.querySelector('.result-placeholder p');
  if(phEl) phEl.textContent = L.sym_placeholder;

  // Disease DB
  const dbInp = document.getElementById('diseaseSearch');
  if(dbInp) dbInp.placeholder = L.db_placeholder;
  const dbSBtn = document.querySelector('.db-search-btn');
  if(dbSBtn) dbSBtn.textContent = L.db_btn;

  // Doctors
  const bookBtns = document.querySelectorAll('.book-btn');
  bookBtns.forEach(b => b.textContent = L.book_btn);
  const availTexts = document.querySelectorAll('.availability');
  availTexts.forEach(el => {
    const dot = el.querySelector('.avail-dot');
    if(dot && dot.classList.contains('online')) { el.innerHTML = `<div class="avail-dot online"></div>${L.avail_now}`; }
  });

  // Map buttons
  const mapBtns = document.querySelectorAll('.map-btn');
  const mapKeys = ['map_all','map_hosp','map_clinic','map_pharma','map_locate'];
  mapBtns.forEach((b,i) => { if(mapKeys[i]) b.textContent = L[mapKeys[i]]; });

  // BMI
  const metricBtn = document.getElementById('metricBtn');
  const imperialBtn = document.getElementById('imperialBtn');
  if(metricBtn) metricBtn.textContent = L.metric_btn;
  if(imperialBtn) imperialBtn.textContent = L.imperial_btn;
  const wLbl = document.getElementById('weightLabel');
  const hLbl = document.getElementById('heightLabel');
  if(wLbl) wLbl.textContent = L.weight_label;
  if(hLbl) hLbl.textContent = L.height_label;
  const aLbl = document.querySelector('#bmi .form-label:nth-of-type(3)');
  const gLbl = document.querySelector('#bmi .form-label:nth-of-type(4)');
  document.querySelectorAll('#bmi .form-label').forEach(el => {
    if(el.textContent.includes('Age')||el.textContent.includes('வயது')) el.textContent=L.age_label;
    if(el.textContent.includes('Gender')||el.textContent.includes('பாலினம்')) el.textContent=L.gender_label;
  });
  const calcBtn = document.querySelector('.calc-btn');
  if(calcBtn) calcBtn.textContent = L.calc_btn;
  const genderSel = document.getElementById('bmiGender');
  if(genderSel) { genderSel.options[0].text=L.gender_male; genderSel.options[1].text=L.gender_female; }
  const bmiResultEl = document.getElementById('bmiResult');
  if(bmiResultEl && bmiResultEl.querySelector('.bmi-enter-msg')) bmiResultEl.querySelector('.bmi-enter-msg').textContent = L.bmi_enter;

  // Chat
  const chatNameEl = document.querySelector('.chat-name');
  if(chatNameEl) chatNameEl.textContent = L.chat_name;
  const chatInp = document.getElementById('chatInput');
  if(chatInp) chatInp.placeholder = L.chat_placeholder;
  const quickTitle = document.querySelector('.quick-title');
  if(quickTitle) quickTitle.textContent = L.quick_title;
  const quickChips = document.querySelectorAll('.quick-chip');
  const qKeys = ['q1','q2','q3','q4','q5','q6'];
  quickChips.forEach((c,i) => { if(qKeys[i]) c.textContent = L[qKeys[i]]; c.onclick = () => askQuick(L[qKeys[i]+'f']||c.textContent); });
  const emTitle = document.querySelector('.chat-sidebar .quick-card:last-child .quick-title');
  if(emTitle) emTitle.innerHTML = L.emergency_title;
  const emDesc = document.querySelector('.chat-sidebar .quick-card:last-child p');
  if(emDesc) emDesc.textContent = L.emergency_desc;
  const emBtn = document.querySelector('.chat-sidebar .quick-card:last-child button');
  if(emBtn) emBtn.textContent = L.emergency_btn;

  // Footer
  const fCols = document.querySelectorAll('.footer-col h4');
  if(fCols[0]) fCols[0].textContent = L.footer_features;
  if(fCols[1]) fCols[1].textContent = L.footer_care;
  if(fCols[2]) fCols[2].textContent = L.footer_info;
  const fNotes = document.querySelectorAll('.footer-note');
  if(fNotes[0]) fNotes[0].textContent = L.footer_copy;
  if(fNotes[1]) fNotes[1].textContent = L.footer_made;

  // Re-init symptom checker categories
  initSymptomChecker();
}

function setTxt(scope, pairs, isParent, ctx) {}

function openSettings() {
  document.getElementById('settingsOverlay').classList.add('open');
  renderEmergency();
}
function closeSettings() { document.getElementById('settingsOverlay').classList.remove('open'); }

function setLanguage(lang) {
  currentLang = lang;
  document.getElementById('langEN').classList.toggle('active', lang==='en');
  document.getElementById('langTA').classList.toggle('active', lang==='ta');
  document.getElementById('checkEN').style.opacity = lang==='en' ? '1' : '0';
  document.getElementById('checkTA').style.opacity = lang==='ta' ? '1' : '0';
  applyTranslations();
}

function setRegion(code) {
  currentRegion = code;
  ['TN','MH','KA','KE','DL','TG'].forEach(r => {
    const el = document.getElementById('region'+r);
    const chk = document.getElementById('check'+r);
    if(el) el.classList.toggle('active', r===code);
    if(chk) chk.style.opacity = r===code ? '1' : '0';
  });
  renderEmergency();
  updateMapForRegion(code);
}

function renderEmergency() {
  const region = regionData[currentRegion];
  const grid = document.getElementById('emergencyGrid');
  if(!grid||!region) return;
  grid.innerHTML = region.emergency.map(e => `
    <div class="em-card">
      <div class="em-num">${e.num}</div>
      <div class="em-label">${e.label}</div>
    </div>`).join('');
}

let mapUserMarker = null;
function updateMapForRegion(code) {
  const region = regionData[code];
  if(!map||!region) return;
  // Remove old markers
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  if(mapUserMarker) { map.removeLayer(mapUserMarker); mapUserMarker=null; }

  map.setView(region.center, region.zoom);

  const icons2 = {
    hospital: L.divIcon({html:'<div style="background:#ff4d6d;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🏥</div>',iconSize:[32,32],iconAnchor:[16,16],className:''}),
    clinic: L.divIcon({html:'<div style="background:#4da6ff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">🏨</div>',iconSize:[32,32],iconAnchor:[16,16],className:''}),
    pharmacy: L.divIcon({html:'<div style="background:#00C896;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">💊</div>',iconSize:[32,32],iconAnchor:[16,16],className:''}),
  };

  const dirLabel = t('get_directions');
  region.hospitals.forEach(p => {
    const m = L.marker([p.lat,p.lng],{icon:icons2[p.type]}).addTo(map);
    m._type = p.type;
    m.bindPopup(`<b>${p.name}</b><br><small>${p.info}</small><br><a href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}" target="_blank" style="color:#00C896">${dirLabel}</a>`);
    markers.push(m);
  });
}

// Override initMap to use region data
const _origInitMap = initMap;

window.onload = () => {
  initSymptomChecker();
  initDiseaseDB();
  initMapWithRegion();
  document.getElementById('regionTN').classList.add('active');
  document.getElementById('checkTN').style.opacity = '1';
  document.getElementById('checkEN').style.opacity = '1';
  renderEmergency();
};

function initMapWithRegion() {
  const region = regionData['TN'];
  map = L.map('map').setView(region.center, 7);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  updateMapForRegion('TN');
}

// Active nav on scroll
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.scrollY;
  sections.forEach(s => {
    if (scrollY >= s.offsetTop - 80 && scrollY < s.offsetTop + s.offsetHeight) {
      document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href')==='#'+s.id);
      });
    }
  });
});

/* ── LOGIN PAGE LOGIC ── */
let currentTab = 'signin';

function switchTab(tab) {
  currentTab = tab;
  const isRegister = tab === 'register';

  document.getElementById('tabSignin').classList.toggle('active', !isRegister);
  document.getElementById('tabRegister').classList.toggle('active', isRegister);

  // Toggle register-only fields visibility via parent class
  const wrap = document.getElementById('loginFormWrap');
  wrap.classList.toggle('tab-register', isRegister);

  // Update copy
  document.querySelector('.lf-title').textContent = isRegister ? 'Create your account' : 'Welcome back';
  document.querySelector('.lf-desc').textContent = isRegister ? 'Join Cure.ai for free — no credit card needed.' : 'Sign in to your Cure.ai account';
  document.getElementById('loginSubmitBtn').textContent = isRegister ? 'Create Account' : 'Sign In';
  document.getElementById('rowRemember').style.display = isRegister ? 'none' : '';
  document.getElementById('authFooterNote').innerHTML = isRegister
    ? 'Already have an account? <a href="#" onclick="switchTab(\'signin\');return false">Sign in</a>'
    : "Don't have an account? <a href=\"#\" onclick=\"switchTab('register');return false\">Create one free</a>";

  // Clear errors
  clearErrors();
  document.getElementById('loginSuccess').classList.remove('show');
}

function clearErrors() {
  document.querySelectorAll('.lform-group.error').forEach(el => el.classList.remove('error'));
}

function setError(fieldId, errId) {
  document.getElementById(fieldId).closest('.lform-group').classList.add('error');
}

function togglePwd(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
  else { inp.type = 'password'; btn.textContent = '👁️'; }
}

function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

function handleAuth() {
  clearErrors();
  let valid = true;

  const email = document.getElementById('loginEmail').value.trim();
  const pwd = document.getElementById('loginPwd').value;

  if (!validateEmail(email)) { setError('loginEmail','errEmail'); valid = false; }
  if (pwd.length < 6) { setError('loginPwd','errPwd'); valid = false; }

  if (currentTab === 'register') {
    const name = document.getElementById('regName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const confirm = document.getElementById('regConfirm').value;
    if (!name) { setError('regName','errName'); valid = false; }
    if (phone.length < 8) { setError('regPhone','errPhone'); valid = false; }
    if (confirm !== pwd) { setError('regConfirm','errConfirm'); valid = false; }
  }

  if (!valid) return;

  // Simulate auth
  const btn = document.getElementById('loginSubmitBtn');
  btn.textContent = currentTab === 'register' ? 'Creating account…' : 'Signing in…';
  btn.disabled = true;
  btn.style.opacity = '0.7';

  setTimeout(() => {
    const successEl = document.getElementById('loginSuccess');
    const msgEl = document.getElementById('loginSuccessMsg');
    msgEl.textContent = currentTab === 'register'
      ? '🎉 Account created! Welcome to Cure.ai!'
      : 'Welcome back! Loading your dashboard…';
    successEl.classList.add('show');

    setTimeout(() => {
      document.getElementById('loginPage').classList.add('hidden');
      document.body.style.overflow = '';
    }, 1200);
  }, 1100);
}

function socialLogin(provider) {
  const btn = document.getElementById('loginSubmitBtn');
  const successEl = document.getElementById('loginSuccess');
  const msgEl = document.getElementById('loginSuccessMsg');
  msgEl.textContent = `Signing in with ${provider}…`;
  successEl.classList.add('show');
  setTimeout(() => {
    document.getElementById('loginPage').classList.add('hidden');
    document.body.style.overflow = '';
  }, 1200);
}

function showForgot() {
  const emailVal = document.getElementById('loginEmail').value.trim();
  if (!validateEmail(emailVal)) {
    alert('Please enter your email address first, then click Forgot password.');
    document.getElementById('loginEmail').focus();
    return;
  }
  const successEl = document.getElementById('loginSuccess');
  const msgEl = document.getElementById('loginSuccessMsg');
  msgEl.textContent = `✉️ Password reset link sent to ${emailVal}`;
  successEl.classList.add('show');
}

// Prevent main page scroll while login is showing
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('loginPage').classList.contains('hidden')) {
    document.body.style.overflow = 'hidden';
  }
});
