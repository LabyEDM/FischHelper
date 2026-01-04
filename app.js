// FischPedia Web Interface
const GITHUB_REPO = 'LabyEDM/FischHelper';
const GITHUB_OWNER = 'LabyEDM';
const GITHUB_REPO_NAME = 'FischHelper';
const DATA_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/data/fishdata.json`;

// Tab switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load data if viewing database
    if (tabName === 'view') {
        loadFishDatabase();
    }
}

// Form submission - open prefilled GitHub Issue
document.getElementById('fishForm').addEventListener('submit', function(e) {
    e.preventDefault();
    openGitHubIssue();
});

// Open prefilled GitHub Issue
function openGitHubIssue() {
    // Validate form first
    if (!validateForm()) {
        return;
    }
    
    const fishName = document.getElementById('fishName').value.trim();
    const rarity = document.getElementById('rarity').value;
    const location = document.getElementById('location').value.trim();
    const value = document.getElementById('value').value;
    const powerRequired = document.getElementById('powerRequired').value;
    const speed = document.getElementById('speed').value;
    const controlNeeded = document.getElementById('controlNeeded').value;
    const notes = document.getElementById('notes').value.trim();
    const bestTime = document.getElementById('bestTime').value.trim();
    
    // Format: fishname|rarity|location|value|powerRequired|speed|controlNeeded|notes|bestTime
    const fishEntry = `${fishName}|${rarity}|${location}|${value}|${powerRequired}|${speed}|${controlNeeded}|${notes}|${bestTime}`;
    
    // Create issue body with fish data
    const issueTitle = encodeURIComponent(`Add Fish: ${fishName}`);
    const issueBody = encodeURIComponent(`## Add Fish to Database

**Fish Name:** ${fishName}
**Rarity:** ${rarity}
**Location:** ${location}
**Base Value:** ${value}
**Power Required:** ${powerRequired}
**Speed:** ${speed}
**Control Needed:** ${controlNeeded}
${bestTime ? `**Best Time:** ${bestTime}` : ''}
${notes ? `**Notes:** ${notes}` : ''}

---

**Formatted Entry:**
\`\`\`
${fishEntry}
\`\`\`

---

*This issue was created automatically from the FischPedia web interface. GitHub Actions will automatically add this fish to the database when you submit this issue.*`);
    
    // Create prefilled GitHub Issue URL
    const issueUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO_NAME}/issues/new?title=${issueTitle}&body=${issueBody}&labels=fish-entry`;
    
    // Show info message
    const previewDiv = document.getElementById('preview');
    previewDiv.innerHTML = `
        <div class="alert alert-info">
            <h3>🚀 Opening GitHub Issue...</h3>
            <p>You'll be redirected to GitHub to submit this fish entry.</p>
            <p style="margin-top: 15px;">
                <strong>What happens next:</strong>
            </p>
            <ol style="margin-left: 20px; margin-top: 10px;">
                <li>GitHub will open with a prefilled issue</li>
                <li>Review the information (you can edit if needed)</li>
                <li>Click "Submit new issue" (you'll need to sign in to GitHub)</li>
                <li>GitHub Actions will automatically add the fish to the database!</li>
            </ol>
            <p style="margin-top: 15px;">
                <a href="${issueUrl}" target="_blank" class="btn btn-primary" style="text-decoration: none; display: inline-block;">
                    📝 Open GitHub Issue
                </a>
            </p>
        </div>
    `;
    previewDiv.style.display = 'block';
    
    // Open GitHub Issue in new tab
    window.open(issueUrl, '_blank');
}

// Validate form before publishing
function validateForm() {
    const fishName = document.getElementById('fishName').value.trim();
    const rarity = document.getElementById('rarity').value;
    const location = document.getElementById('location').value.trim();
    const value = document.getElementById('value').value;
    const powerRequired = document.getElementById('powerRequired').value;
    const speed = document.getElementById('speed').value;
    const controlNeeded = document.getElementById('controlNeeded').value;
    
    if (!fishName || !rarity || !location || !value || !powerRequired || !speed || !controlNeeded) {
        alert('Please fill in all required fields (marked with *)');
        return false;
    }
    return true;
}

// Token management UI removed - will be added back later
// GitHub API code removed - now using network share approach

// Clear form
function clearForm() {
    document.getElementById('fishForm').reset();
    document.getElementById('preview').style.display = 'none';
}

// Load fish database from GitHub
async function loadFishDatabase() {
    const fishList = document.getElementById('fishList');
    fishList.innerHTML = '<p>Loading fish database from GitHub...</p>';
    
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) {
            throw new Error('Failed to load data');
        }
        
        const text = await response.text();
        const fishData = parseFishData(text);
        
        if (fishData.length === 0) {
            fishList.innerHTML = '<p>No fish data found. Be the first to add one!</p>';
            return;
        }
        
        displayFishList(fishData);
    } catch (error) {
        console.error('Error loading fish data:', error);
        fishList.innerHTML = `
            <div class="alert alert-info">
                <strong>⚠️ Could not load from GitHub.</strong> 
                This might be because the repository is private or the file doesn't exist yet.
                <br><br>
                <a href="https://github.com/${GITHUB_OWNER}/${GITHUB_REPO_NAME}/tree/main/data" target="_blank" class="github-link">
                    Check GitHub Repository
                </a>
            </div>
        `;
    }
}

// Parse fish data from pipe-delimited format
function parseFishData(text) {
    const lines = text.split('\n');
    const fishData = [];
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//')) {
            continue;
        }
        
        const parts = trimmed.split('|');
        if (parts.length >= 6) {
            fishData.push({
                name: parts[0]?.trim() || '',
                rarity: parts[1]?.trim() || '',
                location: parts[2]?.trim() || '',
                value: parts[3]?.trim() || '',
                powerRequired: parts[4]?.trim() || '',
                speed: parts[5]?.trim() || '',
                controlNeeded: parts[6]?.trim() || 'N/A',
                notes: parts[7]?.trim() || '',
                bestTime: parts[8]?.trim() || ''
            });
        }
    }
    
    return fishData;
}

// Display fish list
function displayFishList(fishData) {
    const fishList = document.getElementById('fishList');
    
    if (fishData.length === 0) {
        fishList.innerHTML = '<p>No fish found in database.</p>';
        return;
    }
    
    // Sort by rarity (legendary first)
    const rarityOrder = { 'Legendary': 0, 'Epic': 1, 'Rare': 2, 'Uncommon': 3, 'Common': 4 };
    fishData.sort((a, b) => {
        const aOrder = rarityOrder[a.rarity] ?? 5;
        const bOrder = rarityOrder[b.rarity] ?? 5;
        return aOrder - bOrder;
    });
    
    fishList.innerHTML = fishData.map(fish => `
        <div class="fish-card">
            <h3>${escapeHtml(fish.name)}</h3>
            <span class="rarity-badge rarity-${fish.rarity.toLowerCase()}">${fish.rarity}</span>
            <div class="info">
                <div class="info-item">
                    <span class="info-label">Location:</span> ${escapeHtml(fish.location)}
                </div>
                <div class="info-item">
                    <span class="info-label">Value:</span> ${escapeHtml(fish.value)}
                </div>
                <div class="info-item">
                    <span class="info-label">Power Required:</span> ${escapeHtml(fish.powerRequired)}
                </div>
                <div class="info-item">
                    <span class="info-label">Speed:</span> ${escapeHtml(fish.speed)}
                </div>
                <div class="info-item">
                    <span class="info-label">Control Needed:</span> ${escapeHtml(fish.controlNeeded)}
                </div>
                ${fish.bestTime ? `
                <div class="info-item">
                    <span class="info-label">Best Time:</span> ${escapeHtml(fish.bestTime)}
                </div>
                ` : ''}
            </div>
            ${fish.notes ? `
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                <strong>Notes:</strong> ${escapeHtml(fish.notes)}
            </div>
            ` : ''}
        </div>
    `).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load database on page load if on view tab
document.addEventListener('DOMContentLoaded', function() {
    // Check if we should load the database
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tab') === 'view') {
        switchTab('view');
    }
});


