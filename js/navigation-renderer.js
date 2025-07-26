import { appState } from './app.js';

export class NavigationRenderer {
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
}
