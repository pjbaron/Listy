import { appState } from './app.js';
import { UIManager } from './ui-manager.js';

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
        
        if (cardTitleInput) cardTitleInput.value = appState.currentCardData.title;
        if (cardDescriptionInput) cardDescriptionInput.value = appState.currentCardData.description || '';
        
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

    // Save card changes
    static saveCard() {
        if (!appState.currentCardData) return;
        
        const cardTitleInput = document.getElementById('cardTitleInput');
        const cardDescriptionInput = document.getElementById('cardDescriptionInput');
        const labelSelector = document.getElementById('labelSelector');
        const backgroundSelector = document.getElementById('cardBackgroundSelector');
        
        if (cardTitleInput) appState.currentCardData.title = cardTitleInput.value;
        if (cardDescriptionInput) appState.currentCardData.description = cardDescriptionInput.value;
        
        // Save background color
        if (backgroundSelector) {
            const selectedBg = backgroundSelector.querySelector('.background-color.selected');
            appState.currentCardData.backgroundColor = selectedBg ? selectedBg.dataset.color : null;
        }
        
        // Save card
        appState.boards[appState.currentBoardIndex].lists[appState.currentListIndex].cards[appState.currentCardIndex] = appState.currentCardData;
        
        UIManager.renderBoard();
        CardManager.closeCardModal();
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
        }
    }

    // Delete checklist item
    static deleteChecklistItem(checklistIndex, itemIndex) {
        if (!appState.currentCardData || !appState.currentCardData.checklists) return;
        appState.currentCardData.checklists[checklistIndex].items.splice(itemIndex, 1);
        CardManager.renderChecklists();
    }

    // Toggle checklist item completion
    static toggleChecklistItem(checklistIndex, itemIndex) {
        if (!appState.currentCardData || !appState.currentCardData.checklists) return;
        appState.currentCardData.checklists[checklistIndex].items[itemIndex].completed = 
            !appState.currentCardData.checklists[checklistIndex].items[itemIndex].completed;
        CardManager.renderChecklists();
    }
}
