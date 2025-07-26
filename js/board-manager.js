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
