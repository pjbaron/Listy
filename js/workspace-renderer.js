import { appState } from './app.js';

export class WorkspaceRenderer {
    // Render boards grid in workspace view
    static renderBoardsGrid() {
        const gridElement = document.getElementById('boardsGrid');
        if (!gridElement) return;
        
        gridElement.innerHTML = '';
        
        appState.boards.forEach((board, index) => {
            const boardCard = document.createElement('div');
            boardCard.className = 'board-card';
            if (board.background) {
                boardCard.style.backgroundImage = `url(${board.background})`;
                boardCard.style.backgroundSize = 'cover';
            }
            
            // Add board management menu
            boardCard.innerHTML = `
                <div class="board-card-title">${board.name}</div>
                <div class="board-card-menu">
                    <button class="board-menu-btn" onclick="event.stopPropagation(); toggleBoardMenu(${index})" title="Board options">⋯</button>
                    <div class="board-menu-dropdown hidden" id="boardMenu-${index}">
                        <button class="board-menu-option" onclick="event.stopPropagation(); renameBoardFromGrid(${index})">
                            <span class="menu-icon">✏️</span>
                            Rename Board
                        </button>
                        <button class="board-menu-option" onclick="event.stopPropagation(); duplicateBoardFromGrid(${index})">
                            <span class="menu-icon">📋</span>
                            Duplicate Board
                        </button>
                        <div class="menu-divider"></div>
                        <button class="board-menu-option delete-option" onclick="event.stopPropagation(); deleteBoardFromGrid(${index})">
                            <span class="menu-icon">🗑️</span>
                            Delete Board
                        </button>
                    </div>
                </div>
            `;
            
            // Add click handler for opening the board
            boardCard.addEventListener('click', (e) => {
                if (!e.target.closest('.board-card-menu')) {
                    window.switchBoard(index);
                }
            });
            
            gridElement.appendChild(boardCard);
        });

        // Add "Create new board" card
        const createBoardCard = document.createElement('div');
        createBoardCard.className = 'board-card create-board-card';
        createBoardCard.innerHTML = `
            <div class="board-card-title">+ Create new board</div>
        `;
        createBoardCard.onclick = () => window.createBoard();
        gridElement.appendChild(createBoardCard);
    }

    // Show workspace view
    static showWorkspaceView() {
        const workspaceView = document.getElementById('workspaceView');
        const boardContainer = document.getElementById('boardContainer');
        
        if (workspaceView) workspaceView.classList.remove('hidden');
        if (boardContainer) boardContainer.style.display = 'none';
        WorkspaceRenderer.renderBoardsGrid();
    }
}
