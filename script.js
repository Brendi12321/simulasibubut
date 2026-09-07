// ==========================================================
// SCRIPT INTERAKTIF MEDIA PEMBELAJARAN MESIN BUBUT
// ==========================================================

// 1. SMOOTH SCROLL (Jika menggunakan link anchor #)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// 2. TOMBOL KEMBALI KE ATAS (Floating Button)
// Tambahkan HTML <button id="myBtn"> di akhir body jika ingin fitur ini
const mybutton = document.getElementById("myBtn");
if (mybutton) {
    window.onscroll = function() {scrollFunction()};
    function scrollFunction() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            mybutton.style.display = "block";
        } else {
            mybutton.style.display = "none";
        }
    }
    mybutton.onclick = function() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }
}

// 3. KALKULATOR RPM MESIN BUBUT (Fitur Simulasi)
// Rumus: n = (1000 * Vc) / (π * d)
// n = Putaran (RPM), Vc = Kecepatan Potong (m/menit), d = Diameter (mm)

function hitungRPM() {
    const vc = parseFloat(document.getElementById("vc").value);
    const d = parseFloat(document.getElementById("diameter").value);
    
    if (isNaN(vc) || isNaN(d) || d <= 0) {
        document.getElementById("hasil-rpm").innerHTML = "Masukkan angka yang valid!";
        return;
    }

    const pi = Math.PI;
    const rpm = (1000 * vc) / (pi * d);
    
    // Tampilkan hasil (dibulatkan ke 2 desimal)
    document.getElementById("hasil-rpm").innerHTML = "Putaran: <b>" + rpm.toFixed(2) + " RPM</b>";
    
    // Tambahkan efek visual
    document.getElementById("hasil-rpm").style.color = "#2563eb";
}

// 4. SISTEM KUIS INTERAKTIF (Contoh 3 Soal)
const kuisData = [
    {
        soal: "Apa fungsi utama dari mesin bubut?",
        opsi: ["Mengikir permukaan", "Memotong logam dengan putaran", "Mengebor lubang kecil", "Menggerinda benda kerja"],
        jawaban: 1
    },
    {
        soal: "Bagian mesin bubut yang berfungsi memegang benda kerja adalah...",
        opsi: ["Toolpost", "Headstock", "Chuck / Cekam", "Tailstock"],
        jawaban: 2
    },
    {
        soal: "Satuan putaran mesin bubut adalah...",
        opsi: ["mm/menit", "RPM", "Newton", "Pascal"],
        jawaban: 1
    }
];

let currentQuestion = 0;
let score = 0;
let userAnswers = [];

function mulaiKuis() {
    currentQuestion = 0;
    score = 0;
    userAnswers = [];
    document.getElementById("quiz-result").innerHTML = "";
    document.getElementById("next-btn").style.display = "block";
    loadQuestion();
}

function loadQuestion() {
    const q = kuisData[currentQuestion];
    document.getElementById("question").innerHTML = (currentQuestion + 1) + ". " + q.soal;
    
    let optionsHtml = "";
    q.opsi.forEach((opsi, index) => {
        optionsHtml += `<button class="option-btn" onclick="pilihJawaban(${index})">${opsi}</button>`;
    });
    
    document.getElementById("options").innerHTML = optionsHtml;
}

function pilihJawaban(index) {
    const q = kuisData[currentQuestion];
    userAnswers[currentQuestion] = index;
    
    // Highlight pilihan (sederhana)
    const buttons = document.querySelectorAll(".option-btn");
    buttons.forEach(btn => btn.style.background = "#eef2f6");
    buttons[index].style.background = "#2563eb";
    buttons[index].style.color = "#fff";

    // Pindah soal setelah jeda singkat
    setTimeout(nextQuestion, 500);
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < kuisData.length) {
        loadQuestion();
    } else {
        hitungSkor();
    }
}

function hitungSkor() {
    score = 0;
    for (let i = 0; i < kuisData.length; i++) {
        if (userAnswers[i] === kuisData[i].jawaban) {
            score++;
        }
    }
    
    const hasil = document.getElementById("quiz-result");
    document.getElementById("next-btn").style.display = "none";
    hasil.innerHTML = `<h3>Skor Anda: ${score} / ${kuisData.length}</h3>`;
    
    if (score === kuisData.length) {
        hasil.innerHTML += "<p style='color:green;'>Luar Biasa! Anda menguasai materi! 🎉</p>";
    } else {
        hasil.innerHTML += "<p style='color:orange;'>Terus berlatih ya!</p>";
    }
}

// 5. INTERAKSI NAVBAR (Aktifkan link berdasarkan halaman)
// Script ini otomatis menandai menu aktif jika URL mengandung nama file
document.addEventListener("DOMContentLoaded", function() {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll(".nav-links a");
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute("href");
        if (linkPath === currentPath) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
});
