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

// The help content in markdown format
const HELP_CONTENT = `
A browser-based task management application.

Organize your projects with boards, lists, and cards with full drag-and-drop functionality.


## Keyboard Shortcuts

- **Ctrl/Cmd + S**: Manual save (though auto-save is always active)
- **Ctrl/Cmd + E**: Export backup

## Board Management

### Creating Boards
- Click the "+ Add a board" button in the board tabs or "Create new board" in workspace view
- Enter a name for your new board
- Your new board will be created and opened automatically

### Switching Between Boards
- Click on any board tab at the top to switch to that board
- Click "Boards" button to see all boards in workspace view

### Board Options
In workspace view, hover over any board card to see the options menu (⋯):
- **Rename Board**: Change the board name
- **Duplicate Board**: Create a copy of the entire board with all lists and cards
- **Delete Board**: Permanently remove the board (requires confirmation)

### Board Backgrounds
- Click the "Background" button in the header
- Select an image file from your computer
- The image will be applied as the board background

## List Management

### Creating Lists
- Click the "+ Add a list" button on any board
- Enter a name for your list
- The list will be added to the right side of your board

### List Options
Click the three dots (⋯) in any list header to access:

#### Background Colors
- Choose a color.

#### List Actions
- **Delete List**: Remove the list and all its cards (requires confirmation)

### Editing List Names
- Click on any list name to edit it inline
- Press Enter or click outside to save changes

### Reordering Lists
- Drag lists by their headers to reorder them
- Drop zones will appear between lists during dragging
- Lists will automatically save their new positions

## Card Management

### Creating Cards
- Click "+ Add a card" at the bottom of any list
- Enter a title for your card
- The card will be added to the bottom of the list

### Editing Cards
Click on any card to open the card editor with these options:

#### Basic Information
- **Title**: Edit the card title
- **Description**: Add detailed description, URLs will be clickable

#### Labels
- Choose from 6 different colored category markers
- Multiple markers can be applied to each card
- Markers appear as a list of colored bars at the top of cards

#### Background Colors
- Choose from 12 background colors for each card
- Background colors help categorize and prioritize cards visually

#### Checklists
- **Add Checklist**: Create new checklists within cards
- **Add Items**: Add individual checklist items with text descriptions
- **Check/Uncheck**: Click checkboxes to mark items as complete
- **Progress Tracking**: Visual progress bar shows completion percentage
- **Delete Items**: Remove individual checklist items or entire checklists
- **Multiple Checklists**: Add multiple checklists per card for complex tasks

#### Buttons
- **Save**: Save all changes and close the card editor
- **Delete Card**: Permanently remove the card from the list (verification required)

### Moving Cards
- **Drag & Drop**: Drag cards between lists or reorder within the same list
- **Visual Feedback**: Cards show dragging state and drop zones highlight during moves
- **Auto-Save**: Card positions are automatically saved after moving

## Data Management

### Automatic Saving
- All changes are automatically saved to your browser's local storage
- No manual save required - your data persists between sessions

### Export Backup
- Click "Export Backup" in the header
- Downloads a JSON file with timestamp (e.g., \`listy-backup-2025-01-27_14-30.json\`)
- Contains all boards, lists, cards, and settings
- Use for backup or transferring data between devices

### Import Backup
- Click "Import Backup" in the header
- Select a previously exported JSON backup file
- Confirms before replacing current data
- Restores all boards and settings from backup

### Storage Information
- Click "Storage Info" to view current usage
- Shows number of boards and storage size
- Displays last save timestamp

## Workspace View

### Accessing Workspace
- Click "Boards" button in the header to see all boards
- Shows a grid view of all your boards

### Board Grid Features
- **Visual Preview**: Each board shows as a card with background image
- **Quick Access**: Click any board to open it
- **Board Menu**: Hover over boards to access management options
- **Create New**: Click "Create new board" card to add boards

### Browser Compatibility
- Works in all modern browsers
- Requires JavaScript to be enabled
- Local storage must be available for data persistence`;

// Simple markdown to HTML converter
function markdownToHtml(markdown) {
    let html = markdown;
    
    // Headers
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Code (backticks)
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Lists - handle nested structure
    const lines = html.split('\n');
    let inList = false;
    let processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isListItem = line.match(/^- (.*)$/);
        
        if (isListItem) {
            if (!inList) {
                processedLines.push('<ul>');
                inList = true;
            }
            processedLines.push(`<li>${isListItem[1]}</li>`);
        } else {
            if (inList) {
                processedLines.push('</ul>');
                inList = false;
            }
            processedLines.push(line);
        }
    }
    
    if (inList) {
        processedLines.push('</ul>');
    }
    
    html = processedLines.join('\n');
    
    // Paragraphs - convert double line breaks to paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    
    // Clean up empty paragraphs and fix structure
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    
    return html;
}

// Show help modal
function showHelpModal() {
    const helpModal = document.getElementById('helpModal');
    const helpContent = document.getElementById('helpContent');
    
    if (helpModal && helpContent) {
        helpContent.innerHTML = markdownToHtml(HELP_CONTENT);
        helpModal.classList.add('show');
    }
}

// Close help modal
function closeHelpModal() {
    const helpModal = document.getElementById('helpModal');
    if (helpModal) {
        helpModal.classList.remove('show');
    }
}

// Add help button to header (call this in your init function)
function addHelpButton() {
    const boardActions = document.querySelector('.board-actions');
    if (!boardActions) return;
    
    // Create help button
    const helpBtn = document.createElement('button');
    helpBtn.className = 'btn';
    helpBtn.textContent = 'Help';
    helpBtn.title = 'View user guide';
    helpBtn.style.marginLeft = '20px';    
    helpBtn.onclick = showHelpModal;
    
    boardActions.appendChild(helpBtn);
}

// Export global functions
window.showHelpModal = showHelpModal;
window.closeHelpModal = closeHelpModal;
window.addHelpButton = addHelpButton;

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
    // Background color selector event listener
    const backgroundSelector = document.getElementById('cardBackgroundSelector');

    if (backgroundSelector) {
        backgroundSelector.addEventListener('click', (e) => {
            if (e.target.classList.contains('background-color')) {
                // Use the new auto-save method
                CardManager.selectBackgroundColor(e.target.dataset.color);
            }
        });
    }

    if (boardsBtn) {
        boardsBtn.addEventListener('click', UIManager.showWorkspaceView);
    }
    
    if (backgroundBtn) {
        backgroundBtn.addEventListener('click', BoardManager.uploadBackground);
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

    boardActions.appendChild(exportBtn);
    boardActions.appendChild(importBtn);
    boardActions.appendChild(storageBtn);

    // Help button
    addHelpButton();
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

window.deleteCard = (...args) => {
    CardManager.deleteCard(...args);
    triggerAutoSave();
};

window.addChecklist = (...args) => {
    CardManager.addChecklist(...args);
};

window.editChecklistTitle = (...args) => {
    CardManager.editChecklistTitle(...args);
};

window.deleteChecklist = (...args) => {
    CardManager.deleteChecklist(...args);
};

window.addChecklistItem = (...args) => {
    CardManager.addChecklistItem(...args);
};

window.editChecklistItem = (...args) => {
    CardManager.editChecklistItem(...args);
};

window.deleteChecklistItem = (...args) => {
    CardManager.deleteChecklistItem(...args);
};

window.toggleChecklistItem = (...args) => {
    CardManager.toggleChecklistItem(...args);
};

window.toggleCardCompletion = (...args) => {
    CardManager.toggleCardCompletion(...args);
};

window.handleBackgroundUpload = (...args) => {
    BoardManager.handleBackgroundUpload(...args);
    triggerAutoSave();
};
