# Listy



Task list manager using local storage (browser) and JSON import/export.



https://www.insanehero.com/html/Listy/



A browser-based task management application.

Organize your projects with boards, lists, and cards with full drag-and-drop functionality.


## Keyboard Shortcuts

- **Ctrl/Cmd + S**: Manual save (though auto-save is always active)
- **Ctrl/Cmd + E**: Export backup

## Board Management

### Creating Boards
- Click the "+ Add a board" button in the board tabs or "Create new board" in workspace view
- Enter a name for your new board
- Your new board will be created and opened automatically

### Switching Between Boards
- Click on any board tab at the top to switch to that board
- Click "Boards" button to see all boards in workspace view

### Board Options
In workspace view, hover over any board card to see the options menu (⋯):
- **Rename Board**: Change the board name
- **Duplicate Board**: Create a copy of the entire board with all lists and cards
- **Delete Board**: Permanently remove the board (requires confirmation)

### Board Backgrounds
- Click the "Background" button in the header
- Select an image file from your computer
- The image will be applied as the board background

## List Management

### Creating Lists
- Click the "+ Add a list" button on any board
- Enter a name for your list
- The list will be added to the right side of your board

### List Options
Click the three dots (⋯) in any list header to access:

#### Background Colors
- Choose a color.

#### List Actions
- **Delete List**: Remove the list and all its cards (requires confirmation)

### Editing List Names
- Click on any list name to edit it inline
- Press Enter or click outside to save changes

### Reordering Lists
- Drag lists by their headers to reorder them
- Drop zones will appear between lists during dragging
- Lists will automatically save their new positions

## Card Management

### Creating Cards
- Click "+ Add a card" at the bottom of any list
- Enter a title for your card
- The card will be added to the bottom of the list

### Editing Cards
Click on any card to open the card editor with these options:

#### Basic Information
- **Title**: Edit the card title
- **Description**: Add detailed description, URLs will be clickable

#### Labels
- Choose from 6 different colored category markers
- Multiple markers can be applied to each card
- Markers appear as a list of colored bars at the top of cards

#### Background Colors
- Choose from 12 background colors for each card
- Background colors help categorize and prioritize cards visually

#### Checklists
- **Add Checklist**: Create new checklists within cards
- **Add Items**: Add individual checklist items with text descriptions
- **Check/Uncheck**: Click checkboxes to mark items as complete
- **Progress Tracking**: Visual progress bar shows completion percentage
- **Delete Items**: Remove individual checklist items or entire checklists
- **Multiple Checklists**: Add multiple checklists per card for complex tasks

#### Buttons
- **Save**: Save all changes and close the card editor
- **Delete Card**: Permanently remove the card from the list (verification required)

### Moving Cards
- **Drag & Drop**: Drag cards between lists or reorder within the same list
- **Visual Feedback**: Cards show dragging state and drop zones highlight during moves
- **Auto-Save**: Card positions are automatically saved after moving

## Data Management

### Automatic Saving
- All changes are automatically saved to your browser's local storage
- No manual save required - your data persists between sessions

### Export Backup
- Click "Export Backup" in the header
- Downloads a JSON file with timestamp (e.g., \`listy-backup-2025-01-27_14-30.json\`)
- Contains all boards, lists, cards, and settings
- Use for backup or transferring data between devices

### Import Backup
- Click "Import Backup" in the header
- Select a previously exported JSON backup file
- Confirms before replacing current data
- Restores all boards and settings from backup

### Storage Information
- Click "Storage Info" to view current usage
- Shows number of boards and storage size
- Displays last save timestamp

## Workspace View

### Accessing Workspace
- Click "Boards" button in the header to see all boards
- Shows a grid view of all your boards

### Board Grid Features
- **Visual Preview**: Each board shows as a card with background image
- **Quick Access**: Click any board to open it
- **Board Menu**: Hover over boards to access management options
- **Create New**: Click "Create new board" card to add boards

### Browser Compatibility
- Works in all modern browsers
- Requires JavaScript to be enabled
- Local storage must be available for data persistence




