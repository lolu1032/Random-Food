let currentTab = 'lunch';
let isLoading = false;

document.addEventListener('DOMContentLoaded', function() {
    loadHistory('lunch');
    loadHistory('dinner');
});

function openTab(tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));

    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    currentTab = tabName;
    loadHistory(tabName);
}

async function pickRandomFood(mealType) {
    if (isLoading) return;

    const button = document.getElementById(`${mealType}-button`);
    const resultBox = document.getElementById(`${mealType}-result`);
    const errorDiv = document.getElementById(`${mealType}-error`);

    isLoading = true;
    button.disabled = true;
    button.textContent = '추첨 중...';
    errorDiv.textContent = '';

    resultBox.classList.add('shake');
    resultBox.textContent = '추첨 중...';

    try {
        const foodValues = mealType === 'lunch' ? '0' : '1';

        const response = await fetch('/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ foodValues })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const food = await response.json();

        if (food && food.name) {
            setTimeout(() => {
                resultBox.textContent = `🍴 ${food.name}`;
                resultBox.style.color = '#FF6B6B';
                resultBox.style.fontSize = '2.2rem';
                loadHistory(mealType);
            }, 500);
        } else {
            throw new Error('음식 데이터를 받아오지 못했습니다.');
        }
    } catch (error) {
        console.error('Error:', error);
        resultBox.textContent = '오류가 발생했습니다';
        resultBox.style.color = '#e64b4b';
        errorDiv.textContent = '서버 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.';
    } finally {
        isLoading = false;
        button.disabled = false;
        button.textContent = `랜덤 ${mealType === 'lunch' ? '점심' : '저녁'} 추첨하기`;
        setTimeout(() => {
            resultBox.classList.remove('shake');
        }, 500);
    }
}

async function loadHistory(mealType) {
    try {
        const foodValues = mealType === 'lunch' ? '0' : '1';

        const response = await fetch(`/api/history?foodValues=${foodValues}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const history = await response.json();
        displayHistory(mealType, history);
    } catch (error) {
        console.error('History load error:', error);
        document.getElementById(`${mealType}-history`).innerHTML = '<li style="color: #888;">히스토리를 불러올 수 없습니다.</li>';
    }
}

function displayHistory(mealType, history) {
    const historyList = document.getElementById(`${mealType}-history`);

    if (!history || history.length === 0) {
        historyList.innerHTML = '<li style="color: #888;">아직 추첨 기록이 없습니다.</li>';
        return;
    }

    const sortedHistory = history.sort((a, b) => new Date(b.time) - new Date(a.time));

    historyList.innerHTML = sortedHistory.map(item => {
        const time = new Date(item.time);
        const timeString = time.toLocaleString('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `<li><span>🍴 ${item.food}</span><span class="history-time">${timeString}</span></li>`;
    }).join('');
}

async function resetFoodHistory(mealType) {
    if (!confirm(`${mealType === 'lunch' ? '점심' : '저녁'} 추첨 기록을 모두 삭제하시겠습니까?`)) return;

    const resetButton = document.getElementById(`${mealType}-reset`);
    const originalText = resetButton.textContent;

    try {
        resetButton.disabled = true;
        resetButton.textContent = '초기화 중...';

        const response = await fetch('/api/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        loadHistory(mealType);
        const resultBox = document.getElementById(`${mealType}-result`);
        resultBox.textContent = '결과가 여기에 표시됩니다';
        resultBox.style.color = '#333';
        resultBox.style.fontSize = '2rem';
        document.getElementById(`${mealType}-error`).textContent = '';
    } catch (error) {
        console.error('Reset error:', error);
        alert('초기화 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        resetButton.disabled = false;
        resetButton.textContent = originalText;
    }
}

function showError(mealType, message) {
    const errorDiv = document.getElementById(`${mealType}-error`);
    errorDiv.textContent = message;
    setTimeout(() => { errorDiv.textContent = ''; }, 3000);
}

window.addEventListener('online', () => {
    loadHistory(currentTab);
});

window.addEventListener('offline', () => {
    showError(currentTab, '인터넷 연결이 끊어졌습니다.');
});