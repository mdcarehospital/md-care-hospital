// --- GLOBAL CONFIGURATIONS ---
window.RAZORPAY_KEY = 'rzp_test_SquAoGtYIAPOi3';

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
    { name: "Dr. M D Sheikh", dept: "Cardiology", qual: "Website Developer", exp: "15+ Years", email: "mdcareadmin@gmail.com", img: "images/myphoto.jpeg", bio: "Specializes in interventional cardiology and advanced heart failure treatments. Renowned for performing complex angioplasties with a 99% success rate." },
    { name: "Dr. Mohd Nadim Ansari", dept: "Psychiatry", displayDept: "Psychiatry (Director)", qual: "VNGP (Psychiatry)", displayTitle: "VNGP (Psychiatry) - Director", exp: "23+ Years", email: "director@mdcare.com", img: "images/nadim.jpeg", bio: "Hospital Director and leading specialist in Psychiatry. Committed to clinical excellence and compassionate patient care." },
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

// Sorting utility to enforce specific doctor ordering
window.sortDoctors = function(docsArray) {
    const getOrder = (name) => {
        if (!name) return 999;
        const lowerName = name.toLowerCase();
        if (lowerName.includes("m d sheikh") || lowerName.includes("sheikh")) return 1;
        if (lowerName.includes("mohd nadim ansari") || lowerName.includes("nadim ansari")) return 2;
        return 999;
    };

    return docsArray.sort((a, b) => {
        const orderA = getOrder(a.name);
        const orderB = getOrder(b.name);
        
        if (orderA !== orderB) {
            return orderA - orderB;
        }
        return 0; 
    });
};

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

// Shared Components Loader (Optional usage to reduce HTML duplication)
window.loadSharedComponents = function(activePage = 'home') {
    const navbarHTML = `
    <nav class="bg-white shadow-md fixed w-full z-50 top-0 left-0">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-20 gap-4">
                <div class="flex items-center gap-2 md:gap-4">
                    <button onclick="toggleTheme()" class="text-slate-500 hover:text-primary transition text-xl w-8 h-8 flex items-center justify-center focus:outline-none flex-shrink-0" title="Toggle Theme">
                        <i class="fa-solid fa-moon theme-icon-moon"></i><i class="fa-solid fa-sun theme-icon-sun hidden"></i>
                    </button>
                    <button id="mobile-menu-btn" class="md:hidden text-slate-600 hover:text-primary focus:outline-none flex-shrink-0">
                        <i class="fa-solid fa-bars text-2xl"></i>
                    </button>
                    <a href="index.html" class="flex-shrink-0 flex items-center gap-2 hover:opacity-80 transition cursor-pointer ml-2 md:ml-0">
                        <i class="fa-solid fa-house-medical text-[28px] md:text-3xl text-primary"></i>
                        <span class="font-bold text-[22px] md:text-2xl text-secondary whitespace-nowrap">MD Care <span class="text-primary">Hospital</span></span>
                    </a>
                </div>
                <div class="hidden md:flex space-x-4 lg:space-x-8 items-center">
                    <a href="index.html" class="${activePage === 'home' ? 'text-primary font-bold' : 'text-slate-600 hover:text-primary font-medium'} transition">Home</a>
                    <a href="about.html" class="${activePage === 'about' ? 'text-primary font-bold' : 'text-slate-600 hover:text-primary font-medium'} transition">About</a>
                    <a href="departments.html" class="${activePage === 'departments' ? 'text-primary font-bold' : 'text-slate-600 hover:text-primary font-medium'} transition">Departments</a>
                    <a href="doctors.html" class="${activePage === 'doctors' ? 'text-primary font-bold' : 'text-slate-600 hover:text-primary font-medium'} transition">Doctors</a>
                    <a href="blog.html" class="${activePage === 'blog' ? 'text-primary font-bold' : 'text-slate-600 hover:text-primary font-medium'} transition">Blog</a>
                    <a href="careers.html" class="${activePage === 'careers' ? 'text-primary font-bold' : 'text-slate-600 hover:text-primary font-medium'} transition">Careers</a>
                    <a href="medicine.html" class="${activePage === 'pharmacy' ? 'text-primary font-bold' : 'text-slate-600 hover:text-primary font-medium'} transition">Pharmacy</a>
                    <a href="index.html#appointment" class="bg-primary text-white px-6 py-2 rounded-full font-medium hover:bg-teal-700 transition shadow-lg shadow-teal-500/30 animate-glow-pulse">Book Appointment</a>
                    
                    <div class="border-l border-gray-300 h-6 mx-2 hidden lg:block"></div>
                    <div id="auth-nav-container" class="flex items-center space-x-4"></div>
                </div>
            </div>
        </div>
        <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-gray-100">
            <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
                <a href="index.html" class="block px-3 py-2 ${activePage === 'home' ? 'text-primary font-bold' : 'text-slate-600'} hover:bg-slate-50 rounded-md">Home</a>
                <a href="about.html" class="block px-3 py-2 ${activePage === 'about' ? 'text-primary font-bold' : 'text-slate-600'} hover:bg-slate-50 rounded-md">About</a>
                <a href="departments.html" class="block px-3 py-2 ${activePage === 'departments' ? 'text-primary font-bold' : 'text-slate-600'} hover:bg-slate-50 rounded-md">Departments</a>
                <a href="doctors.html" class="block px-3 py-2 ${activePage === 'doctors' ? 'text-primary font-bold' : 'text-slate-600'} hover:bg-slate-50 rounded-md">Doctors</a>
                <a href="blog.html" class="block px-3 py-2 ${activePage === 'blog' ? 'text-primary font-bold' : 'text-slate-600'} hover:bg-slate-50 rounded-md">Blog</a>
                <a href="careers.html" class="block px-3 py-2 ${activePage === 'careers' ? 'text-primary font-bold' : 'text-slate-600'} hover:bg-slate-50 rounded-md">Careers</a>
                <a href="medicine.html" class="block px-3 py-2 ${activePage === 'pharmacy' ? 'text-primary font-bold' : 'text-slate-600'} hover:bg-slate-50 rounded-md">Pharmacy</a>
                <a href="index.html#appointment" class="block w-fit mx-3 text-center bg-primary text-white px-6 py-2 mt-2 rounded-full font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-500/30 animate-glow-pulse">Book Appointment</a>
                <div id="mobile-auth-container" class="border-t border-gray-200 mt-2 pt-2 flex flex-col"></div>
            </div>
        </div>
    </nav>`;

    const footerHTML = `
    <footer class="bg-secondary text-white pt-16 pb-8 border-t-4 border-primary mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                <div>
                    <div class="flex items-center gap-2 mb-6"><i class="fa-solid fa-house-medical text-3xl text-primary"></i><span class="font-bold text-2xl">MD Care <span class="text-primary">Hospital</span></span></div>
                    <p class="text-gray-400 mb-6">Providing exceptional medical care to our community with compassion, integrity, and advanced medical expertise.</p>
                </div>
                <div>
                    <h3 class="text-lg font-bold mb-6 text-white border-b-2 border-primary pb-2 inline-block">Quick Links</h3>
                    <ul class="space-y-3 text-gray-400">
                        <li><a href="index.html" class="hover:text-primary transition"><i class="fa-solid fa-angle-right mr-2"></i> Home</a></li>
                        <li><a href="about.html" class="hover:text-primary transition"><i class="fa-solid fa-angle-right mr-2"></i> About Us</a></li>
                        <li><a href="departments.html" class="hover:text-primary transition"><i class="fa-solid fa-angle-right mr-2"></i> Departments</a></li>
                        <li><a href="doctors.html" class="hover:text-primary transition"><i class="fa-solid fa-angle-right mr-2"></i> Doctors</a></li>
                        <li><a href="blog.html" class="hover:text-primary transition"><i class="fa-solid fa-angle-right mr-2"></i> Blog</a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-bold mb-6 text-white border-b-2 border-primary pb-2 inline-block">Contact Info</h3>
                    <ul class="space-y-4 text-gray-400">
                        <li class="flex items-start"><a href="https://maps.app.goo.gl/VHmDEL9wXsqcp3o66?g_st=aw" target="_blank" rel="noopener noreferrer" class="flex items-start hover:text-primary transition group"><i class="fa-solid fa-location-dot mt-1 mr-3 text-primary text-xl group-hover:scale-110 transition"></i><span class="text-sm">Street-3, Danishmandan,<br/>Basti Bawa khel, JALANDHAR,<br/>PUNJAB, Pincode: 144021</span></a></li>
                        <li class="flex items-center"><a href="tel:8091919997" class="flex items-center hover:text-primary transition group"><i class="fa-solid fa-phone mr-3 text-primary text-xl group-hover:scale-110 transition"></i><span>8091919997</span></a></li>
                        <li class="flex items-center"><a href="mailto:mdcareadmin@gmail.com" class="flex items-center hover:text-primary transition group"><i class="fa-solid fa-envelope mr-3 text-primary text-xl group-hover:scale-110 transition"></i><span>mdcareadmin@gmail.com</span></a></li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-lg font-bold mb-6 text-white border-b-2 border-primary pb-2 inline-block">Follow Us</h3>
                    <div class="flex space-x-4">
                        <a href="#" target="_blank" class="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#E1306C] transition text-2xl text-[#E1306C] hover:text-white"><i class="fa-brands fa-instagram"></i></a>
                        <a href="#" target="_blank" class="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#25D366] transition text-2xl text-[#25D366] hover:text-white"><i class="fa-brands fa-whatsapp"></i></a>
                        <a href="#" target="_blank" class="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1877F2] transition text-2xl text-[#1877F2] hover:text-white"><i class="fa-brands fa-facebook-f"></i></a>
                    </div>
                </div>
            </div>
            <div class="border-t border-gray-700 pt-8 text-center text-gray-500 text-sm">
                <p>&copy; 2015 MD Care Hospital. All Rights Reserved. | <a href="admin.html" class="hover:text-primary transition">Admin Portal</a></p>
            </div>
        </div>
    </footer>`;

    const headerTarget = document.getElementById('shared-navbar');
    const footerTarget = document.getElementById('shared-footer');
    if (headerTarget) headerTarget.outerHTML = navbarHTML;
    if (footerTarget) footerTarget.outerHTML = footerHTML;
};