import { appState } from './app.js';

export class UIManager {
    // Render the current board
    static renderBoard() {
        const board = appState.boards[appState.currentBoardIndex];
        const boardElement = document.getElementById('board');
        
        if (!boardElement) return;
        
        // Clear existing lists (except add button)
        const addButton = boardElement.querySelector('.add-list-btn');
        boardElement.innerHTML = '';
        
        // Render lists
        board.lists.forEach((list, listIndex) => {
            const listElement = UIManager.createListElement(list, listIndex);
            boardElement.appendChild(listElement);
        });
        
        // Re-add the add button
        if (addButton) {
            boardElement.appendChild(addButton);
        } else {
            // Create new add button if it doesn't exist
            const newAddButton = document.createElement('button');
            newAddButton.className = 'add-list-btn';
            newAddButton.textContent = '+ Add another list';
            newAddButton.onclick = () => window.createList();
            boardElement.appendChild(newAddButton);
        }
        
        // Set background
        const bgElement = document.getElementById('boardBackground');
        if (bgElement) {
            if (board.background) {
                bgElement.src = board.background;
                bgElement.classList.remove('hidden');
            } else {
                bgElement.classList.add('hidden');
            }
        }
    }

    // Create a list element with drag-and-drop functionality
    static createListElement(list, listIndex) {
        const listDiv = document.createElement('div');
        listDiv.className = 'list';
        listDiv.draggable = true;
        listDiv.dataset.listIndex = listIndex;
        
        // Add drag event listeners
        listDiv.addEventListener('dragstart', UIManager.handleDragStart);
        listDiv.addEventListener('dragend', UIManager.handleDragEnd);
        listDiv.addEventListener('dragover', UIManager.handleDragOver);
        listDiv.addEventListener('dragenter', UIManager.handleDragEnter);
        listDiv.addEventListener('dragleave', UIManager.handleDragLeave);
        listDiv.addEventListener('drop', UIManager.handleDrop);
        
        listDiv.innerHTML = `
            <div class="list-header">
                <input type="text" value="${list.name}" onchange="updateListName(${listIndex}, this.value)" onblur="this.blur()">
            </div>
            <div class="cards-container" id="cards-${listIndex}">
                ${list.cards.map((card, cardIndex) => UIManager.createCardHTML(card, listIndex, cardIndex)).join('')}
            </div>
            <button class="add-card-btn" onclick="createCard(${listIndex})">+ Add a card</button>
        `;
        return listDiv;
    }

    // Drag and drop event handlers
    static handleDragStart(e) {
        const listElement = e.currentTarget;
        listElement.classList.add('dragging');
        
        // Store the index of the dragged list
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', listElement.outerHTML);
        e.dataTransfer.setData('text/plain', listElement.dataset.listIndex);
        
        // Add dragging class to board for styling
        const board = document.getElementById('board');
        if (board) board.classList.add('drag-active');
    }

    static handleDragEnd(e) {
        const listElement = e.currentTarget;
        listElement.classList.remove('dragging');
        
        // Remove dragging class from board
        const board = document.getElementById('board');
        if (board) board.classList.remove('drag-active');
        
        // Remove all drag indicators
        document.querySelectorAll('.list').forEach(list => {
            list.classList.remove('drag-over-left', 'drag-over-right');
        });
    }

    static handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    static handleDragEnter(e) {
        e.preventDefault();
        const listElement = e.currentTarget;
        const draggingElement = document.querySelector('.dragging');
        
        if (listElement !== draggingElement && !listElement.classList.contains('dragging')) {
            // Determine which side of the list we're hovering over
            const rect = listElement.getBoundingClientRect();
            const midpoint = rect.left + rect.width / 2;
            const mouseX = e.clientX;
            
            // Remove existing drag indicators
            listElement.classList.remove('drag-over-left', 'drag-over-right');
            
            // Add appropriate drag indicator
            if (mouseX < midpoint) {
                listElement.classList.add('drag-over-left');
            } else {
                listElement.classList.add('drag-over-right');
            }
        }
    }

    static handleDragLeave(e) {
        const listElement = e.currentTarget;
        // Only remove indicators if we're leaving the element entirely
        if (!listElement.contains(e.relatedTarget)) {
            listElement.classList.remove('drag-over-left', 'drag-over-right');
        }
    }

    static handleDrop(e) {
        e.preventDefault();
        
        const draggedListIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const targetListElement = e.currentTarget;
        const targetListIndex = parseInt(targetListElement.dataset.listIndex);
        
        if (draggedListIndex === targetListIndex) return;
        
        // Determine drop position
        const rect = targetListElement.getBoundingClientRect();
        const midpoint = rect.left + rect.width / 2;
        const mouseX = e.clientX;
        const insertBefore = mouseX < midpoint;
        
        // Calculate new position
        let newPosition = targetListIndex;
        if (!insertBefore && draggedListIndex < targetListIndex) {
            newPosition = targetListIndex;
        } else if (!insertBefore && draggedListIndex > targetListIndex) {
            newPosition = targetListIndex + 1;
        } else if (insertBefore && draggedListIndex > targetListIndex) {
            newPosition = targetListIndex;
        } else if (insertBefore && draggedListIndex < targetListIndex) {
            newPosition = targetListIndex - 1;
        }
        
        // Move the list in the data structure
        UIManager.moveList(draggedListIndex, newPosition);
        
        // Clean up drag indicators
        targetListElement.classList.remove('drag-over-left', 'drag-over-right');
    }

    // Move list from one position to another
    static moveList(fromIndex, toIndex) {
        const board = appState.boards[appState.currentBoardIndex];
        const movedList = board.lists.splice(fromIndex, 1)[0];
        board.lists.splice(toIndex, 0, movedList);
        
        // Re-render the board
        UIManager.renderBoard();
    }

    // Create card HTML
    static createCardHTML(card, listIndex, cardIndex) {
        const labelsHTML = card.labels.map(color => `<div class="card-label" style="background: ${color}"></div>`).join('');
        
        let progressHTML = '';
        if (card.checklists && card.checklists.length > 0) {
            const totalItems = card.checklists.reduce((sum, checklist) => sum + checklist.items.length, 0);
            const completedItems = card.checklists.reduce((sum, checklist) => 
                sum + checklist.items.filter(item => item.completed).length, 0);
            
            if (totalItems > 0) {
                const isComplete = completedItems === totalItems;
                progressHTML = `
                    <div class="card-progress">
                        <span class="progress-badge ${isComplete ? 'complete' : ''}">${completedItems}/${totalItems}</span>
                    </div>
                `;
            }
        }
        
        return `
            <div class="card" onclick="openCard(${listIndex}, ${cardIndex})">
                ${labelsHTML ? `<div class="card-labels">${labelsHTML}</div>` : ''}
                <div class="card-title">${card.title}</div>
                ${progressHTML}
            </div>
        `;
    }

    // Render board tabs
    static renderBoardTabs() {
        const tabsElement = document.getElementById('boardTabs');
        if (!tabsElement) return;
        
        tabsElement.innerHTML = '';
        
        appState.boards.forEach((board, index) => {
            const tab = document.createElement('button');
            tab.className = `board-tab ${index === appState.currentBoardIndex ? 'active' : ''}`;
            tab.textContent = board.name;
            tab.onclick = () => window.switchBoard(index);
            tabsElement.appendChild(tab);
        });
        
        const addButton = document.createElement('button');
        addButton.className = 'add-board-btn';
        addButton.textContent = '+ Add another board';
        addButton.onclick = () => window.createBoard();
        tabsElement.appendChild(addButton);
    }

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
        UIManager.renderBoardsGrid();
    }
}
