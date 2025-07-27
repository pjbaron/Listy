import { appState } from './app.js';
import { UIManager } from './ui-manager.js';

export class BoardManager {
    // Create a new board
    static createBoard() {
        const name = prompt("Board name:");
        if (name) {
            appState.boards.push({
                name: name,
                background: "",
                lists: []
            });
            UIManager.renderBoardTabs();
            UIManager.renderBoardsGrid();
        }
    }

    // Switch to a different board
    static switchBoard(index) {
        appState.currentBoardIndex = index;
        UIManager.renderBoard();
        UIManager.renderBoardTabs();
        
        // Hide workspace view, show board
        const workspaceView = document.getElementById('workspaceView');
        const boardContainer = document.getElementById('boardContainer');
        
        if (workspaceView) workspaceView.classList.add('hidden');
        if (boardContainer) boardContainer.style.display = 'block';
    }

    // Delete a board with confirmation
    static deleteBoard(boardIndex) {
        if (appState.boards.length <= 1) {
            alert("Cannot delete the last board. You must have at least one board.");
            return;
        }

        const board = appState.boards[boardIndex];
        const listCount = board.lists.length;
        const cardCount = board.lists.reduce((total, list) => total + list.cards.length, 0);
        
        let confirmMessage = `Are you sure you want to delete the board "${board.name}"?`;
        
        if (listCount > 0) {
            confirmMessage += `\n\nThis will permanently delete ${listCount} list${listCount === 1 ? '' : 's'}`;
            if (cardCount > 0) {
                confirmMessage += ` and ${cardCount} card${cardCount === 1 ? '' : 's'}`;
            }
            confirmMessage += `.`;
        }
        
        if (confirm(confirmMessage)) {
            // Remove the board
            appState.boards.splice(boardIndex, 1);
            
            // Adjust current board index if needed
            if (appState.currentBoardIndex >= appState.boards.length) {
                appState.currentBoardIndex = appState.boards.length - 1;
            }
            if (appState.currentBoardIndex < 0) {
                appState.currentBoardIndex = 0;
            }
            
            // Re-render everything
            if (appState.boards.length > 0) {
                UIManager.renderBoard();
                UIManager.renderBoardTabs();
                UIManager.renderBoardsGrid();
            } else {
                // If no boards left, show workspace view
                UIManager.showWorkspaceView();
                UIManager.renderBoardTabs();
            }
            
            return true; // Successfully deleted
        }
        
        return false; // User cancelled
    }

    // Rename a board
    static renameBoard(boardIndex) {
        const board = appState.boards[boardIndex];
        const newName = prompt("Enter new board name:", board.name);
        
        if (newName && newName.trim() && newName !== board.name) {
            board.name = newName.trim();
            UIManager.renderBoardTabs();
            UIManager.renderBoardsGrid();
            return true;
        }
        
        return false;
    }

    // Duplicate a board
    static duplicateBoard(boardIndex) {
        const originalBoard = appState.boards[boardIndex];
        const newName = prompt("Enter name for the duplicated board:", `${originalBoard.name} (Copy)`);
        
        if (newName && newName.trim()) {
            // Deep clone the board
            const duplicatedBoard = JSON.parse(JSON.stringify(originalBoard));
            duplicatedBoard.name = newName.trim();
            
            // Insert the duplicated board after the original
            appState.boards.splice(boardIndex + 1, 0, duplicatedBoard);
            
            UIManager.renderBoardTabs();
            UIManager.renderBoardsGrid();
            return true;
        }
        
        return false;
    }

    // Create a new list
    static createList() {
        const name = prompt("List name:");
        if (name) {
            appState.boards[appState.currentBoardIndex].lists.push({
                name: name,
                backgroundColor: null,
                cards: []
            });
            UIManager.renderBoard();
        }
    }

    // Update list name
    static updateListName(listIndex, newName) {
        appState.boards[appState.currentBoardIndex].lists[listIndex].name = newName;
    }

    // Delete a list with confirmation
    static deleteList(listIndex) {
        const list = appState.boards[appState.currentBoardIndex].lists[listIndex];
        const cardCount = list.cards.length;
        
        let confirmMessage = `Are you sure you want to delete the list "${list.name}"?`;
        if (cardCount > 0) {
            confirmMessage += `\n\nThis will permanently delete ${cardCount} card${cardCount === 1 ? '' : 's'}.`;
        }
        
        if (confirm(confirmMessage)) {
            appState.boards[appState.currentBoardIndex].lists.splice(listIndex, 1);
            UIManager.renderBoard();
        }
    }

    // Toggle list settings menu
    static toggleListSettings(listIndex) {
        UIManager.toggleListSettings(listIndex);
    }

    // Set list background color
    static setListBackgroundColor(listIndex, color) {
        appState.boards[appState.currentBoardIndex].lists[listIndex].backgroundColor = color;
        UIManager.renderBoard();
    }

    // Upload background image
    static uploadBackground() {
        const backgroundUpload = document.getElementById('backgroundUpload');
        if (backgroundUpload) {
            backgroundUpload.click();
        }
    }

    // Handle background upload
    static handleBackgroundUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                appState.boards[appState.currentBoardIndex].background = e.target.result;
                UIManager.renderBoard();
            };
            reader.readAsDataURL(file);
        }
    }
}
