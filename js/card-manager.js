import { appState } from './app.js';
import { UIManager } from './ui-manager.js';
import { triggerAutoSave } from './app.js';

export class CardManager {
    // Create a new card
    static createCard(listIndex) {
        const title = prompt("Card title:");
        if (title) {
            appState.boards[appState.currentBoardIndex].lists[listIndex].cards.push({
                title: title,
                description: "",
                checklists: [],
                backgroundColor: null // Add background color property
            });
            UIManager.renderBoard();
        }
    }

    // Open card modal for editing
    static openCard(listIndex, cardIndex) {
        appState.currentListIndex = listIndex;
        appState.currentCardIndex = cardIndex;
        appState.currentCardData = JSON.parse(JSON.stringify(appState.boards[appState.currentBoardIndex].lists[listIndex].cards[cardIndex]));
        
        const cardTitleInput = document.getElementById('cardTitleInput');
        const cardDescriptionInput = document.getElementById('cardDescriptionInput');
        const cardModal = document.getElementById('cardModal');
        
        if (cardTitleInput) {
            cardTitleInput.value = appState.currentCardData.title;
            // Add auto-save on input change
            cardTitleInput.oninput = () => CardManager.autoSaveField('title', cardTitleInput.value);
        }
        
        if (cardDescriptionInput) {
            cardDescriptionInput.value = appState.currentCardData.description || '';
            // Add auto-save on input change
            cardDescriptionInput.oninput = () => CardManager.autoSaveField('description', cardDescriptionInput.value);
        }
        
        // Update background color selector
        const backgroundSelector = document.getElementById('cardBackgroundSelector');
        if (backgroundSelector) {
            backgroundSelector.querySelectorAll('.background-color').forEach(bg => {
                bg.classList.toggle('selected', appState.currentCardData.backgroundColor === bg.dataset.color);
            });
        }
        
        CardManager.renderChecklists();
        if (cardModal) cardModal.classList.add('show');
    }

    // Close card modal
    static closeCardModal() {
        const cardModal = document.getElementById('cardModal');
        if (cardModal) cardModal.classList.remove('show');
        appState.currentCardData = null;
        appState.currentListIndex = null;
        appState.currentCardIndex = null;
    }

    // Delete card
    static deleteCard() {
        if (confirm('Delete this card?')) {
            appState.boards[appState.currentBoardIndex].lists[appState.currentListIndex].cards.splice(appState.currentCardIndex, 1);
            UIManager.renderBoard();
            CardManager.closeCardModal();
        }
    }

    // Add new checklist
    static addChecklist() {
        const name = prompt("Checklist name:") || "Checklist";
        if (!appState.currentCardData.checklists) appState.currentCardData.checklists = [];
        appState.currentCardData.checklists.push({
            name: name,
            items: []
        });
        CardManager.renderChecklists();
        CardManager.saveCardToBoard();
    }

    // Render checklists in the modal
    static renderChecklists() {
        const container = document.getElementById('checklistsContainer');
        if (!container || !appState.currentCardData) return;
        
        container.innerHTML = '';
        
        if (!appState.currentCardData.checklists) return;
        
        appState.currentCardData.checklists.forEach((checklist, checklistIndex) => {
            const checklistDiv = document.createElement('div');
            checklistDiv.className = 'checklist';
            
            const completedItems = checklist.items.filter(item => item.completed).length;
            const totalItems = checklist.items.length;
            const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
            
            checklistDiv.innerHTML = `
                <div class="checklist-header">
                    <span class="checklist-title">${checklist.name}</span>
                    <button class="btn-danger" onclick="deleteChecklist(${checklistIndex})">Delete</button>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div id="checklist-items-${checklistIndex}">
                    ${checklist.items.map((item, itemIndex) => `
                        <div class="checklist-item ${item.completed ? 'completed' : ''}">
                            <input type="checkbox" ${item.completed ? 'checked' : ''} 
                                   onchange="toggleChecklistItem(${checklistIndex}, ${itemIndex})">
                            <span class="checklist-item-text">${item.text}</span>
                            <button class="btn-danger" onclick="deleteChecklistItem(${checklistIndex}, ${itemIndex})" style="margin-left: auto;">×</button>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-secondary" onclick="addChecklistItem(${checklistIndex})">Add an item</button>
            `;
            
            container.appendChild(checklistDiv);
        });
    }

    // Delete checklist
    static deleteChecklist(checklistIndex) {
        if (!appState.currentCardData || !appState.currentCardData.checklists) return;
        appState.currentCardData.checklists.splice(checklistIndex, 1);
        CardManager.renderChecklists();
        CardManager.saveCardToBoard();
    }

    // Add checklist item
    static addChecklistItem(checklistIndex) {
        const text = prompt("Item text:");
        if (text && appState.currentCardData && appState.currentCardData.checklists) {
            appState.currentCardData.checklists[checklistIndex].items.push({
                text: text,
                completed: false
            });
            CardManager.renderChecklists();
            CardManager.saveCardToBoard();
        }
    }

    // Delete checklist item
    static deleteChecklistItem(checklistIndex, itemIndex) {
        if (!appState.currentCardData || !appState.currentCardData.checklists) return;
        appState.currentCardData.checklists[checklistIndex].items.splice(itemIndex, 1);
        CardManager.renderChecklists();
        CardManager.saveCardToBoard();
    }

    // Toggle checklist item completion
    static toggleChecklistItem(checklistIndex, itemIndex) {
        if (!appState.currentCardData || !appState.currentCardData.checklists) return;
        appState.currentCardData.checklists[checklistIndex].items[itemIndex].completed = 
            !appState.currentCardData.checklists[checklistIndex].items[itemIndex].completed;
        CardManager.renderChecklists();
        CardManager.saveCardToBoard();
    }

    // Helper method to save current card data to board and trigger auto-save
    static saveCardToBoard() {
        if (!appState.currentCardData || appState.currentListIndex === null || appState.currentCardIndex === null) return;
        
        // Save current card data to the board
        appState.boards[appState.currentBoardIndex].lists[appState.currentListIndex].cards[appState.currentCardIndex] = 
            JSON.parse(JSON.stringify(appState.currentCardData));
        
        // Update the UI to show progress changes
        UIManager.renderBoard();
        
        // Trigger auto-save
        triggerAutoSave();
    }

    // Auto-save field changes
    static autoSaveField(fieldName, value) {
        if (!appState.currentCardData) return;
        
        appState.currentCardData[fieldName] = value;
        CardManager.saveCardToBoard();
    }

    // Handle background color selection with auto-save
    static selectBackgroundColor(color) {
        if (!appState.currentCardData) return;
        
        // Update the current card data
        appState.currentCardData.backgroundColor = color === 'null' ? null : color;
        
        // Update UI selection
        const backgroundSelector = document.getElementById('cardBackgroundSelector');
        if (backgroundSelector) {
            backgroundSelector.querySelectorAll('.background-color').forEach(bg => {
                bg.classList.toggle('selected', bg.dataset.color === color);
            });
        }
        
        CardManager.saveCardToBoard();
    }
}
