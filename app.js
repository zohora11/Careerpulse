// Set current year
document.getElementById('year').textContent = new Date().getFullYear();

// UI Toggles for Login flows
window.editPhoneNumber = () => {
    const formPhone = document.getElementById('form-phone');
    const formOtp = document.getElementById('form-otp');
    const otpInput = document.getElementById('otp');
    if (formPhone) formPhone.classList.remove('hidden');
    if (formOtp) formOtp.classList.add('hidden');
    if (otpInput) otpInput.value = '';
};

// State
let isAuthenticated = false;
let userPhone = '';
let currentReferenceNo = '';

const APK_URL = 'https://bdappsdigitalapps.com/NADB26131/apk/CareerPulse.apk';

window.goToPricing = function(msg) {
    const pricingEl = document.getElementById('pricing');
    if (pricingEl) {
        pricingEl.scrollIntoView({ behavior: 'smooth' });
    }
    if (msg) {
        showToast(msg, 'error');
    }
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        setTimeout(() => phoneInput.focus(), 400);
    }
};

window.downloadApk = function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    
    const isSubscribed = isAuthenticated && localStorage.getItem('quiznest_subscribed') === 'true';
    
    if (isSubscribed) {
        const a = document.createElement('a');
        a.href = APK_URL;
        a.download = 'CareerPulse.apk';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('Downloading CareerPulse APK...', 'success');
    } else {
        goToPricing('Please subscribe to download the app');
    }
};

// Data Mocks (from previous React state)
const jobs = [
    { id: '1', title: 'Senior Frontend Engineer', company: 'TechNova', matchScore: 94, deadline: new Date(Date.now() + 86400000 * 2), status: 'saved', salary: '$120k - $150k', location: 'Remote' },
    { id: '2', title: 'Product Designer', company: 'CreativeFlow', matchScore: 88, deadline: new Date(Date.now() + 86400000 * 5), status: 'applied', salary: '$100k - $130k', location: 'New York, NY' },
    { id: '3', title: 'Full Stack Developer', company: 'CodeStream', matchScore: 72, deadline: new Date(Date.now() + 86400000 * 10), status: 'interviewing', salary: '$110k - $140k', location: 'San Francisco, CA' }
];

let alerts = [
    { id: '1', keyword: 'Frontend Engineer', location: 'Remote', isActive: true, frequency: 'daily' },
    { id: '2', keyword: 'React Developer', location: 'London, UK', isActive: false, frequency: 'weekly' }
];

const analyticsData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
        label: 'Applications',
        data: [4, 7, 5, 12],
        borderColor: '#04bf68',
        backgroundColor: 'rgba(4, 191, 104, 0.1)',
        fill: true,
        tension: 0.4
    }]
};

// Initialize Icons
lucide.createIcons();

// Toast Notification System
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    const bgColor = type === 'success' ? 'bg-white dark:bg-slate-900 border-l-4 border-primary-500' : 'bg-white dark:bg-slate-900 border-l-4 border-primary-500';
    const iconColor = type === 'success' ? 'text-primary-500' : 'text-primary-500';
    const iconName = type === 'success' ? 'check-circle' : 'alert-circle';
    
    toast.className = `toast-enter flex items-center p-3.5 sm:p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 ${bgColor} w-full sm:min-w-[300px] sm:w-auto text-slate-800 dark:text-slate-200 pointer-events-auto`;
    toast.innerHTML = `
        <i data-lucide="${iconName}" class="w-5 h-5 ${iconColor} mr-3 flex-shrink-0"></i>
        <div class="text-xs sm:text-sm font-medium leading-snug">${message}</div>
    `;
    
    container.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        setTimeout(() => {
            if(container.contains(toast)) container.removeChild(toast);
        }, 300);
    }, 4000);
}

// Dark Mode Toggle
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    initCharts(); // Re-render charts with new theme colors
}

// Check saved theme - Default is strictly Light Mode unless explicitly set to 'dark' by user
if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

// Authentication Logic
async function ensureSubscribed(phoneNumber, doSendOtp = false) {
    // Step 1
    const checkResult = await checkSubscription(phoneNumber);
    const isSub = checkResult.isSubscribed === true || checkResult.subscriptionStatus === 'REGISTERED';
    if (checkResult.statusCode === 'S1000' && isSub) {
      return { subscribed: true };
    }

    if (!doSendOtp) {
      return { subscribed: false };
    }

    // Step 2 — fallback, since check_subscription.php can sometimes
    // return an inconclusive error-shaped response for a real subscriber
    const otpResult = await sendOtp(phoneNumber);
    const msg = (otpResult.message || otpResult.statusDetail || '').toLowerCase();
    if (msg.includes('already registered')) {
      return { subscribed: true };
    }
    if (otpResult.success === true && otpResult.referenceNo) {
      return { subscribed: false, referenceNo: otpResult.referenceNo };
      // caller should now show the OTP entry screen
    }
    throw new Error(otpResult.message || otpResult.statusDetail || 'Could not verify subscription status');
}

// User Menu Dropdown Toggles
window.toggleUserMenu = function(e) {
    if (e) {
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
        if (typeof e.preventDefault === 'function') e.preventDefault();
    }
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        const isHidden = dropdown.classList.contains('hidden');
        if (isHidden) {
            dropdown.classList.remove('hidden');
        } else {
            dropdown.classList.add('hidden');
        }
        lucide.createIcons();
    }
};

window.closeUserMenu = function() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown && !dropdown.classList.contains('hidden')) {
        dropdown.classList.add('hidden');
    }
};

// Close dropdown when clicking outside safely
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown && !dropdown.classList.contains('hidden')) {
        const isMenuClick = e.target && e.target.closest('#user-menu-container');
        if (!isMenuClick) {
            closeUserMenu();
        }
    }
});

function updateAuthUI() {
    const navUnauth = document.getElementById('nav-unauth');
    const navAuth = document.getElementById('nav-auth');
    const viewLanding = document.getElementById('view-landing');
    const viewDashboard = document.getElementById('view-dashboard');
    const userPhoneDisplay = document.getElementById('user-phone-display');

    if (isAuthenticated) {
        if (userPhoneDisplay) {
            userPhoneDisplay.textContent = userPhone ? userPhone : 'Active Subscriber';
        }

        if (navUnauth) navUnauth.classList.add('hidden');
        if (navAuth) {
            navAuth.classList.remove('hidden');
            navAuth.classList.add('flex');
        }
        
        if (viewLanding) {
            viewLanding.classList.add('hidden');
            viewLanding.classList.remove('block');
        }
        
        if (viewDashboard) {
            viewDashboard.classList.remove('hidden');
            viewDashboard.classList.add('block');
        }
        
        renderDashboard();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        if (navUnauth) {
            navUnauth.classList.remove('hidden');
            navUnauth.classList.add('flex');
        }
        if (navAuth) {
            navAuth.classList.add('hidden');
            navAuth.classList.remove('flex');
        }
        
        if (viewLanding) {
            viewLanding.classList.remove('hidden');
            viewLanding.classList.add('block');
        }
        
        if (viewDashboard) {
            viewDashboard.classList.add('hidden');
            viewDashboard.classList.remove('block');
        }
        
        // Reset forms
        showPhoneStep();
        const phoneEl = document.getElementById('phone');
        const otpEl = document.getElementById('otp');
        if (phoneEl) phoneEl.value = '';
        if (otpEl) otpEl.value = '';
    }
}

function showPhoneStep() {
    const flow = document.getElementById('phone-subscription-flow');
    const formPhone = document.getElementById('form-phone');
    const formOtp = document.getElementById('form-otp');
    const title = document.getElementById('login-title');
    const desc = document.getElementById('login-desc');
    
    if (flow) flow.classList.remove('hidden');
    if (formPhone) formPhone.classList.remove('hidden');
    if (formOtp) formOtp.classList.add('hidden');
    if (title) title.textContent = "Join CareerPulse Elite";
    if (desc) desc.textContent = "2.78 BDT (including VAT + SC + SD) / day (Auto-renewable). Cancel anytime.";
}

// Documentation Modal Helpers
window.openDocumentationModal = () => {
    const modal = document.getElementById('documentation-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
};

window.closeDocumentationModal = () => {
    const modal = document.getElementById('documentation-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
};

// FAQ Accordion Helper
window.toggleFaq = (id) => {
    const answer = document.getElementById(`faq-answer-${id}`);
    const icon = document.getElementById(`faq-icon-${id}`);
    if (answer) {
        const isHidden = answer.classList.contains('hidden');
        // Hide all answers
        for (let i = 1; i <= 11; i++) {
            const a = document.getElementById(`faq-answer-${i}`);
            const ic = document.getElementById(`faq-icon-${i}`);
            if (a) a.classList.add('hidden');
            if (ic) ic.style.transform = 'rotate(0deg)';
        }
        if (isHidden) {
            answer.classList.remove('hidden');
            if (icon) icon.style.transform = 'rotate(180deg)';
        }
    }
};

function setBtnLoading(btnId, isLoading) {
    const btn = document.getElementById(btnId);
    if (isLoading) {
        btn.disabled = true;
        btn.dataset.originalText = btn.innerText;
        btn.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...`;
    } else {
        btn.disabled = false;
        btn.innerText = btn.dataset.originalText || "Continue";
    }
}

async function handlePhoneSubmit(e) {
    e.preventDefault();
    const phoneInput = document.getElementById('phone').value.trim();
    
    if (!phoneInput || phoneInput.length < 11) {
        showToast('Please enter a valid Robi/Airtel phone number', 'error');
        return;
    }

    setBtnLoading('btn-phone', true);

    try {
        const subResult = await ensureSubscribed(phoneInput, true);

        if (subResult.subscribed) {
            userPhone = phoneInput;
            isAuthenticated = true;
            localStorage.setItem('quiznest_phone', userPhone);
            localStorage.setItem('quiznest_subscribed', 'true');
            updateAuthUI();
            updateStatusBadge();
            showToast('Welcome back! Successfully logged in.', 'success');
        } else {
            // Needs OTP
            userPhone = phoneInput;
            currentReferenceNo = subResult.referenceNo;
            const fp = document.getElementById('form-phone');
            const fo = document.getElementById('form-otp');
            const dp = document.getElementById('display-phone');
            if (fp) fp.classList.add('hidden');
            if (fo) fo.classList.remove('hidden');
            if (dp) dp.textContent = phoneInput;
            showToast('OTP sent to your device!', 'success');
        }
    } catch (error) {
        showToast(error.message || 'Network error. Please try again.', 'error');
        console.error(error);
    } finally {
        setBtnLoading('btn-phone', false);
    }
}

async function handleVerifyOTP(e) {
    e.preventDefault();
    const otpInput = document.getElementById('otp').value.trim();

    if (!otpInput || otpInput.length < 4) {
        showToast('Please enter a valid OTP', 'error');
        return;
    }

    setBtnLoading('btn-otp', true);

    try {
        const verifyData = await verifyOtp(otpInput, currentReferenceNo);

        if (verifyData.statusCode === 'S1000' || verifyData.subscriptionStatus === 'REGISTERED') {
            isAuthenticated = true;
            localStorage.setItem('quiznest_phone', userPhone);
            localStorage.setItem('quiznest_subscribed', 'true');
            updateAuthUI();
            updateStatusBadge();
            showToast('Subscription successful! Welcome to CareerPulse Elite.', 'success');
        } else {
            showToast(verifyData.statusDetail || verifyData.message || 'Invalid OTP', 'error');
        }
    } catch (error) {
        showToast(error.message || 'Network error during verification', 'error');
        console.error(error);
    } finally {
        setBtnLoading('btn-otp', false);
    }
}

async function handleLogout() {
    isAuthenticated = false;
    userPhone = '';
    currentReferenceNo = '';
    localStorage.removeItem('quiznest_phone');
    localStorage.removeItem('quiznest_subscribed');
    updateAuthUI();
    window.location.reload(); // Force reload to go back to landing page
}

// Dashboard Tabs
function switchTab(tabId) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-primary-600', 'text-primary-600', 'active-tab');
        btn.classList.add('border-transparent', 'text-slate-500');
    });
    const activeBtn = document.querySelector(`[onclick="switchTab('${tabId}')"]`);
    if (activeBtn) {
        activeBtn.classList.remove('border-transparent', 'text-slate-500');
        activeBtn.classList.add('border-primary-600', 'text-primary-600', 'active-tab');
    }

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('block');
        content.classList.add('hidden');
    });
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.remove('hidden');
        targetTab.classList.add('block');
    }
    
    // Refresh charts if needed
    if (tabId === 'dashboard-tab' || tabId === 'analytics-tab') {
        initCharts();
    }
}

// Render Dashboard Data
function renderDashboard() {
    renderTimeline();
    renderAlerts();
    initCharts();
    document.getElementById('dashboard-count').innerText = jobs.length;
}

function renderTimeline() {
    const container = document.getElementById('timeline-container');
    container.innerHTML = '';
    
    const sortedJobs = [...jobs].sort((a, b) => a.deadline - b.deadline);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    sortedJobs.forEach((job, index) => {
        const d = job.deadline;
        const dateStr = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
        
        const badgeColor = job.status === 'saved' ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' : 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300';
        const capStatus = job.status.charAt(0).toUpperCase() + job.status.slice(1);
        
        const el = document.createElement('div');
        el.className = 'w-[250px] sm:w-[300px] flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 hover:shadow-lg transition-all glass-card';
        el.style.animation = `fadeIn 0.5s ease-out ${index * 0.1}s both`;
        
        el.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${badgeColor}">
                    ${capStatus}
                </span>
                <div class="flex items-center text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/50 px-2 py-1 rounded-full border border-primary-100 dark:border-primary-900/50">
                    <i data-lucide="percent" class="w-3 h-3 mr-1"></i> ${job.matchScore}% Match
                </div>
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white truncate" title="${job.title}">${job.title}</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 flex items-center mt-1">
                <i data-lucide="building" class="w-3.5 h-3.5 mr-1.5"></i> ${job.company}
            </p>
            <div class="mt-4 space-y-2">
                <div class="flex items-center text-sm">
                    <i data-lucide="calendar" class="w-4 h-4 mr-2 text-primary-500"></i>
                    <span class="font-medium">Due: ${dateStr}</span>
                </div>
                ${job.location ? `
                <div class="flex items-center text-sm text-slate-500">
                    <i data-lucide="map-pin" class="w-4 h-4 mr-2"></i> ${job.location}
                </div>` : ''}
                ${job.salary ? `
                <div class="flex items-center text-sm text-slate-500">
                    <i data-lucide="dollar-sign" class="w-4 h-4 mr-2"></i> ${job.salary}
                </div>` : ''}
            </div>
        `;
        container.appendChild(el);
    });
    lucide.createIcons();
}

function toggleAlert(id) {
    const alert = alerts.find(a => a.id === id);
    if(alert) {
        alert.isActive = !alert.isActive;
        showToast(`Alert for ${alert.keyword} ${alert.isActive ? 'activated' : 'paused'}`);
        renderAlerts();
    }
}

function renderAlerts() {
    const previewContainer = document.getElementById('alert-preview-container');
    const fullContainer = document.getElementById('alert-full-container');
    
    if(!previewContainer || !fullContainer) return;
    
    let html = '';
    alerts.forEach(alert => {
        const cardClass = alert.isActive ? 'border-primary-500/50 bg-primary-50/50 dark:bg-primary-900/10' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 opacity-80';
        const badgeHTML = alert.isActive ? 
            `<span class="text-xs font-medium px-2 py-1 rounded bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300">Active monitoring</span>` : 
            `<span class="text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">Paused</span>`;
            
        html += `
            <div class="rounded-xl border ${cardClass} p-4 sm:p-5 transition-colors glass-card">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white">${alert.keyword}</h3>
                    <label class="switch">
                        <input type="checkbox" ${alert.isActive ? 'checked' : ''} onchange="toggleAlert('${alert.id}')">
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="flex items-center gap-4 text-sm text-slate-500 mb-4">
                    <div class="flex items-center">
                        <i data-lucide="map-pin" class="w-4 h-4 mr-1"></i> ${alert.location}
                    </div>
                    <div class="flex items-center">
                        <i data-lucide="clock" class="w-4 h-4 mr-1"></i> <span class="capitalize">${alert.frequency}</span>
                    </div>
                </div>
                <div class="flex justify-between items-center">
                    ${badgeHTML}
                    <button class="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium">Edit</button>
                </div>
            </div>
        `;
    });
    
    previewContainer.innerHTML = html;
    fullContainer.innerHTML = html;
    lucide.createIcons();
}

// Chart.js instances
let pChart = null;
let fChart = null;

function initCharts() {
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#64748b'; // slate-400 : slate-500
    const gridColor = isDark ? '#334155' : '#e2e8f0'; // slate-700 : slate-200
    
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: { 
                grid: { display: false, drawBorder: false },
                ticks: { color: textColor }
            },
            y: { 
                grid: { color: gridColor, drawBorder: false },
                ticks: { color: textColor, padding: 10 }
            }
        },
        interaction: { intersect: false, mode: 'index' }
    };

    const ctx1 = document.getElementById('progressChart');
    if (ctx1) {
        if(pChart) pChart.destroy();
        pChart = new Chart(ctx1, { type: 'line', data: analyticsData, options: chartOptions });
    }

    const ctx2 = document.getElementById('fullProgressChart');
    if (ctx2) {
        if(fChart) fChart.destroy();
        fChart = new Chart(ctx2, { type: 'line', data: analyticsData, options: chartOptions });
    }
}

// Update the status badge based on subscription
function updateStatusBadge() {
    const badge = document.getElementById('subscription-status-badge');
    if (!badge) return;
    
    const isSubbed = localStorage.getItem('quiznest_subscribed') === 'true';
    
    if (isSubbed) {
        badge.className = "flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 rounded-full text-sm font-semibold border border-primary-200 dark:border-primary-500/20";
        badge.innerHTML = `<i data-lucide="check-circle-2" class="w-4 h-4"></i> Active`;
    } else {
        badge.className = "flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400 rounded-full text-sm font-semibold border border-primary-200 dark:border-primary-500/20";
        badge.innerHTML = `<i data-lucide="x-circle" class="w-4 h-4"></i> Not Subscribed`;
    }
    lucide.createIcons();
}

// Initial setup
async function init() {
    const savedPhone = localStorage.getItem('quiznest_phone');
    if (savedPhone) {
        isAuthenticated = true;
        userPhone = savedPhone;
        updateAuthUI();
        
        try {
            const subResult = await ensureSubscribed(savedPhone, false);
            if (subResult.subscribed) {
                localStorage.setItem('quiznest_subscribed', 'true');
                updateStatusBadge();
            } else {
                localStorage.setItem('quiznest_subscribed', 'false');
                handleLogout();
            }
        } catch(e) {
            console.error('Initial sub check failed:', e);
            localStorage.setItem('quiznest_subscribed', 'false');
            handleLogout();
        }
    } else {
        updateAuthUI();
    }
}

document.getElementById('unsubscribeBtn').addEventListener('click', async () => {
  let confirmed = true;
  try {
      confirmed = confirm('Are you sure you want to unsubscribe? You will lose access to premium features.');
  } catch(e) {
      // Ignored if blocked by iframe
  }
  if (!confirmed) return;

  const phoneNumber = localStorage.getItem('quiznest_phone');
  if (!phoneNumber) {
    showToast('No phone number found. Please log in again.', 'error');
    return;
  }

  const btn = document.getElementById('unsubscribeBtn');
  btn.disabled = true;
  btn.textContent = 'Unsubscribing...';

  try {
    const result = await unsubscribeUser(phoneNumber);
    console.log('Unsubscribe response:', result); // keep this for debugging

    if (result.success === true) {
      localStorage.setItem('quiznest_subscribed', 'false');
      showToast('You have been unsubscribed successfully.', 'success');
      updateStatusBadge(); // whatever function currently refreshes the UI badge
      handleLogout(); // Logs out from app
    } else {
      showToast('Unsubscribe failed: ' + (result.error || result.statusDetail || 'Unknown error'), 'error');
    }
  } catch (err) {
    console.error('Unsubscribe error:', err);
    showToast('Network error. Please check your connection and try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Unsubscribe';
  }
});

init();
