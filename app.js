// FischPedia Web Interface
const GITHUB_REPO = 'LabyEDM/FischHelper';
const GITHUB_OWNER = 'LabyEDM';
const GITHUB_REPO_NAME = 'FischHelper';
const DATA_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/data/fishdata.json`;
const GITHUB_API_BASE = 'https://api.github.com';

// Load saved token from localStorage
let githubToken = localStorage.getItem('github_token') || '';

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

// Form submission - publish directly to GitHub
document.getElementById('fishForm').addEventListener('submit', function(e) {
    e.preventDefault();
    addFishToGitHub();
});

// Generate formatted fish data (for internal use)
function generateFishData() {
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
    return `${fishName}|${rarity}|${location}|${value}|${powerRequired}|${speed}|${controlNeeded}|${notes}|${bestTime}`;
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
// Token is automatically loaded from localStorage on page load

// Add fish directly to GitHub - edits data/fishdata.json in the repository
async function addFishToGitHub() {
    if (!githubToken) {
        alert('GitHub token not found. Please configure token access. Token management UI will be added back later.');
        return;
    }
    
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
    
    // Format the new fish entry using the helper function
    const newEntry = generateFishData();
    
    // Show loading state
    const publishBtn = document.getElementById('publishBtn');
    const originalText = publishBtn.textContent;
    publishBtn.disabled = true;
    publishBtn.textContent = '⏳ Publishing...';
    
    try {
        // Get current file content from data/fishdata.json
        const fileResponse = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO_NAME}/contents/data/fishdata.json`, {
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!fileResponse.ok) {
            throw new Error(`Failed to get file: ${fileResponse.statusText}`);
        }
        
        const fileData = await fileResponse.json();
        const currentContent = atob(fileData.content.replace(/\n/g, ''));
        
        // Check if fish already exists
        if (currentContent.includes(`${fishName}|`)) {
            if (!confirm(`Fish "${fishName}" already exists. Do you want to replace it?`)) {
                return;
            }
            // Remove old entry
            const lines = currentContent.split('\n');
            const filteredLines = lines.filter(line => !line.trim().startsWith(`${fishName}|`));
            var updatedContent = filteredLines.join('\n').trim();
        } else {
            var updatedContent = currentContent.trim();
        }
        
        // Add new entry
        if (updatedContent && !updatedContent.endsWith('\n')) {
            updatedContent += '\n';
        }
        updatedContent += newEntry + '\n';
        
        // Encode content
        const encodedContent = btoa(updatedContent);
        
        // Update file
        const updateResponse = await fetch(`${GITHUB_API_BASE}/repos/${GITHUB_OWNER}/${GITHUB_REPO_NAME}/contents/data/fishdata.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Add fish: ${fishName}`,
                content: encodedContent,
                sha: fileData.sha
            })
        });
        
        if (updateResponse.ok) {
            const result = await updateResponse.json();
            // Show success message
            const previewDiv = document.getElementById('preview');
            previewDiv.innerHTML = `
                <div class="alert alert-success">
                    <h3>✅ Successfully Published to GitHub!</h3>
                    <p><strong>Fish:</strong> ${fishName}</p>
                    <p><strong>File Updated:</strong> <code>data/fishdata.json</code></p>
                    <p><strong>Commit:</strong> ${result.commit.sha.substring(0, 7)}</p>
                    <p>Your fish has been directly added to the repository's main branch!</p>
                    <p style="margin-top: 15px;">
                        <a href="https://github.com/${GITHUB_OWNER}/${GITHUB_REPO_NAME}/commit/${result.commit.sha}" target="_blank" class="github-link">
                            View Commit on GitHub
                        </a>
                        <a href="https://github.com/${GITHUB_OWNER}/${GITHUB_REPO_NAME}/blob/main/data/fishdata.json" target="_blank" class="github-link" style="margin-left: 10px;">
                            View Updated File
                        </a>
                    </p>
                </div>
            `;
            previewDiv.style.display = 'block';
            
            // Reset button
            publishBtn.disabled = false;
            publishBtn.textContent = originalText;
            
            // Clear form
            clearForm();
            
            // Reload database if on view tab
            setTimeout(() => {
                if (document.getElementById('view-tab').classList.contains('active')) {
                    loadFishDatabase();
                }
            }, 1000);
        } else {
            const error = await updateResponse.json();
            throw new Error(error.message || 'Failed to update file');
        }
    } catch (error) {
        // Reset button on error
        publishBtn.disabled = false;
        publishBtn.textContent = originalText;
        
        alert(`❌ Error publishing to GitHub:\n${error.message}\n\nMake sure your token has 'repo' permissions and the repository exists.`);
        console.error('GitHub API Error:', error);
    }
}

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
    
    // Update auto-submit info
    updateAutoSubmitInfo();
});

// Update auto-submit info display
function updateAutoSubmitInfo() {
    const infoDiv = document.getElementById('autoSubmitInfo');
    if (infoDiv) {
        if (githubToken) {
            infoDiv.innerHTML = '<p><strong>✅ Publish Enabled!</strong> Click "🚀 Publish to GitHub" above to automatically add the fish to the database.</p>';
        } else {
            infoDiv.innerHTML = '<p><strong>💡 Publish:</strong> Token management UI will be added back later. For now, token must be configured manually.</p>';
        }
    }
    
    // Update publish button state
    const publishBtn = document.getElementById('publishBtn');
    if (publishBtn) {
        if (githubToken) {
            publishBtn.disabled = false;
            publishBtn.style.opacity = '1';
        } else {
            publishBtn.disabled = true;
            publishBtn.style.opacity = '0.6';
            publishBtn.title = 'GitHub token required';
        }
    }
}

// Token management UI removed - will be added back later

