function selectRole(r){localStorage.setItem('selectedRole',r);window.location.href='auth.html'}
function toggleDarkMode(){document.body.classList.toggle('dark');localStorage.setItem('darkMode',document.body.classList.contains('dark'))}
if(localStorage.getItem('darkMode')==='true')document.body.classList.add('dark')
const c=document.getElementById('container'),up=document.getElementById('signUpSwitch'),sw=document.getElementById('signInSwitch');
if(up&&sw&&c){up.onclick=()=>c.classList.add("right-panel-active");sw.onclick=()=>c.classList.remove("right-panel-active")}
window.onload=()=>{
    const r=localStorage.getItem('selectedRole')||'Patient';
    const w=document.getElementById('welcomeText'),l=document.getElementById('loginTitle'),rg=document.getElementById('registerTitle');
    if(w)w.innerText=`مرحباً بك في PharmaLink`;
    if(l)l.innerText= r === 'Pharmacy' ? `تسجيل دخول صيدلية` : `تسجيل دخول مريض`;
    if(rg)rg.innerText= r === 'Pharmacy' ? `إنشاء حساب صيدلية` : `إنشاء حساب مريض`;

    const pharmacyFields = document.getElementById('pharmacyExtraFields');
    if(pharmacyFields) {
        pharmacyFields.style.display = r === 'Pharmacy' ? 'block' : 'none';
        
        // Make fields required if pharmacy
        const inputs = pharmacyFields.querySelectorAll('input, select');
        inputs.forEach(input => input.required = (r === 'Pharmacy'));
    }
}
document.getElementById('signInForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    showToast('✅ تم تسجيل الدخول بنجاح', 'success');
    const role = localStorage.getItem('selectedRole');
    setTimeout(() => {
        if(role === 'Pharmacy') {
            window.location.href = 'pharmacy-dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
    }, 1000);
});

document.getElementById('signUpForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    showToast('✅ تم إنشاء الحساب بنجاح', 'success');
    const role = localStorage.getItem('selectedRole');
    setTimeout(() => {
        if(role === 'Pharmacy') {
            window.location.href = 'pharmacy-dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
    }, 1000);
});

function showToast(message, type='success') {
    const toast = document.createElement('div');
    toast.className = `modern-toast ${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

document.querySelectorAll('.logout-nav').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('selectedRole');
        localStorage.removeItem('userToken');
        window.location.href = 'auth.html';
    });
});

function guestLogin(){
    showToast('👋 المتابعة كزائر...', 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 1000);
}