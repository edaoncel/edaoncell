document.addEventListener('DOMContentLoaded', () => {
    
    window.changeLanguage = async function(lang) {
        try {
            const response = await fetch('lang.json');
            const data = await response.json();
            const t = data[lang];

            if (!t) {
                console.error("Dil verisi bulunamadı:", lang);
                return;
            }

            for (const key in t) {
                const el = document.getElementById(key);
                if (el) {
                    el.innerHTML = t[key];
                }
            }

            const enBtn = document.getElementById('en-btn');
            const trBtn = document.getElementById('tr-btn');
            
            if (lang === 'en') {
                enBtn.style.display = 'none';
                trBtn.style.display = 'block';
            } else {
                trBtn.style.display = 'none';
                enBtn.style.display = 'block';
            }

        } catch (e) {
            console.error("Hata:", e);
        }
    };

    window.downloadCV = () => window.print();
});
