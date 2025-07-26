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
                cards: []
            });
            UIManager.renderBoard();
        }
    }

    // Update list name
    static updateListName(listIndex, newName) {
        appState.boards[appState.currentBoardIndex].lists[listIndex].name = newName;
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