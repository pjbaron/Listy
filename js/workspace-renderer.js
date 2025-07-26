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
            boardCard.innerHTML = `
                <div class="board-card-title">${board.name}</div>
                <button class="star-icon">⭐</button>
            `;
            boardCard.onclick = () => window.switchBoard(index);
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
