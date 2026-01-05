// FischPedia Complete Database Manager
const GITHUB_REPO = 'LabyEDM/FischHelper';
const GITHUB_OWNER = 'LabyEDM';
const GITHUB_REPO_NAME = 'FischHelper';
const DATA_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/data/fishdata.json`;

let currentDatabase = {};
let currentCategory = null;
let editingEntry = null;

// Tab switching
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'view') {
        loadDatabase();
    } else if (tabName === 'edit') {
        loadEditForm();
    }
}

// Category form definitions
const categoryForms = {
    fish: {
        fields: [
            { id: 'name', label: 'Fish Name *', type: 'text', required: true },
            { id: 'weight', label: 'Weight', type: 'text' },
            { id: 'rarity', label: 'Rarity *', type: 'select', required: true, options: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'] },
            { id: 'value', label: 'Value *', type: 'number', required: true },
            { id: 'preferredBait', label: 'Preferred Bait', type: 'text' },
            { id: 'mutationAttributes', label: 'Mutation Attributes', type: 'text' },
            { id: 'weatherCondition', label: 'Weather Condition', type: 'text' },
            { id: 'time', label: 'Time', type: 'time' },
            { id: 'season', label: 'Season', type: 'text' },
            { id: 'radarLocation', label: 'Radar Location', type: 'text' }
        ]
    },
    rods: {
        fields: [
            { id: 'name', label: 'Rod Name *', type: 'text', required: true },
            { id: 'lureSpeed', label: 'Lure Speed', type: 'text' },
            { id: 'luck', label: 'Luck', type: 'text' },
            { id: 'control', label: 'Control', type: 'text' },
            { id: 'resilience', label: 'Resilience', type: 'text' },
            { id: 'maxKG', label: 'Max KG', type: 'text' },
            { id: 'uniqueAbility', label: 'Unique Ability', type: 'textarea' },
            { id: 'uniqueMechanic', label: 'Unique Mechanic', type: 'textarea' }
        ]
    },
    baits: {
        fields: [
            { id: 'name', label: 'Bait Name *', type: 'text', required: true },
            { id: 'preferredLuck', label: 'Preferred Luck', type: 'text' },
            { id: 'universalLuck', label: 'Universal Luck', type: 'text' },
            { id: 'resilience', label: 'Resilience', type: 'text' },
            { id: 'lureSpeed', label: 'Lure Speed', type: 'text' },
            { id: 'uniqueAbility', label: 'Unique Ability', type: 'textarea' },
            { id: 'favoringFish', label: 'Favoring Fish', type: 'text', multi: true },
            { id: 'whereObtained', label: 'Where Obtained', type: 'text' }
        ]
    },
    mutations: {
        fields: [
            { id: 'name', label: 'Mutation Name *', type: 'text', required: true },
            { id: 'mutationMultiplier', label: 'Mutation Multiplier (e.g., 1.5x, 2x, 0.75x) *', type: 'text', required: true, placeholder: 'Format: 1.5x or 2x' },
            { id: 'mutationPriority', label: 'Mutation Priority', type: 'text' },
            { id: 'notes', label: 'Notes', type: 'textarea' }
        ]
    },
    attributes: {
        fields: [
            { id: 'name', label: 'Attribute Name *', type: 'text', required: true },
            { id: 'multiplier', label: 'Multiplier (e.g., 1.5x, 2x, 0.75x) *', type: 'text', required: true, placeholder: 'Format: 1.5x or 2x' },
            { id: 'description', label: 'Description', type: 'textarea' }
        ]
    },
    potions: {
        fields: [
            { id: 'name', label: 'Potion Name *', type: 'text', required: true },
            { id: 'effect', label: 'Effect', type: 'textarea' },
            { id: 'duration', label: 'Duration (HH:MM)', type: 'time' },
            { id: 'notes', label: 'Notes', type: 'textarea' }
        ]
    },
    utility: {
        fields: [
            { id: 'name', label: 'Item Name *', type: 'text', required: true },
            { id: 'equipableGear', label: 'Equipable Gear', type: 'text' },
            { id: 'ability', label: 'Ability/Notes', type: 'textarea' }
        ]
    },
    weather: {
        fields: [
            { id: 'name', label: 'Weather Type *', type: 'text', required: true },
            { id: 'notes', label: 'Notes/Buffs', type: 'textarea' },
            { id: 'locks', label: 'Locks (Fish/Mutations)', type: 'text', multi: true },
            { id: 'unlocks', label: 'Unlocks (Fish/Mutations)', type: 'text', multi: true }
        ]
    },
    season: {
        fields: [
            { id: 'name', label: 'Season Name *', type: 'text', required: true },
            { id: 'fishPreferred', label: 'Fish Preferred Season', type: 'text', multi: true },
            { id: 'unlocks', label: 'Unlocks', type: 'text', multi: true },
            { id: 'locks', label: 'Locks', type: 'text', multi: true }
        ]
    },
    enchanting: {
        fields: [
            { id: 'name', label: 'Enchantment Name *', type: 'text', required: true },
            { id: 'enchantment', label: 'What Enchantment', type: 'text' },
            { id: 'relic', label: 'What Relic', type: 'text' },
            { id: 'primarySlot', label: 'Primary Slot', type: 'text' },
            { id: 'secondarySlot', label: 'Secondary Slot', type: 'text' },
            { id: 'perkBuffAbility', label: 'Perk/Buff/Ability', type: 'textarea' }
        ]
    },
    events: {
        fields: [
            { id: 'name', label: 'Event Name *', type: 'text', required: true },
            { id: 'description', label: 'Description', type: 'textarea' },
            { id: 'startDate', label: 'Start Date', type: 'date' },
            { id: 'endDate', label: 'End Date', type: 'date' },
            { id: 'buffs', label: 'Buffs', type: 'textarea' }
        ]
    },
    locations: {
        fields: [
            { id: 'name', label: 'Location Name *', type: 'text', required: true },
            { id: 'description', label: 'Description', type: 'textarea' },
            { id: 'fishFound', label: 'Fish Found Here', type: 'text', multi: true },
            { id: 'notes', label: 'Notes', type: 'textarea' }
        ]
    },
    'admin-events': {
        fields: [
            { id: 'name', label: 'Event Name *', type: 'text', required: true },
            { id: 'buffs', label: 'Buffs', type: 'textarea' },
            { id: 'fish', label: 'Fish', type: 'text', multi: true },
            { id: 'mutations', label: 'Mutations', type: 'text', multi: true }
        ]
    },
    'totem-events': {
        fields: [
            { id: 'name', label: 'Event Name *', type: 'text', required: true },
            { id: 'description', label: 'Description', type: 'textarea' },
            { id: 'buffs', label: 'Buffs', type: 'textarea' }
        ]
    },
    'mini-events': {
        fields: [
            { id: 'name', label: 'Event Name *', type: 'text', required: true },
            { id: 'description', label: 'Description', type: 'textarea' },
            { id: 'buffs', label: 'Buffs', type: 'textarea' }
        ]
    }
};

// Load category form
function loadCategoryForm() {
    const category = document.getElementById('categorySelect').value;
    if (!category) {
        document.getElementById('formFields').innerHTML = '<p style="color: #666; text-align: center; padding: 40px;">Please select a category above to load the form.</p>';
        document.getElementById('submitBtn').style.display = 'none';
        return;
    }
    
    currentCategory = category;
    const formDef = categoryForms[category];
    if (!formDef) return;
    
    let html = '';
    formDef.fields.forEach(field => {
        if (field.multi) {
            html += createMultiInputField(field);
        } else {
            html += createField(field);
        }
    });
    
    document.getElementById('formFields').innerHTML = html;
    document.getElementById('submitBtn').style.display = 'block';
}

// Create single field
function createField(field) {
    const required = field.required ? 'required' : '';
    let input = '';
    
    if (field.type === 'select') {
        input = `<select id="${field.id}" ${required}>`;
        input += `<option value="">Select ${field.label.replace('*', '').trim()}</option>`;
        field.options.forEach(opt => {
            input += `<option value="${opt}">${opt}</option>`;
        });
        input += `</select>`;
    } else if (field.type === 'textarea') {
        const placeholder = field.placeholder || field.label;
        input = `<textarea id="${field.id}" ${required} placeholder="${placeholder}"></textarea>`;
    } else {
        const placeholder = field.placeholder || field.label;
        input = `<input type="${field.type}" id="${field.id}" ${required} placeholder="${placeholder}">`;
    }
    
    return `
        <div class="form-group">
            <label for="${field.id}">${field.label}</label>
            ${input}
        </div>
    `;
}

// Create multi-input field (for arrays)
function createMultiInputField(field) {
    return `
        <div class="form-group">
            <label>${field.label}</label>
            <div class="multi-input-group">
                <input type="text" id="${field.id}_input" placeholder="Add ${field.label.toLowerCase()}">
                <button type="button" onclick="addMultiValue('${field.id}')">Add</button>
            </div>
            <div id="${field.id}_tags" class="tag-list"></div>
            <input type="hidden" id="${field.id}" name="${field.id}">
        </div>
    `;
}

// Add multi-value
function addMultiValue(fieldId) {
    const input = document.getElementById(`${fieldId}_input`);
    const value = input.value.trim();
    if (!value) return;
    
    const tagsDiv = document.getElementById(`${fieldId}_tags`);
    const hiddenInput = document.getElementById(fieldId);
    const currentValues = hiddenInput.value ? hiddenInput.value.split('|') : [];
    
    if (currentValues.includes(value)) {
        alert('This value already exists');
        return;
    }
    
    currentValues.push(value);
    hiddenInput.value = currentValues.join('|');
    
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML = `
        <span>${escapeHtml(value)}</span>
        <span class="tag-remove" onclick="removeMultiValue('${fieldId}', '${escapeHtml(value)}')">×</span>
    `;
    tagsDiv.appendChild(tag);
    
    input.value = '';
}

// Remove multi-value
function removeMultiValue(fieldId, value) {
    const hiddenInput = document.getElementById(fieldId);
    const currentValues = hiddenInput.value ? hiddenInput.value.split('|') : [];
    const filtered = currentValues.filter(v => v !== value);
    hiddenInput.value = filtered.join('|');
    
    loadMultiValueTags(fieldId);
}

// Load multi-value tags
function loadMultiValueTags(fieldId) {
    const hiddenInput = document.getElementById(fieldId);
    const tagsDiv = document.getElementById(`${fieldId}_tags`);
    const values = hiddenInput.value ? hiddenInput.value.split('|') : [];
    
    tagsDiv.innerHTML = '';
    values.forEach(value => {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `
            <span>${escapeHtml(value)}</span>
            <span class="tag-remove" onclick="removeMultiValue('${fieldId}', '${escapeHtml(value)}')">×</span>
        `;
        tagsDiv.appendChild(tag);
    });
}

// Form submission
document.getElementById('entryForm').addEventListener('submit', function(e) {
    e.preventDefault();
    openGitHubIssue('add');
});

// Open GitHub Issue
function openGitHubIssue(action = 'add') {
    const category = action === 'edit' ? document.getElementById('editCategorySelect').value : document.getElementById('categorySelect').value;
    if (!category) {
        alert('Please select a category');
        return;
    }
    
    const formDef = categoryForms[category];
    const formData = {};
    let entryName = '';
    
    formDef.fields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element) {
            formData[field.id] = element.value.trim();
            if (field.id === 'name') {
                entryName = element.value.trim();
            }
        }
    });
    
    if (!entryName) {
        alert('Name is required');
        return;
    }
    
    // Validate multiplier format if present
    if (formData.mutationMultiplier) {
        const multiplierPattern = /^\d+(\.\d+)?x$/i;
        if (!multiplierPattern.test(formData.mutationMultiplier)) {
            alert('Mutation Multiplier must be in format: 1.5x, 2x, 0.75x, etc.');
            return;
        }
    }
    if (formData.multiplier) {
        const multiplierPattern = /^\d+(\.\d+)?x$/i;
        if (!multiplierPattern.test(formData.multiplier)) {
            alert('Multiplier must be in format: 1.5x, 2x, 0.75x, etc.');
            return;
        }
    }
    
    // Create formatted entry (JSON format)
    const entryData = {
        category: category,
        ...formData
    };
    
    const formattedEntry = JSON.stringify(entryData, null, 2);
    
    // Create issue body
    let issueBody = `## ${action === 'edit' ? 'Edit' : 'Add'} ${category.charAt(0).toUpperCase() + category.slice(1)} Entry\n\n`;
    issueBody += `**Entry Name:** ${entryName}\n\n`;
    
    formDef.fields.forEach(field => {
        if (field.id !== 'name' && formData[field.id]) {
            issueBody += `**${field.label.replace('*', '').trim()}:** ${formData[field.id]}\n`;
        }
    });
    
    issueBody += `\n---\n\n**Formatted Entry:**\n\`\`\`json\n${formattedEntry}\n\`\`\`\n\n---\n\n`;
    issueBody += `*This issue was created automatically from the FischPedia web interface. GitHub Actions will automatically ${action === 'edit' ? 'update' : 'add'} this entry to the database when you submit this issue.*`;
    
    const issueTitle = encodeURIComponent(`${action === 'edit' ? 'Edit' : 'Add'} ${category.charAt(0).toUpperCase() + category.slice(1)}: ${entryName}`);
    const issueBodyEncoded = encodeURIComponent(issueBody);
    const issueUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO_NAME}/issues/new?title=${issueTitle}&body=${issueBodyEncoded}`;
    
    window.open(issueUrl, '_blank');
    
    // Show success message
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success';
    alertDiv.innerHTML = `<strong>✅ GitHub Issue Opened!</strong> The issue has been opened in a new tab. Please submit it on GitHub.`;
    document.getElementById('entryForm').insertBefore(alertDiv, document.getElementById('entryForm').firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Clear form
function clearForm() {
    document.getElementById('entryForm').reset();
    document.getElementById('categorySelect').value = '';
    loadCategoryForm();
}

// Load database
async function loadDatabase() {
    const dataList = document.getElementById('dataList');
    dataList.innerHTML = '<p>Loading database from GitHub...</p>';
    
    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) {
            throw new Error('Failed to load data');
        }
        
        const text = await response.text();
        currentDatabase = parseDatabase(text);
        
        displayDatabase();
    } catch (error) {
        console.error('Error loading data:', error);
        dataList.innerHTML = `
            <div class="alert alert-danger">
                <strong>⚠️ Could not load from GitHub.</strong> 
                This might be because the repository is private or the file doesn't exist yet.
            </div>
        `;
    }
}

// Parse database (supports both old pipe format and new JSON format)
function parseDatabase(text) {
    const database = {
        fish: [],
        rods: [],
        baits: [],
        mutations: [],
        attributes: [],
        potions: [],
        utility: [],
        weather: [],
        season: [],
        enchanting: [],
        events: [],
        locations: [],
        'admin-events': [],
        'totem-events': [],
        'mini-events': []
    };
    
    // Try to parse as JSON first
    try {
        const jsonData = JSON.parse(text);
        if (typeof jsonData === 'object' && !Array.isArray(jsonData)) {
            return jsonData;
        }
    } catch (e) {
        // Not JSON, try old pipe format
    }
    
    // Parse old pipe format (fish only)
    const lines = text.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//')) continue;
        
        const parts = trimmed.split('|');
        if (parts.length >= 6) {
            database.fish.push({
                name: parts[0]?.trim() || '',
                rarity: parts[1]?.trim() || '',
                location: parts[2]?.trim() || '',
                value: parts[3]?.trim() || '',
                powerRequired: parts[4]?.trim() || '',
                speed: parts[5]?.trim() || '',
                controlNeeded: parts[6]?.trim() || '',
                notes: parts[7]?.trim() || '',
                bestTime: parts[8]?.trim() || '',
                category: 'fish'
            });
        }
    }
    
    return database;
}

// Display database
function displayDatabase() {
    const category = document.getElementById('viewCategorySelect')?.value || '';
    const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();
    
    const dataList = document.getElementById('dataList');
    let html = '';
    let hasEntries = false;
    
    Object.keys(currentDatabase).forEach(cat => {
        if (category && cat !== category) return;
        
        const entries = currentDatabase[cat] || [];
        const filtered = entries.filter(entry => {
            if (!searchTerm) return true;
            const entryStr = JSON.stringify(entry).toLowerCase();
            return entryStr.includes(searchTerm);
        });
        
        if (filtered.length > 0) {
            hasEntries = true;
            html += `<h3 style="margin-top: 20px; color: #667eea;">${cat.charAt(0).toUpperCase() + cat.slice(1)}</h3>`;
            
            filtered.forEach(entry => {
                html += createDataCard(entry, cat);
            });
        }
    });
    
    if (!hasEntries) {
        html = '<p>No entries found.</p>';
    }
    
    dataList.innerHTML = html;
}

// Create data card
function createDataCard(entry, category) {
    let infoHtml = '';
    Object.keys(entry).forEach(key => {
        if (key === 'category' || key === 'name') return;
        const value = entry[key];
        if (value) {
            infoHtml += `
                <div class="info-item">
                    <span class="info-label">${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:</span> 
                    ${escapeHtml(String(value))}
                </div>
            `;
        }
    });
    
    return `
        <div class="data-card">
            <h3>
                ${escapeHtml(entry.name || 'Unnamed')}
                <span class="category-badge">${category}</span>
            </h3>
            <div class="info">${infoHtml}</div>
            <button class="edit-btn" onclick="startEdit('${category}', '${escapeHtml(entry.name)}')" style="margin-top: 15px;">
                ✏️ Edit
            </button>
        </div>
    `;
}

// Filter database
function filterDatabase() {
    displayDatabase();
}

// Load edit form
function loadEditForm() {
    const category = document.getElementById('editCategorySelect').value;
    if (!category) {
        document.getElementById('editFormFields').innerHTML = '<p style="color: #666; text-align: center; padding: 40px;">Please select a category above.</p>';
        document.getElementById('editEntrySelect').innerHTML = '<option value="">Select Entry to Edit</option>';
        document.getElementById('editSubmitBtn').style.display = 'none';
        return;
    }
    
    // Populate entry select
    const entries = currentDatabase[category] || [];
    const select = document.getElementById('editEntrySelect');
    select.innerHTML = '<option value="">Select Entry to Edit</option>';
    
    entries.forEach(entry => {
        const option = document.createElement('option');
        option.value = entry.name;
        option.textContent = entry.name;
        select.appendChild(option);
    });
    
    if (entries.length === 0) {
        document.getElementById('editFormFields').innerHTML = '<p style="color: #666; text-align: center; padding: 40px;">No entries found for this category. Load the database first.</p>';
    }
}

// Load entry for edit
function loadEntryForEdit() {
    const category = document.getElementById('editCategorySelect').value;
    const entryName = document.getElementById('editEntrySelect').value;
    
    if (!category || !entryName) {
        document.getElementById('editFormFields').innerHTML = '<p style="color: #666; text-align: center; padding: 40px;">Please select a category and entry above.</p>';
        document.getElementById('editSubmitBtn').style.display = 'none';
        return;
    }
    
    const entries = currentDatabase[category] || [];
    const entry = entries.find(e => e.name === entryName);
    
    if (!entry) {
        alert('Entry not found');
        return;
    }
    
    editingEntry = entry;
    
    // Load form
    const formDef = categoryForms[category];
    if (!formDef) return;
    
    let html = '';
    formDef.fields.forEach(field => {
        if (field.multi) {
            html += createMultiInputField(field);
        } else {
            html += createField(field);
        }
    });
    
    document.getElementById('editFormFields').innerHTML = html;
    document.getElementById('editSubmitBtn').style.display = 'block';
    
    // Populate fields
    formDef.fields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element && entry[field.id]) {
            if (field.multi) {
                const values = String(entry[field.id]).split('|');
                element.value = entry[field.id];
                values.forEach(val => {
                    if (val.trim()) {
                        const tagsDiv = document.getElementById(`${field.id}_tags`);
                        const tag = document.createElement('div');
                        tag.className = 'tag';
                        tag.innerHTML = `
                            <span>${escapeHtml(val.trim())}</span>
                            <span class="tag-remove" onclick="removeMultiValue('${field.id}', '${escapeHtml(val.trim())}')">×</span>
                        `;
                        tagsDiv.appendChild(tag);
                    }
                });
            } else {
                element.value = entry[field.id];
            }
        }
    });
}

// Start edit from view tab
function startEdit(category, name) {
    switchTab('edit');
    document.getElementById('editCategorySelect').value = category;
    loadEditForm();
    document.getElementById('editEntrySelect').value = name;
    loadEntryForEdit();
}

// Edit form submission
document.getElementById('editForm').addEventListener('submit', function(e) {
    e.preventDefault();
    openGitHubIssue('edit');
});

// Clear edit form
function clearEditForm() {
    document.getElementById('editForm').reset();
    document.getElementById('editCategorySelect').value = '';
    document.getElementById('editEntrySelect').value = '';
    loadEditForm();
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load database on page load
document.addEventListener('DOMContentLoaded', function() {
    loadDatabase();
});
