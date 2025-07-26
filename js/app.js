import { BoardManager } from './board-manager.js';
import { CardManager } from './card-manager.js';
import { UIManager } from './ui-manager.js';

// Application state
export const appState = {
    boards: [],
    currentBoardIndex: 0,
    currentCardData: null,
    currentListIndex: null,
    currentCardIndex: null
};

// Initialize the application
function init() {
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
    });
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    init();
});

// Export global functions for HTML onclick handlers
window.createList = BoardManager.createList;
window.createBoard = BoardManager.createBoard;
window.switchBoard = BoardManager.switchBoard;
window.updateListName = BoardManager.updateListName;
window.deleteList = BoardManager.deleteList;
window.toggleListSettings = BoardManager.toggleListSettings;
window.setListBackgroundColor = BoardManager.setListBackgroundColor;
window.createCard = CardManager.createCard;
window.openCard = CardManager.openCard;
window.closeCardModal = CardManager.closeCardModal;
window.saveCard = CardManager.saveCard;
window.deleteCard = CardManager.deleteCard;
window.addChecklist = CardManager.addChecklist;
window.deleteChecklist = CardManager.deleteChecklist;
window.addChecklistItem = CardManager.addChecklistItem;
window.deleteChecklistItem = CardManager.deleteChecklistItem;
window.toggleChecklistItem = CardManager.toggleChecklistItem;
window.handleBackgroundUpload = BoardManager.handleBackgroundUpload;
