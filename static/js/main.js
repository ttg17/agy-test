// State Management
let releases = [];
let filteredReleases = [];
let selectedRelease = null;
let searchFilter = "";

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
const inputSearch = document.getElementById('input-search');
const toastContainer = document.getElementById('toast-container');

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

// Show Toast Alert Notifications
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fa-solid fa-circle-check toast-icon-success"></i>
        <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    
    // Automatically fade out and remove toast after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Render Custom Loading Skeletons
function showLoadingSkeletons() {
    entriesList.innerHTML = '';
    for (let i = 0; i < 4; i++) {
        const skeletonCard = document.createElement('div');
        skeletonCard.className = 'skeleton-card';
        skeletonCard.innerHTML = `
            <div class="skeleton-pulse skeleton-date"></div>
            <div class="skeleton-pulse skeleton-title"></div>
            <div class="skeleton-pulse skeleton-text"></div>
            <div class="skeleton-pulse skeleton-text-short"></div>
        `;
        entriesList.appendChild(skeletonCard);
    }
}

// Fetch and load data
async function fetchReleases() {
    // Show spinner and skeleton placeholders
    spinnerIcon.classList.add('spin');
    btnRefresh.disabled = true;
    btnRefreshText.textContent = "Fetching...";
    errorContainer.classList.add('hidden');
    showLoadingSkeletons();
    
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
        filteredReleases = [...releases];
        renderSidebar();
        
        // Auto-select the first release if available
        if (filteredReleases.length > 0) {
            selectRelease(filteredReleases[0]);
        } else {
            showEmptyState();
        }
    } catch (error) {
        console.error("Error fetching release notes:", error);
        errorMessage.textContent = `Failed to fetch release notes: ${error.message}`;
        errorContainer.classList.remove('hidden');
        
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
        // Local card button check feedback
        const originalIconHtml = btnElement.innerHTML;
        btnElement.innerHTML = '<i class="fa-solid fa-check"></i>';
        btnElement.classList.add('copied');
        
        // Show global toast alert notification
        showToast(`Copied the ${release.title} update to clipboard!`);
        
        setTimeout(() => {
            btnElement.innerHTML = originalIconHtml;
            btnElement.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Could not copy text: ', err);
        alert("Clipboard copying failed.");
    });
}

// Export Releases List to CSV format
function exportToCSV() {
    if (releases.length === 0) {
        alert("No release data available to export.");
        return;
    }
    
    const headers = ["Title/Date", "Published ISO", "Source Link", "Description"];
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
    
    const csvContent = "\uFEFF" + csvRows.join("\n"); 
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `bigquery_release_notes_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("Successfully exported release logs to CSV!");
}

// Render the sidebar list
function renderSidebar() {
    entriesList.innerHTML = '';
    
    // Filter based on search query
    filteredReleases = releases.filter(release => {
        const titleMatch = release.title.toLowerCase().includes(searchFilter.toLowerCase());
        const contentMatch = stripHtml(release.content).toLowerCase().includes(searchFilter.toLowerCase());
        return titleMatch || contentMatch;
    });
    
    entriesCount.textContent = `${filteredReleases.length} updates`;
    
    if (filteredReleases.length === 0) {
        entriesList.innerHTML = `
            <div class="search-empty-state">
                <i class="fa-solid fa-magnifying-glass-minus"></i>
                <p>No matching updates found for "${searchFilter}"</p>
            </div>
        `;
        return;
    }
    
    filteredReleases.forEach((release) => {
        const card = document.createElement('div');
        card.className = 'feed-card';
        card.dataset.id = release.link;
        if (selectedRelease && selectedRelease.link === release.link) {
            card.classList.add('active');
        }
        
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
    let tweetText = `BigQuery Update (${selectedRelease.title}):\n`;
    
    const textLimit = 180;
    let snippet = plainContent.trim().replace(/\s+/g, ' ');
    if (snippet.length > textLimit) {
        snippet = snippet.substring(0, textLimit) + '...';
    }
    
    tweetText += `"${snippet}"\n\n`;
    tweetText += `Read more details here:`;
    
    const tweetUrl = selectedRelease.link || 'https://cloud.google.com/bigquery';
    const finalUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(tweetUrl)}`;
    
    window.open(finalUrl, '_blank', 'width=550,height=420');
}

// Keyboard Navigation Handler (ArrowUp / ArrowDown)
window.addEventListener('keydown', (e) => {
    if (filteredReleases.length === 0) return;
    
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); // Stop normal viewport browser scrolling
        
        let currentIndex = filteredReleases.findIndex(r => r.link === selectedRelease?.link);
        
        if (e.key === 'ArrowDown') {
            currentIndex = (currentIndex + 1 < filteredReleases.length) ? currentIndex + 1 : currentIndex;
        } else {
            currentIndex = (currentIndex - 1 >= 0) ? currentIndex - 1 : currentIndex;
        }
        
        const targetRelease = filteredReleases[currentIndex];
        if (targetRelease) {
            selectRelease(targetRelease);
            
            // Auto scroll sidebar card element into visible container context
            const activeCard = entriesList.querySelector(`[data-id="${targetRelease.link}"]`);
            if (activeCard) {
                activeCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }
});

// Event Listeners
btnRefresh.addEventListener('click', fetchReleases);
btnExportCSV.addEventListener('click', exportToCSV);
btnTweetThis.addEventListener('click', tweetRelease);
btnCloseError.addEventListener('click', () => errorContainer.classList.add('hidden'));

// Search input listener
inputSearch.addEventListener('input', (e) => {
    searchFilter = e.target.value;
    renderSidebar();
});

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
