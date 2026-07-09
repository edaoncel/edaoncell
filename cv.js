function openModal(id) {
    const targetModal = document.getElementById(id);
    if (targetModal) {
        targetModal.classList.add('active');
        document.body.classList.add('modal-open');
    }
}

function closeModal(id) {
    const targetModal = document.getElementById(id);
    if (targetModal) {
        targetModal.classList.remove('active');
        if (!document.querySelector('.modal.active')) {
            document.body.classList.remove('modal-open');
        }
        const iframe = targetModal.querySelector('iframe');
        if (iframe) { iframe.src = iframe.src; }
    }
}

async function changeLanguage(lang) {
    try {
        const response = await fetch('lang.json');
        if (!response.ok) throw new Error('Dil dosyası yüklenemedi');
        
        const data = await response.json();
        const content = data[lang];

        const updateElement = (selector, value, isHTML = false, isId = false) => {
            const el = isId ? document.getElementById(selector) : document.querySelector(selector);
            if (el) {
                if (isHTML) el.innerHTML = value;
                else el.innerText = value;
            }
        };

        // 1. Temel Başlık ve Hakkımda
        updateElement('.cv-name', content.header_name);
        updateElement('.cv-title', content.header_title);
        updateElement('.lang-about-title', content.about_h2);
        updateElement('.lang-about-text', content.about_p);

        // 2. Eğitim Bölümü
        updateElement('.lang-edu-title', content.edu_h2);
        updateElement('.lang-edu-dept', content.edu_dept);
        updateElement('.lang-edu-pedagogy', content.edu_pedagogy);

        // 3. İş Deneyimi
        updateElement('.lang-exp-title', content.exp_h2);
        for(let i=1; i<=5; i++) {
            updateElement(`exp-${i}`, content[`exp_${i}`], true, true);
        }

        // 4. Teknik Yetkinlikler
        updateElement('.lang-skills-title', content.skills_h2);
        updateElement('.lang-skills-full', content.skills_full, true);
        updateElement('.lang-skills-db', content.skills_db, true);
        updateElement('.lang-skills-ai', content.skills_ai, true);
        updateElement('.lang-skills-basic', content.skills_basic, true);
        updateElement('.lang-cert-title', content.cert_h2);

        // 5. Projeler
        updateElement('.lang-projects-title', content.projects_h2);
        updateElement('.lang-proj1-title', content.proj1_title);
        updateElement('.lang-proj1-short', content.proj1_short);
        updateElement('.lang-proj2-title', content.proj2_title);
        updateElement('.lang-proj2-short', content.proj2_short);
        updateElement('.lang-proj3-title', content.proj3_title);
        updateElement('.lang-proj3-short', content.proj3_short);

        // 6. Modallar
        updateElement('.lang-proj1-modal-title', content.proj1_modal_title);
        updateElement('.lang-proj1-desc', content.proj1_desc);
        updateElement('.lang-proj2-modal-title', content.proj2_modal_title);
        updateElement('.lang-proj2-desc', content.proj2_desc);
        updateElement('.lang-proj3-modal-title', content.proj3_modal_title);
        updateElement('.lang-proj3-desc', content.proj3_desc);

        // 7. İletişim ve Referanslar
        updateElement('.lang-contact-title', content.contact_h2);
        updateElement('.lang-langs-title', content.lang_h2);
        updateElement('.lang-en-level', content.lang_en_level);
        updateElement('.lang-accounts-title', content.acc_h2);
        updateElement('.lang_ref_title', content.lang_ref_title);
        updateElement('.ref_title_1', content.ref_title_1);
        updateElement('.ref_title_2', content.ref_title_2);
        updateElement('.lang-view-cv-text', content["view-cv-btn"]);

        // 8. Butonlar
        document.querySelectorAll('.lang-github-text').forEach(btn => btn.innerHTML = content.github_text);
        updateElement('.lang-download-btn', content.download_btn, true);
        updateElement('.qr-hint', content.qr_code, true);

        // Buton Görünürlüğü
        const btnEn = document.getElementById('btn-en');
        const btnTr = document.getElementById('btn-tr');
        if (btnEn) btnEn.style.display = lang === 'en' ? 'none' : 'inline-flex';
        if (btnTr) btnTr.style.display = lang === 'tr' ? 'none' : 'inline-flex';

        localStorage.setItem('selectedLang', lang);
    } catch (e) {
        console.error("Dil yükleme hatası:", e);
    }
}

// TEMA YÖNETİMİ
function toggleDarkMode() {
    const body = document.body;
    const icon = document.getElementById('theme-icon');
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    icon.classList.replace(isDark ? 'fa-moon' : 'fa-sun', isDark ? 'fa-sun' : 'fa-moon');
}


function downloadCV() {
    const element = document.querySelector('.cv-wrapper');
    
    const opt = {
    margin: 0,
    filename: 'Eda_Oncel_CV.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
        scale: 2, 
        useCORS: true, 
        scrollY: 0,
        windowWidth: document.documentElement.offsetWidth 
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
};
    element.classList.add('printing');
    
    html2pdf().set(opt).from(element).save().then(() => {
        element.classList.remove('printing');
    });
}

// SAYFA YÜKLENDİĞİNDE ÇALIŞACAKLAR
window.onload = () => {
    // Tema kontrolü
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-icon').classList.replace('fa-moon', 'fa-sun');
    }
    // Dil kontrolü
    const savedLang = localStorage.getItem('selectedLang') || 'tr';
    changeLanguage(savedLang);
};

// MODAL DIŞI TIKLAMAYLA KAPATMA
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
};