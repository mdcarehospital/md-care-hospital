// Theme Logic
function adaptTheme() {
    const savedTheme = localStorage.getItem('mdcare_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) { 
        document.documentElement.classList.add('dark'); 
    } else { 
        document.documentElement.classList.remove('dark'); 
    }
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => { 
    if(!localStorage.getItem('mdcare_theme')) adaptTheme(); 
});
adaptTheme();

window.toggleTheme = function() {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.setItem('mdcare_theme', 'light');
    } else {
        html.classList.add('dark');
        localStorage.setItem('mdcare_theme', 'dark');
    }
    window.dispatchEvent(new Event('themeToggled'));
};

// Toast Notification
window.showToast = function(title, message, type = 'success', duration = 6000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-24 right-4 z-[200] flex flex-col gap-3 pointer-events-none';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `min-w-[300px] max-w-sm bg-white border-l-4 ${type === 'success' ? 'border-teal-500' : 'border-red-500'} rounded-xl shadow-2xl p-4 flex items-start gap-3 transform transition-all duration-300 translate-x-full opacity-0 pointer-events-auto`;
    
    const icon = `<div class="w-10 h-10 rounded-full ${type === 'success' ? 'bg-teal-50 text-teal-500' : 'bg-red-50 text-red-500'} flex items-center justify-center flex-shrink-0 text-lg">
        <i class="fa-solid ${type === 'success' ? 'fa-check' : 'fa-xmark'}"></i>
    </div>`;
        
    toast.innerHTML = `
        ${icon}
        <div class="flex-grow pt-0.5">
            <h4 class="font-bold text-slate-800 text-sm">${title}</h4>
            <p class="text-xs text-slate-500 mt-1 leading-relaxed">${message}</p>
        </div>
        <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 transition"><i class="fa-solid fa-times"></i></button>
    `;
    
    container.appendChild(toast);
    
    requestAnimationFrame(() => toast.classList.remove('translate-x-full', 'opacity-0'));
    
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, duration);
};

// Modals
window.openModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
};

window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
};

window.switchModal = function(closeId, openId) {
    window.closeModal(closeId);
    window.openModal(openId);
};

// Centralized Data
window.hospitalHolidays = [];
window.hospitalHolidaysMap = {};

window.allTimeSlots = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"];

window.doctorsList = [];
window.sampleDoctorsList = [
    { name: "Dr. Mohd Nadim Ansari", dept: "Psychiatry", displayDept: "Psychiatry (Director)", qual: "VNGP (Psychiatry)", displayTitle: "VNGP (Psychiatry) - Director", exp: "23+ Years", email: "director@mdcare.com", img: "images/nadim.jpeg", bio: "Hospital Director and leading specialist in Psychiatry. Committed to clinical excellence and compassionate patient care." },
    { name: "Dr. M D Sheikh", dept: "Cardiology", qual: "Website Developer", exp: "15+ Years", email: "mdcareadmin@gmail.com", img: "images/myphoto.jpeg", bio: "Specializes in interventional cardiology and advanced heart failure treatments. Renowned for performing complex angioplasties with a 99% success rate." },
    { name: "Dr. Neha Verma", dept: "Cardiology", qual: "MBBS, MS, Fellowship in Cardiac Surgery", exp: "10 Years", email: "neha.verma@mdcare.com", img: "images/femaled2.avif", bio: "Expert in pediatric cardiology and minimally invasive cardiac surgeries. A leading voice in preventive cardiovascular healthcare." },
    { name: "Dr. Arjun Patel", dept: "Cardiology", qual: "MBBS, MD (Cardiology)", exp: "8 Years", email: "arjun.patel@mdcare.com", img: "images/maled3.avif", bio: "Dedicated to echocardiography and non-invasive diagnostics. Passionate about managing chronic heart conditions." },
    { name: "Dr. Anil Kapoor", dept: "Neurology", qual: "MBBS, DM (Neurology)", exp: "20 Years", email: "anil.kapoor@mdcare.com", img: "images/maled4.avif", bio: "Senior neurologist specializing in stroke management, epilepsy, and neurodegenerative disorders. Heads the stroke trauma unit." },
    { name: "Dr. Priya Singh", dept: "Neurology", qual: "MBBS, MD (Medicine), DM", exp: "12 Years", email: "priya.singh@mdcare.com", img: "images/femaled5.avif", bio: "Focuses on multiple sclerosis and movement disorders. Heavily involved in clinical research and advanced neural mapping." },
    { name: "Dr. Rohan Mehta", dept: "Neurology", qual: "MBBS, MS (Neuro Surgery)", exp: "14 Years", email: "rohan.mehta@mdcare.com", img: "images/maled6.avif", bio: "Expert neurosurgeon performing delicate brain and spinal cord surgeries with state-of-the-art robotic assistance." },
    { name: "Dr. Vikram Das", dept: "Orthopedics", qual: "MBBS, MS (Orthopedics)", exp: "18 Years", email: "vikram.das@mdcare.com", img: "images/maled7.avif", bio: "Leading joint replacement surgeon. Pioneer in performing bilateral knee replacements and sports injury reconstruction." },
    { name: "Dr. Sana Khan", dept: "Orthopedics", qual: "MBBS, DNB (Ortho)", exp: "9 Years", email: "sana.khan@mdcare.com", img: "images/femaled8.avif", bio: "Specializes in arthroscopy and pediatric orthopedics. Dedicated to correcting congenital bone deformities." },
    { name: "Dr. Aditya Rao", dept: "Orthopedics", qual: "MBBS, MS", exp: "11 Years", email: "aditya.rao@mdcare.com", img: "images/maled9.avif", bio: "Trauma specialist dealing with complex fractures and spinal injuries originating from severe accidents." },
    { name: "Dr. Amit Patel", dept: "Pediatrics", qual: "MBBS, MD (Pediatrics)", exp: "16 Years", email: "amit.patel@mdcare.com", img: "images/maled10.avif", bio: "Friendly and highly experienced pediatrician. Dedicated to child immunization, developmental milestones, and neonatal intensive care." },
    { name: "Dr. Kavita Rao", dept: "Pediatrics", qual: "MBBS, DCH", exp: "13 Years", email: "kavita.rao@mdcare.com", img: "images/femaled11.avif", bio: "Expert in treating pediatric asthma, allergies, and nutritional disorders in growing toddlers." },
    { name: "Dr. Nidhi Sharma", dept: "Pediatrics", qual: "MBBS, MD", exp: "7 Years", email: "nidhi.sharma@mdcare.com", img: "images/femaled12.avif", bio: "Neonatologist who runs the NICU. Passionate about saving premature babies and ensuring healthy early development." },
    { name: "Dr. Sameer Reddy", dept: "Oncology", qual: "MBBS, DM (Medical Oncology)", exp: "19 Years", email: "sameer.reddy@mdcare.com", img: "images/maled13.avif", bio: "Pioneer in targeted therapies and immunotherapy for solid tumors. Compassionate doctor focusing on quality of life." },
    { name: "Dr. Anjali Desai", dept: "Oncology", qual: "MBBS, MS (Surgical Oncology)", exp: "14 Years", email: "anjali.desai@mdcare.com", img: "images/femaled14.avif", bio: "Highly skilled surgical oncologist performing tumor resections, including complex breast and gastrointestinal cancer surgeries." },
    { name: "Dr. Kabir Jain", dept: "Oncology", qual: "MBBS, MD (Radiation)", exp: "10 Years", email: "kabir.jain@mdcare.com", img: "images/maled15.avif", bio: "Expert in precision radiation oncology, utilizing CyberKnife and advanced linear accelerators." },
    { name: "Dr. Varun Gupta", dept: "Dermatology", qual: "MBBS, MD (Dermatology)", exp: "12 Years", email: "varun.gupta@mdcare.com", img: "images/maled16.avif", bio: "Specializes in clinical dermatology, treating severe psoriasis, eczema, and complex autoimmune skin diseases." },
    { name: "Dr. Pooja Iyer", dept: "Dermatology", qual: "MBBS, DDVL", exp: "8 Years", email: "pooja.iyer@mdcare.com", img: "images/femaled17.avif", bio: "Renowned for aesthetic dermatology, laser treatments, and advanced scar reduction therapies." },
    { name: "Dr. Akash Singh", dept: "Dermatology", qual: "MBBS, MD", exp: "15 Years", email: "akash.singh@mdcare.com", img: "images/maled18.avif", bio: "Expert in dermato-surgery and hair transplant procedures. Leads the vitiligo research department." },
    { name: "Dr. Tarun Kumar", dept: "Ophthalmology", qual: "MBBS, MS (Ophthalmology)", exp: "17 Years", email: "tarun.kumar@mdcare.com", img: "images/maled19.avif", bio: "Senior eye surgeon specializing in advanced cataract surgeries and premium intraocular lens implants." },
    { name: "Dr. Sneha Nair", dept: "Ophthalmology", qual: "MBBS, DO", exp: "11 Years", email: "sneha.nair@mdcare.com", img: "images/femaled20.avif", bio: "Specialist in refractive surgeries (LASIK) and managing complex glaucoma conditions." },
    { name: "Dr. Rahul Bose", dept: "Ophthalmology", qual: "MBBS, MS", exp: "9 Years", email: "rahul.bose@mdcare.com", img: "images/maled21.avif", bio: "Vitreoretinal surgeon dealing with diabetic retinopathy and macular degeneration." },
    { name: "Dr. Kabir Singh", dept: "Psychiatry", qual: "MBBS, MD (Psychiatry)", exp: "14 Years", email: "kabir.singh@mdcare.com", img: "images/maled22.avif", bio: "Focuses on adult psychiatry, treating severe clinical depression, bipolar disorder, and anxiety management." },
    { name: "Dr. Aisha Ali", dept: "Psychiatry", qual: "MBBS, DPM", exp: "10 Years", email: "aisha.ali@mdcare.com", img: "images/femaled23.avif", bio: "Child and adolescent psychiatrist. Expert in managing ADHD, autism spectrum, and behavioral issues." },
    { name: "Dr. Manish Sen", dept: "Psychiatry", qual: "MBBS, MD", exp: "16 Years", email: "manish.sen@mdcare.com", img: "images/maled24.avif", bio: "Addiction specialist running the hospital's renowned de-addiction and rehabilitation clinic." }
];

// Password visibility toggle logic
window.togglePasswordVisibility = function(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash", "text-primary");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash", "text-primary");
        icon.classList.add("fa-eye");
    }
};