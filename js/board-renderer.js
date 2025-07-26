import { appState } from './app.js';

export class BoardRenderer {
    // Render the current board
    static renderBoard() {
        const board = appState.boards[appState.currentBoardIndex];
        const boardElement = document.getElementById('board');
        
        if (!boardElement) return;
        
        // Clear existing lists (except add button)
        const addButton = boardElement.querySelector('.add-list-btn');
        boardElement.innerHTML = '';
        
        // Add board-level drag handlers
        BoardRenderer.setupBoardDragHandlers(boardElement);
        
        // Render lists with drop zones
        board.lists.forEach((list, listIndex) => {
            // Add drop zone before each list
            const dropZone = BoardRenderer.createDropZone(listIndex);
            boardElement.appendChild(dropZone);
            
            const listElement = BoardRenderer.createListElement(list, listIndex);
            boardElement.appendChild(listElement);
        });
        
        // Add final drop zone after all lists
        const finalDropZone = BoardRenderer.createDropZone(board.lists.length);
        boardElement.appendChild(finalDropZone);
        
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
        
        // Set background color if specified
        if (list.backgroundColor) {
            listDiv.style.backgroundColor = list.backgroundColor;
        }
        
        // Add drag event listeners
        listDiv.addEventListener('dragstart', BoardRenderer.handleDragStart);
        listDiv.addEventListener('dragend', BoardRenderer.handleDragEnd);
        listDiv.addEventListener('dragover', BoardRenderer.handleDragOver);
        listDiv.addEventListener('dragenter', BoardRenderer.handleDragEnter);
        listDiv.addEventListener('dragleave', BoardRenderer.handleDragLeave);
        listDiv.addEventListener('drop', BoardRenderer.handleDrop);
        
        listDiv.innerHTML = `
            <div class="list-header" ${list.backgroundColor ? `style="background-color: ${list.backgroundColor};"` : ''}>
                <input type="text" value="${list.name}" onchange="updateListName(${listIndex}, this.value)" onblur="this.blur()">
                <div class="list-settings">
                    <button class="list-settings-btn" onclick="toggleListSettings(${listIndex})" title="List settings">⋯</button>
                    <div class="list-settings-menu hidden" id="listSettings-${listIndex}">
                        <div class="settings-section">
                            <div class="settings-section-title">Background Color</div>
                            <div class="color-palette">
                                <div class="color-option ${!list.backgroundColor ? 'selected' : ''}" 
                                     style="background: #ebecf0;" 
                                     onclick="setListBackgroundColor(${listIndex}, null)" 
                                     title="Default"></div>
                                <div class="color-option ${list.backgroundColor === '#fef7f7' ? 'selected' : ''}" 
                                     style="background: #fef7f7;" 
                                     onclick="setListBackgroundColor(${listIndex}, '#fef7f7')" 
                                     title="Pastel Pink"></div>
                                <div class="color-option ${list.backgroundColor === '#f0f9ff' ? 'selected' : ''}" 
                                     style="background: #f0f9ff;" 
                                     onclick="setListBackgroundColor(${listIndex}, '#f0f9ff')" 
                                     title="Pastel Blue"></div>
                                <div class="color-option ${list.backgroundColor === '#f0fff4' ? 'selected' : ''}" 
                                     style="background: #f0fff4;" 
                                     onclick="setListBackgroundColor(${listIndex}, '#f0fff4')" 
                                     title="Pastel Green"></div>
                                <div class="color-option ${list.backgroundColor === '#fffbf0' ? 'selected' : ''}" 
                                     style="background: #fffbf0;" 
                                     onclick="setListBackgroundColor(${listIndex}, '#fffbf0')" 
                                     title="Pastel Yellow"></div>
                                <div class="color-option ${list.backgroundColor === '#f5f0ff' ? 'selected' : ''}" 
                                     style="background: #f5f0ff;" 
                                     onclick="setListBackgroundColor(${listIndex}, '#f5f0ff')" 
                                     title="Pastel Purple"></div>
                                <div class="color-option ${list.backgroundColor === '#fff0f5' ? 'selected' : ''}" 
                                     style="background: #fff0f5;" 
                                     onclick="setListBackgroundColor(${listIndex}, '#fff0f5')" 
                                     title="Pastel Lavender"></div>
                            </div>
                        </div>
                        <div class="settings-divider"></div>
                        <button class="settings-option delete-option" onclick="deleteList(${listIndex})">
                            <span class="settings-icon">🗑️</span>
                            Delete List
                        </button>
                    </div>
                </div>
            </div>
            <div class="cards-container" id="cards-${listIndex}">
                ${list.cards.map((card, cardIndex) => BoardRenderer.createCardHTML(card, listIndex, cardIndex)).join('')}
            </div>
            <button class="add-card-btn" onclick="createCard(${listIndex})">+ Add a card</button>
        `;
        return listDiv;
    }

    // Create a drop zone element
    static createDropZone(position) {
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.dataset.position = position;
        
        dropZone.addEventListener('dragover', BoardRenderer.handleDropZoneDragOver);
        dropZone.addEventListener('dragenter', BoardRenderer.handleDropZoneDragEnter);
        dropZone.addEventListener('dragleave', BoardRenderer.handleDropZoneDragLeave);
        dropZone.addEventListener('drop', BoardRenderer.handleDropZoneDrop);
        
        return dropZone;
    }

    // Setup board-level drag handlers
    static setupBoardDragHandlers(boardElement) {
        boardElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });
        
        // Close any open settings menus when clicking elsewhere
        boardElement.addEventListener('click', (e) => {
            if (!e.target.closest('.list-settings')) {
                document.querySelectorAll('.list-settings-menu').forEach(menu => {
                    menu.classList.add('hidden');
                });
            }
        });
    }

    // Toggle list settings menu
    static toggleListSettings(listIndex) {
        const menu = document.getElementById(`listSettings-${listIndex}`);
        if (!menu) return;
        
        // Close other open menus
        document.querySelectorAll('.list-settings-menu').forEach(otherMenu => {
            if (otherMenu !== menu) {
                otherMenu.classList.add('hidden');
            }
        });
        
        // Toggle current menu
        menu.classList.toggle('hidden');
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

    // Move list from one position to another
    static moveList(fromIndex, toIndex) {
        const board = appState.boards[appState.currentBoardIndex];
        const movedList = board.lists.splice(fromIndex, 1)[0];
        board.lists.splice(toIndex, 0, movedList);
        
        // Re-render the board
        BoardRenderer.renderBoard();
    }

    // Drop zone event handlers
    static handleDropZoneDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    static handleDropZoneDragEnter(e) {
        e.preventDefault();
        const dropZone = e.currentTarget;
        dropZone.classList.add('drag-over');
    }

    static handleDropZoneDragLeave(e) {
        const dropZone = e.currentTarget;
        if (!dropZone.contains(e.relatedTarget)) {
            dropZone.classList.remove('drag-over');
        }
    }

    static handleDropZoneDrop(e) {
        e.preventDefault();
        
        const draggedListIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const dropZone = e.currentTarget;
        const newPosition = parseInt(dropZone.dataset.position);
        
        // Calculate adjusted position based on original index
        let adjustedPosition = newPosition;
        if (draggedListIndex < newPosition) {
            adjustedPosition = newPosition - 1;
        }
        
        // Move the list
        BoardRenderer.moveList(draggedListIndex, adjustedPosition);
        
        // Clean up
        dropZone.classList.remove('drag-over');
    }

    // Drag and drop event handlers for lists
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
        
        // Close any open settings menus
        document.querySelectorAll('.list-settings-menu').forEach(menu => {
            menu.classList.add('hidden');
        });
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
        
        // Remove drop zone indicators
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.classList.remove('drag-over');
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
        BoardRenderer.moveList(draggedListIndex, newPosition);
        
        // Clean up drag indicators
        targetListElement.classList.remove('drag-over-left', 'drag-over-right');
    }
}
