import { renderadminLearning } from './AdminLearning.js' 

export function renderHomeTab(container, user) {
    container.innerHTML = `
        <div id="contentArea"></div>
    `;    
    renderadminLearning(document.getElementById('contentArea'));
}