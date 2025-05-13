let userUUID = null;

// 쿠키에서 UUID 가져오기
function getUUIDFromCookie() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'uuid') {
            return decodeURIComponent(value);
        }
    }
    return null;
}

// UUID 생성 함수 (서버 요청 실패시 백업용)
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function fetchUUIDFromServer() {
    try {
        const response = await fetch('/api/session-uuid');
        if (!response.ok) throw new Error('UUID 요청 실패');
        const serverUUID = await response.text();

        if (serverUUID) {
            document.cookie = `uuid=${encodeURIComponent(serverUUID)}; path=/; max-age=600`; // 10분 유지
            return serverUUID;
        }
    } catch (error) {
        console.error('UUID 서버 요청 오류:', error);
    }
    return null;
}

async function initializeUUID() {
    const uuidFromCookie = getUUIDFromCookie();
    const savedUUID = sessionStorage.getItem('userUUID');

    // 쿠키가 없거나 세션 값과 다르면 처리
    if (!uuidFromCookie || savedUUID !== uuidFromCookie) {
        // UUID가 변경되면 히스토리도 초기화
        sessionStorage.removeItem('lunchHistory');
        sessionStorage.removeItem('dinnerHistory');

        let newUUID = uuidFromCookie;

        if (!newUUID) {
            // 서버에서 UUID 요청
            newUUID = await fetchUUIDFromServer();
            if (!newUUID) {
                // 서버에서도 못 받으면 생성
                newUUID = generateUUID();
                document.cookie = `uuid=${encodeURIComponent(newUUID)}; path=/; max-age=600`;
            }
        }

        userUUID = newUUID;
        sessionStorage.setItem('userUUID', userUUID);

        // 히스토리 초기화
        foodHistory.lunch = [];
        foodHistory.dinner = [];
    } else {
        userUUID = savedUUID;
    }

    return userUUID;
}

const API_URL = '/api';
const RESET_API_URL = '/api/reset';
const MAX_HISTORY = 10;

const foodHistory = {
    lunch: JSON.parse(sessionStorage.getItem('lunchHistory') || '[]'),
    dinner: JSON.parse(sessionStorage.getItem('dinnerHistory') || '[]')
};

// 페이지 로드 시 UUID 초기화 및 히스토리 업데이트
window.addEventListener('DOMContentLoaded', async () => {
    userUUID = await initializeUUID();
    updateHistoryUI('lunch');
    updateHistoryUI('dinner');
});

function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`.tab[onclick="openTab('${tabName}')"]`).classList.add('active');
}

async function pickRandomFood(mealType) {
    const button = document.getElementById(`${mealType}-button`);
    const resultBox = document.getElementById(`${mealType}-result`);
    const errorDiv = document.getElementById(`${mealType}-error`);

    button.disabled = true;
    resultBox.textContent = '음식을 추첨 중입니다...';
    errorDiv.textContent = '';

    const foodValues = mealType === 'lunch' ? 0 : 1;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uuid: userUUID, foodValues })
        });

        if (!response.ok) throw new Error('서버 오류가 발생했습니다.');

        const data = await response.json();
        resultBox.classList.add('shake');

        setTimeout(() => {
            resultBox.textContent = data.name;
            resultBox.classList.remove('shake');
            addToHistory(mealType, data.name, data.description);
            button.disabled = false;
        }, 500);

    } catch (error) {
        console.error('Error:', error);
        if (error.message.includes('더 이상 선택할 수 있는 음식이 없습니다')) {
            errorDiv.textContent = '모든 음식을 선택했습니다.';
        } else {
            errorDiv.textContent = '오류가 발생했습니다. 다시 시도해주세요.';
        }
        resultBox.textContent = '결과가 여기에 표시됩니다';
        button.disabled = false;
    }
}

function addToHistory(mealType, foodName, foodDescription = '') {
    const now = new Date();
    const time = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();

    foodHistory[mealType].unshift({ food: foodName, description: foodDescription, time });
    if (foodHistory[mealType].length > MAX_HISTORY) foodHistory[mealType].pop();

    sessionStorage.setItem(`${mealType}History`, JSON.stringify(foodHistory[mealType]));
    updateHistoryUI(mealType);
}

function updateHistoryUI(mealType) {
    const historyList = document.getElementById(`${mealType}-history`);
    historyList.innerHTML = '';

    if (foodHistory[mealType].length === 0) {
        const li = document.createElement('li');
        li.textContent = '아직 추첨 기록이 없습니다.';
        historyList.appendChild(li);
        return;
    }

    foodHistory[mealType].forEach(item => {
        const li = document.createElement('li');
        const foodSpan = document.createElement('span');
        foodSpan.textContent = item.food;
        if (item.description) foodSpan.title = item.description;

        const timeSpan = document.createElement('span');
        timeSpan.textContent = item.time;
        timeSpan.className = 'history-time';

        li.appendChild(foodSpan);
        li.appendChild(timeSpan);
        historyList.appendChild(li);
    });
}

async function resetFoodHistory(mealType) {
    const button = document.getElementById(`${mealType}-reset`);
    const resultBox = document.getElementById(`${mealType}-result`);
    const errorDiv = document.getElementById(`${mealType}-error`);

    button.disabled = true;
    errorDiv.textContent = '';

    try {
        try {
            const response = await fetch(RESET_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uuid: userUUID, type: mealType })
            });
            console.log('Reset API response:', response.ok ? 'success' : 'failed');
        } catch (apiError) {
            console.log('Reset API not implemented or error occurred');
        }

        foodHistory[mealType] = [];
        sessionStorage.setItem(`${mealType}History`, JSON.stringify([]));
        updateHistoryUI(mealType);
        resultBox.textContent = '결과가 여기에 표시됩니다';
        errorDiv.textContent = '초기화가 완료되었습니다!';
    } catch (error) {
        console.error('Error:', error);
        errorDiv.textContent = '초기화 중 오류가 발생했습니다.';
    } finally {
        button.disabled = false;
    }
}

// 페이지 가시성 변경 감지 (탭 전환, 다시 돌아올 때)
document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
        // 페이지가 다시 보일 때 UUID 확인 및 필요시 초기화
        const oldUUID = userUUID;
        userUUID = await initializeUUID();

        // UUID가 변경되었으면 UI 업데이트
        if (oldUUID !== userUUID) {
            updateHistoryUI('lunch');
            updateHistoryUI('dinner');
        }
    }
});