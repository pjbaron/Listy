import { BoardManager } from './board-manager.js';
import { CardManager } from './card-manager.js';
import { UIManager } from './ui-manager.js';
import { StorageManager } from './storage-manager.js';
import { BoardRenderer } from './board-renderer.js';

// Application state
export const appState = {
    boards: [],
    currentBoardIndex: 0,
    currentCardData: null,
    currentListIndex: null,
    currentCardIndex: null,
    settings: {},
    autoSave: null // Will hold the auto-save function
};

// Initialize the application
function init() {
    // Load saved data
    appState.settings = StorageManager.loadSettings();
    appState.boards = StorageManager.loadBoards();
    
    // Set current board index from settings
    if (appState.boards.length > 0) {
        appState.currentBoardIndex = Math.min(
            appState.settings.lastOpenBoard || 0, 
            appState.boards.length - 1
        );
    }
    
    // Setup auto-save
    appState.autoSave = StorageManager.setupAutoSave(appState);
    
    // Only render if there are boards
    if (appState.boards.length > 0) {
        UIManager.renderBoard();
        UIManager.renderBoardTabs();
    } else {
        // Show workspace view by default when no boards exist
        UIManager.showWorkspaceView();
    }
    UIManager.renderBoardsGrid();
    
    // Add event listeners
    setupEventListeners();
    
    console.log('Listy initialized with', appState.boards.length, 'boards');
}

// Setup all event listeners
function setupEventListeners() {
    const boardsBtn = document.getElementById('boardsBtn');
    const backgroundBtn = document.getElementById('backgroundBtn');
    const labelSelector = document.getElementById('labelSelector');
    
    if (boardsBtn) {
        boardsBtn.addEventListener('click', UIManager.showWorkspaceView);
    }
    
    if (backgroundBtn) {
        backgroundBtn.addEventListener('click', BoardManager.uploadBackground);
    }
    
    if (labelSelector) {
        labelSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('label-color')) {
                e.target.classList.toggle('selected');
            }
        });
    }

    // Close settings menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.list-settings')) {
            document.querySelectorAll('.list-settings-menu').forEach(menu => {
                menu.classList.add('hidden');
            });
        }
        
        // Close board menus when clicking outside
        if (!e.target.closest('.board-card-menu')) {
            document.querySelectorAll('.board-menu-dropdown').forEach(menu => {
                menu.classList.add('hidden');
            });
        }
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Add data management buttons to header
    addDataManagementButtons();
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + S to save (though it auto-saves anyway)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveData();
        showNotification('Data saved!');
    }
    
    // Ctrl/Cmd + E to export
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportData();
    }
}

// Add data management buttons to the header
function addDataManagementButtons() {
    const boardActions = document.querySelector('.board-actions');
    if (!boardActions) return;
    
    // Export button
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn';
    exportBtn.textContent = 'Export Backup';
    exportBtn.title = 'Download backup file';
    exportBtn.onclick = exportData;
    
    // Import button
    const importBtn = document.createElement('button');
    importBtn.className = 'btn';
    importBtn.textContent = 'Import Backup';
    importBtn.title = 'Restore from backup file';
    importBtn.onclick = importData;
    
    // Storage info button
    const storageBtn = document.createElement('button');
    storageBtn.className = 'btn';
    storageBtn.textContent = 'Storage Info';
    storageBtn.title = 'View storage usage';
    storageBtn.onclick = showStorageInfo;
    
    // Insert before the Share button
    const shareBtn = boardActions.querySelector('button:last-child');
    if (shareBtn) {
        boardActions.insertBefore(exportBtn, shareBtn);
        boardActions.insertBefore(importBtn, shareBtn);
        boardActions.insertBefore(storageBtn, shareBtn);
    } else {
        boardActions.appendChild(exportBtn);
        boardActions.appendChild(importBtn);
        boardActions.appendChild(storageBtn);
    }
}

// Save data manually
function saveData() {
    const success = StorageManager.saveBoards(appState.boards);
    StorageManager.saveSettings(appState.settings);
    return success;
}

// Trigger auto-save
export function triggerAutoSave() {
    if (appState.autoSave) {
        appState.autoSave();
    }
}

// Export data to file
function exportData() {
    const success = StorageManager.exportData(appState.boards);
    if (success) {
        showNotification('Backup exported successfully!');
    } else {
        showNotification('Failed to export backup.', 'error');
    }
}

// Import data from file
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const importedBoards = await StorageManager.importData(file);
            
            // Confirm before replacing current data
            const confirmMessage = `This will replace your current ${appState.boards.length} board(s) with ${importedBoards.length} board(s) from the backup. Continue?`;
            
            if (confirm(confirmMessage)) {
                appState.boards = importedBoards;
                appState.currentBoardIndex = 0;
                
                // Save imported data
                saveData();
                
                // Re-render everything
                if (appState.boards.length > 0) {
                    UIManager.renderBoard();
                    UIManager.renderBoardTabs();
                    
                    // Hide workspace view, show board
                    const workspaceView = document.getElementById('workspaceView');
                    const boardContainer = document.getElementById('boardContainer');
                    
                    if (workspaceView) workspaceView.classList.add('hidden');
                    if (boardContainer) boardContainer.style.display = 'block';
                } else {
                    UIManager.showWorkspaceView();
                }
                UIManager.renderBoardsGrid();
                
                showNotification('Backup imported successfully!');
            }
        } catch (error) {
            showNotification(`Import failed: ${error.message}`, 'error');
        }
        
        // Clean up
        document.body.removeChild(input);
    };
    
    document.body.appendChild(input);
    input.click();
}

// Show storage information
function showStorageInfo() {
    const info = StorageManager.getStorageInfo();
    const sizeInKB = (info.totalSize / 1024).toFixed(2);
    
    const message = `
Storage Usage:
• ${info.boardCount} boards
• ${sizeInKB} KB total storage
• Last saved: ${new Date().toLocaleString()}

Data is automatically saved to your browser's local storage.
Use "Export Backup" to create a downloadable backup file.
    `.trim();
    
    alert(message);
}

// Show notification to user
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#eb5a46' : '#61bd4f'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-weight: 500;
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateX(100%);
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Update settings and save
export function updateSettings(newSettings) {
    Object.assign(appState.settings, newSettings);
    StorageManager.saveSettings(appState.settings);
}

// Toggle board menu in workspace view
function toggleBoardMenu(boardIndex) {
    const menu = document.getElementById(`boardMenu-${boardIndex}`);
    if (!menu) return;
    
    // Close other open menus
    document.querySelectorAll('.board-menu-dropdown').forEach(otherMenu => {
        if (otherMenu !== menu) {
            otherMenu.classList.add('hidden');
        }
    });
    
    // Toggle current menu
    menu.classList.toggle('hidden');
}

// Board management functions for workspace grid
function deleteBoardFromGrid(boardIndex) {
    const success = BoardManager.deleteBoard(boardIndex);
    if (success) {
        triggerAutoSave();
    }
}

function renameBoardFromGrid(boardIndex) {
    const success = BoardManager.renameBoard(boardIndex);
    if (success) {
        triggerAutoSave();
    }
}

function duplicateBoardFromGrid(boardIndex) {
    const success = BoardManager.duplicateBoard(boardIndex);
    if (success) {
        triggerAutoSave();
    }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    init();
});

// Export global functions for HTML onclick handlers
window.createList = (...args) => {
    BoardManager.createList(...args);
    triggerAutoSave();
};

window.createBoard = (...args) => {
    BoardManager.createBoard(...args);
    triggerAutoSave();
};

window.switchBoard = (index) => {
    BoardManager.switchBoard(index);
    updateSettings({ lastOpenBoard: index });
};

window.updateListName = (...args) => {
    BoardManager.updateListName(...args);
    triggerAutoSave();
};

window.deleteList = (...args) => {
    BoardManager.deleteList(...args);
    triggerAutoSave();
};

window.toggleListSettings = BoardManager.toggleListSettings;

window.setListBackgroundColor = (...args) => {
    BoardManager.setListBackgroundColor(...args);
    triggerAutoSave();
};

// Board management functions
window.deleteBoard = (...args) => {
    const success = BoardManager.deleteBoard(...args);
    if (success) {
        triggerAutoSave();
    }
};

window.renameBoard = (...args) => {
    const success = BoardManager.renameBoard(...args);
    if (success) {
        triggerAutoSave();
    }
};

window.duplicateBoard = (...args) => {
    const success = BoardManager.duplicateBoard(...args);
    if (success) {
        triggerAutoSave();
    }
};

// Board menu functions for workspace
window.toggleBoardMenu = toggleBoardMenu;
window.deleteBoardFromGrid = deleteBoardFromGrid;
window.renameBoardFromGrid = renameBoardFromGrid;
window.duplicateBoardFromGrid = duplicateBoardFromGrid;

window.createCard = (...args) => {
    CardManager.createCard(...args);
    triggerAutoSave();
};

window.openCard = CardManager.openCard;

window.closeCardModal = CardManager.closeCardModal;

window.handleCardDragStart = function(e) {
    const card = e.currentTarget;
    const listIndex = parseInt(card.dataset.listIndex);
    const cardIndex = parseInt(card.dataset.cardIndex);
    
    card.classList.add('dragging');
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/card', JSON.stringify({
        listIndex: listIndex,
        cardIndex: cardIndex
    }));
    
    // Prevent the card click event from firing
    e.stopPropagation();
};

window.handleCardDragEnd = function(e) {
    const card = e.currentTarget;
    card.classList.remove('dragging');
};

// Move cards programmatically (useful for other integrations)
window.moveCard = function(sourceListIndex, sourceCardIndex, targetListIndex, targetCardIndex) {
    BoardRenderer.moveCard(sourceListIndex, sourceCardIndex, targetListIndex, targetCardIndex);
};

window.saveCard = (...args) => {
    CardManager.saveCard(...args);
    triggerAutoSave();
};

window.deleteCard = (...args) => {
    CardManager.deleteCard(...args);
    triggerAutoSave();
};

window.addChecklist = (...args) => {
    CardManager.addChecklist(...args);
    // No auto-save here since it's just modal data
};

window.deleteChecklist = (...args) => {
    CardManager.deleteChecklist(...args);
    // No auto-save here since it's just modal data
};

window.addChecklistItem = (...args) => {
    CardManager.addChecklistItem(...args);
    // No auto-save here since it's just modal data
};

window.deleteChecklistItem = (...args) => {
    CardManager.deleteChecklistItem(...args);
    // No auto-save here since it's just modal data
};

window.toggleChecklistItem = (...args) => {
    CardManager.toggleChecklistItem(...args);
    // No auto-save here since it's just modal data
};

window.handleBackgroundUpload = (...args) => {
    BoardManager.handleBackgroundUpload(...args);
    triggerAutoSave();
};
