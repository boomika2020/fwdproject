let hospitalDB = JSON.parse(localStorage.getItem("clinical_core_db")) || [];
const systemLimits = { beds: 450, icu: 10, vent: 5 };

const staffRegistry = {
    "General Medicine": ["Dr. Arvind Swamy", "Dr. Meera Deshmukh", "Dr. Rajesh Malhotra"],
    "Pediatrics": ["Dr. Ananya Iyer", "Dr. Rohan Gupta", "Dr. Kavita Reddy"],
    "Diagnostics": ["Dr. Sunita Rao", "Dr. Vikram Sethi", "Dr. Amit Trivedi"],
    "Physiotherapy": ["Dr. Ishaan Sharma", "Dr. Sneha Kulkarni", "Sr. Lakshmi"],
    "Cardiology": ["Dr. Sanjay Dutt", "Dr. Priya Venkat", "Dr. Arjun Kapoor"],
    "Neurology": ["Dr. Vivek Oberoi", "Dr. Shalini Pandey", "Dr. Karthik Aryan"],
    "Emergency/ICU": ["Dr. Kabir Singh", "Dr. Pankaj Tripathi", "Dr. Preeti Sikka"]
};

function refreshUI() {
    const table = document.getElementById("masterTable");
    
    // Calculate Analytics
    let usedICU = hospitalDB.filter(x => x.res && x.res.includes("ICU")).length;
    let usedVent = hospitalDB.filter(x => x.res && x.res.includes("Ventilator")).length;
    let criticalCount = hospitalDB.filter(x => x.type === "CRITICAL").length;

    // Update Header Stats
    document.getElementById("statTotal").innerText = hospitalDB.length;
    document.getElementById("statBeds").innerText = systemLimits.beds - criticalCount;
    document.getElementById("statICU").innerText = (systemLimits.icu - usedICU).toString().padStart(2, '0');
    document.getElementById("statVent").innerText = (systemLimits.vent - usedVent).toString().padStart(2, '0');

    // Update Progress Bars (Course Outcome 4: DOM Style Manipulation)
    const icuRatio = (usedICU / systemLimits.icu) * 100;
    const ventRatio = (usedVent / systemLimits.vent) * 100;
    
    document.getElementById("icuBar").style.width = icuRatio + "%";
    document.getElementById("icuPercent").innerText = Math.round(icuRatio) + "%";
    document.getElementById("ventBar").style.width = ventRatio + "%";
    document.getElementById("ventPercent").innerText = Math.round(ventRatio) + "%";

    // Update Table (Course Outcome 2 & 4: Template Literals & DOM)
    table.innerHTML = hospitalDB.map((d, i) => `
        <tr>
            <td><strong>${d.name}</strong></td>
            <td>
                <span class="badge" style="background:${d.type === 'CRITICAL' ? '#fee2e2' : '#e0f2fe'}; 
                                           color:${d.type === 'CRITICAL' ? '#ef4444' : '#0ea5e9'}; 
                                           padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800;">
                    ${d.type}
                </span>
            </td>
            <td>${d.doc}</td>
            <td>
                ${d.type === 'CRITICAL' ? `<b>${d.res}</b>` : `<span style="color:#64748b">Slot: ${d.time}</span>`}
            </td>
            <td>
                <button onclick="terminate(${i})" style="color:#94a3b8; background:none; border:1px solid #e2e8f0; padding: 4px 12px; border-radius: 6px; cursor:pointer; font-size:11px">
                    RELEASE
                </button>
            </td>
        </tr>
    `).join('');
}

function filterDocs(prefix) {
    // prefix is either 'p' (standard) or 'res' (critical)
    const dept = document.getElementById(prefix + "Dept").value;
    const select = document.getElementById(prefix + "Doc");
    
    select.innerHTML = '<option value="">Select Staff</option>';
    
    if (staffRegistry[dept]) {
        staffRegistry[dept].forEach(n => {
            let o = document.createElement("option"); 
            o.value = n; 
            o.text = n; 
            select.add(o);
        });
    }
}

// Handle Critical Resource Form
document.getElementById("resourceForm").onsubmit = function(e) {
    e.preventDefault();
    const entry = {
        name: document.getElementById("resPatient").value,
        type: "CRITICAL",
        doc: document.getElementById("resDoc").value,
        res: document.getElementById("resType").value,
        time: "IMMEDIATE", // Critical cases are always immediate
        id: Date.now()
    };
    saveEntry(entry, e.target);
};

// Handle Standard Appointment Form
document.getElementById("appointmentForm").onsubmit = function(e) {
    e.preventDefault();
    const entry = {
        name: document.getElementById("pName").value,
        type: "STANDARD",
        doc: document.getElementById("pDoc").value,
        res: "N/A",
        time: document.getElementById("pTime").value, // Captures the 9:00 AM style slot
        id: Date.now()
    };
    saveEntry(entry, e.target);
};

function saveEntry(entry, form) {
    hospitalDB.push(entry);
    localStorage.setItem("clinical_core_db", JSON.stringify(hospitalDB));
    form.reset();
    refreshUI();
}

window.terminate = (i) => {
    // CO3: Array methods (splice)
    hospitalDB.splice(i, 1);
    localStorage.setItem("clinical_core_db", JSON.stringify(hospitalDB));
    refreshUI();
};

// Initial Load
refreshUI();