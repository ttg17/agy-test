// State Management
let releases = [];
let selectedRelease = null;

// DOM Elements
const btnRefresh = document.getElementById('btn-refresh');
const spinnerIcon = document.getElementById('spinner-icon');
const btnRefreshText = document.getElementById('btn-refresh-text');
const btnExportCSV = document.getElementById('btn-export-csv');
const entriesList = document.getElementById('entries-list');
const entriesCount = document.getElementById('entries-count');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('error-message');
const btnCloseError = document.getElementById('btn-close-error');

const detailEmptyState = document.getElementById('detail-empty-state');
const detailContentArea = document.getElementById('detail-content-area');
const detailDate = document.getElementById('detail-date');
const detailUpdatedRaw = document.getElementById('detail-updated-raw');
const detailTitle = document.getElementById('detail-title');
const btnOriginalLink = document.getElementById('btn-original-link');
const btnTweetThis = document.getElementById('btn-tweet-this');
const detailHtmlContent = document.getElementById('detail-html-content');

// Helper to strip HTML tags for snippet creation and tweeting
function stripHtml(htmlString) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    return tempDiv.textContent || tempDiv.innerText || "";
}

// Fetch and load data
async function fetchReleases() {
    // Show spinner and disable button
    spinnerIcon.classList.add('spin');
    btnRefresh.disabled = true;
    btnRefreshText.textContent = "Fetching...";
    errorContainer.classList.add('hidden');
    
    try {
        const response = await fetch('/api/releases');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.status === 'error') {
            throw new Error(result.message);
        }
        
        releases = result.data || [];
        renderSidebar();
        
        // Auto-select the first release if available
        if (releases.length > 0) {
            selectRelease(releases[0]);
        } else {
            showEmptyState();
        }
    } catch (error) {
        console.error("Error fetching release notes:", error);
        errorMessage.textContent = `Failed to fetch release notes: ${error.message}`;
        errorContainer.classList.remove('hidden');
        
        // If we have no cached/loaded releases, show empty state
        if (releases.length === 0) {
            showEmptyState();
        }
    } finally {
        // Hide spinner and enable button
        spinnerIcon.classList.remove('spin');
        btnRefresh.disabled = false;
        btnRefreshText.textContent = "Refresh Feed";
    }
}

// Show/Hide Empty Detail State
function showEmptyState() {
    detailEmptyState.classList.remove('hidden');
    detailContentArea.classList.add('hidden');
}

// Selection handling
function selectRelease(release) {
    selectedRelease = release;
    
    // Highlight active card
    const cards = document.querySelectorAll('.feed-card');
    cards.forEach(card => {
        if (card.dataset.id === release.link) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
    
    // Format date output
    detailDate.textContent = release.title;
    
    if (release.updated) {
        try {
            const dateObj = new Date(release.updated);
            detailUpdatedRaw.textContent = `Published: ${dateObj.toLocaleString()}`;
        } catch(e) {
            detailUpdatedRaw.textContent = `Published: ${release.updated}`;
        }
    } else {
        detailUpdatedRaw.textContent = '';
    }
    
    detailTitle.textContent = `BigQuery Release: ${release.title}`;
    btnOriginalLink.href = release.link || '#';
    
    // Render content HTML safely
    detailHtmlContent.innerHTML = release.content || "<p>No content details available.</p>";
    
    // Show details
    detailEmptyState.classList.add('hidden');
    detailContentArea.classList.remove('hidden');
    
    // Scroll detailed content back to top
    document.querySelector('.detail-body-wrapper').scrollTop = 0;
}

// Copy Release Content to Clipboard
function copyToClipboard(release, btnElement, event) {
    if (event) {
        event.stopPropagation(); // Prevent card selection click trigger
    }
    
    const plainContent = stripHtml(release.content).trim();
    const clipboardText = `BigQuery Update: ${release.title}\nSource: ${release.link}\n\n${plainContent}`;
    
    navigator.clipboard.writeText(clipboardText).then(() => {
        // Change icon to checkmark for feedback
        const originalIconHtml = btnElement.innerHTML;
        btnElement.innerHTML = '<i class="fa-solid fa-check"></i>';
        btnElement.classList.add('copied');
        
        setTimeout(() => {
            btnElement.innerHTML = originalIconHtml;
            btnElement.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
}

// Export Releases List to CSV format
function exportToCSV() {
    if (releases.length === 0) {
        alert("No release data available to export.");
        return;
    }
    
    // Header columns
    const headers = ["Title/Date", "Published ISO", "Source Link", "Description"];
    
    // Construct CSV Rows
    const csvRows = [headers.join(",")];
    
    releases.forEach(release => {
        const plainContent = stripHtml(release.content).replace(/"/g, '""').trim();
        const row = [
            `"${release.title.replace(/"/g, '""')}"`,
            `"${release.updated.replace(/"/g, '""')}"`,
            `"${release.link.replace(/"/g, '""')}"`,
            `"${plainContent}"`
        ];
        csvRows.push(row.join(","));
    });
    
    // Build Blob and trigger download
    const csvContent = "\uFEFF" + csvRows.join("\n"); // Include BOM for proper Excel encoding
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `bigquery_release_notes_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Render the sidebar list
function renderSidebar() {
    entriesList.innerHTML = '';
    entriesCount.textContent = `${releases.length} updates`;
    
    if (releases.length === 0) {
        entriesList.innerHTML = '<div class="loading-placeholder"><p>No updates found.</p></div>';
        return;
    }
    
    releases.forEach((release) => {
        const card = document.createElement('div');
        card.className = 'feed-card';
        card.dataset.id = release.link;
        
        // Strip html to get plain text snippet
        const plainText = stripHtml(release.content);
        const snippet = plainText.length > 90 ? plainText.substring(0, 90) + '...' : plainText;
        
        card.innerHTML = `
            <div class="feed-card-date">${release.title}</div>
            <div class="feed-card-title">BigQuery Update</div>
            <div class="feed-card-snippet">${snippet || 'Select to read this release description.'}</div>
            <button class="btn-card-copy" title="Copy to clipboard">
                <i class="fa-regular fa-copy"></i>
            </button>
        `;
        
        // Setup copy button click
        const copyBtn = card.querySelector('.btn-card-copy');
        copyBtn.addEventListener('click', (e) => copyToClipboard(release, copyBtn, e));
        
        card.addEventListener('click', () => selectRelease(release));
        entriesList.appendChild(card);
    });
}

// Share to Twitter X intent
function tweetRelease() {
    if (!selectedRelease) return;
    
    const plainContent = stripHtml(selectedRelease.content);
    // Build a neat tweet text
    let tweetText = `BigQuery Update (${selectedRelease.title}):\n`;
    
    // Take a snippet of the text to stay within character limits
    const textLimit = 180;
    let snippet = plainContent.trim().replace(/\s+/g, ' ');
    if (snippet.length > textLimit) {
        snippet = snippet.substring(0, textLimit) + '...';
    }
    
    tweetText += `"${snippet}"\n\n`;
    tweetText += `Read more details here:`;
    
    const tweetUrl = selectedRelease.link || 'https://cloud.google.com/bigquery';
    
    // Encode components
    const finalUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(tweetUrl)}`;
    
    // Open X Web Intent
    window.open(finalUrl, '_blank', 'width=550,height=420');
}

// Event Listeners
btnRefresh.addEventListener('click', fetchReleases);
btnExportCSV.addEventListener('click', exportToCSV);
btnTweetThis.addEventListener('click', tweetRelease);
btnCloseError.addEventListener('click', () => errorContainer.classList.add('hidden'));

// Theme Toggle Switcher Logic
const checkboxTheme = document.getElementById('checkbox-theme');
checkboxTheme.addEventListener('change', (e) => {
    if (e.target.checked) {
        document.body.classList.add('light-theme');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-theme');
        localStorage.setItem('theme', 'dark');
    }
});

// Initialize app load
document.addEventListener('DOMContentLoaded', () => {
    // Load local storage theme configuration
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        checkboxTheme.checked = true;
        document.body.classList.add('light-theme');
    }
    fetchReleases();
});
