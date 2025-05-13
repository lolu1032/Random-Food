// 쿠키에서 UUID 추출 함수
function getUUIDFromCookie() {
    const match = document.cookie.match(/(?:^|; )uuid=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
}

// 사용자 식별을 위한 UUID 생성 함수
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 쿠키에서 UUID 가져오기
const uuidFromCookie = getUUIDFromCookie();

// 세션 스토리지에서 UUID 가져오기
let userUUID = sessionStorage.getItem('userUUID');

// UUID가 다르면 세션 초기화
if (userUUID !== uuidFromCookie) {
    sessionStorage.clear();
    userUUID = uuidFromCookie || generateUUID();
    sessionStorage.setItem('userUUID', userUUID);

    if (!uuidFromCookie) {
        document.cookie = `uuid=${userUUID}; path=/; max-age=600`;
    }
}

    // API 기본 URL (실제 서버 주소로 변경해야 함)
    const API_URL = '/api';
    const RESET_API_URL = '/api/reset';

    // 히스토리 데이터 (로컬 스토리지에서 세션 스토리지로 변경)
    const foodHistory = {
        lunch: JSON.parse(sessionStorage.getItem('lunchHistory') || '[]'),
        dinner: JSON.parse(sessionStorage.getItem('dinnerHistory') || '[]')
    };

    // 최대 히스토리 개수
    const MAX_HISTORY = 10;

    function openTab(tabName) {
        // 모든 탭 컨텐츠 숨기기
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        // 모든 탭 버튼 비활성화
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // 선택한 탭 컨텐츠 표시 및 버튼 활성화
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`.tab[onclick="openTab('${tabName}')"]`).classList.add('active');
    }

    async function pickRandomFood(mealType) {
        // 버튼 비활성화 및 로딩 상태 표시
        const button = document.getElementById(`${mealType}-button`);
        const resultBox = document.getElementById(`${mealType}-result`);
        const errorDiv = document.getElementById(`${mealType}-error`);

        button.disabled = true;
        resultBox.textContent = '음식을 추첨 중입니다...';
        errorDiv.textContent = '';

        const foodValues = mealType === 'lunch' ? 0 : 1;

        try {
            // API 호출
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uuid: userUUID,
                    foodValues : foodValues
                })
            });

            if (!response.ok) {
                throw new Error('서버 오류가 발생했습니다.');
            }

            const data = await response.json();

            // 애니메이션 효과
            resultBox.classList.add('shake');

            // 애니메이션 후 결과 표시
            setTimeout(() => {
                resultBox.textContent = data.name;
                resultBox.classList.remove('shake');

                // 히스토리에 추가
                addToHistory(mealType, data.name, data.description);

                // 버튼 다시 활성화
                button.disabled = false;
            }, 500);

        } catch (error) {
            console.error('Error:', error);

            if (error.message === '더 이상 선택할 수 있는 음식이 없습니다.') {
                errorDiv.textContent = '더 이상 선택할 수 있는 음식이 없습니다. 모든 음식을 선택했습니다.';
                resultBox.textContent = '결과가 여기에 표시됩니다';
            } else {
                errorDiv.textContent = '음식을 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                resultBox.textContent = '결과가 여기에 표시됩니다';
            }

            // 버튼 다시 활성화
            button.disabled = false;
        }
    }

    function addToHistory(mealType, foodName, foodDescription = '') {
        // 현재 시간 가져오기
        const now = new Date();
        const time = now.getHours() + ':' +
                  (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();

        // 히스토리 배열 앞에 추가
        foodHistory[mealType].unshift({
            food: foodName,
            description: foodDescription,
            time: time
        });

        // 최대 개수 유지
        if (foodHistory[mealType].length > MAX_HISTORY) {
            foodHistory[mealType].pop();
        }

        // 세션 스토리지에 저장 (로컬 스토리지에서 세션 스토리지로 변경)
        sessionStorage.setItem(`${mealType}History`, JSON.stringify(foodHistory[mealType]));

        // 히스토리 UI 업데이트
        updateHistoryUI(mealType);
    }

    function updateHistoryUI(mealType) {
        const historyList = document.getElementById(`${mealType}-history`);
        historyList.innerHTML = '';

        // 히스토리가 없는 경우
        if (foodHistory[mealType].length === 0) {
            const li = document.createElement('li');
            li.textContent = '아직 추첨 기록이 없습니다.';
            historyList.appendChild(li);
            return;
        }

        // 히스토리 목록 생성
        foodHistory[mealType].forEach(item => {
            const li = document.createElement('li');

            const foodSpan = document.createElement('span');
            foodSpan.textContent = item.food;
            if (item.description) {
                foodSpan.title = item.description;
            }

            const timeSpan = document.createElement('span');
            timeSpan.textContent = item.time;
            timeSpan.className = 'history-time';

            li.appendChild(foodSpan);
            li.appendChild(timeSpan);
            historyList.appendChild(li);
        });
    }

    // 음식 이력 초기화 함수 (중복 선언 제거)
    async function resetFoodHistory(mealType) {
        const button = document.getElementById(`${mealType}-reset`);
        const resultBox = document.getElementById(`${mealType}-result`);
        const errorDiv = document.getElementById(`${mealType}-error`);

        button.disabled = true;
        errorDiv.textContent = '';

        try {
            // 백엔드 초기화 API 호출
            try {
                const response = await fetch(RESET_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        uuid: userUUID,
                        type: mealType
                    })
                });
                console.log('Reset API response:', response.ok ? 'success' : 'failed');
            } catch (apiError) {
                // API가 없을 경우 무시하고 진행
                console.log('Reset API not implemented or error occurred, proceeding with local reset');
            }

            // 로컬 히스토리 초기화
            foodHistory[mealType] = [];
            sessionStorage.setItem(`${mealType}History`, JSON.stringify([])); // 로컬 스토리지에서 세션 스토리지로 변경
            updateHistoryUI(mealType);

            // 결과 표시 초기화
            resultBox.textContent = '결과가 여기에 표시됩니다';

            // 성공 메시지 표시
            errorDiv.textContent = '초기화가 완료되었습니다!';
            errorDiv.style.color = '#28a745';

            // 일정 시간 후 메시지 제거
            setTimeout(() => {
                errorDiv.textContent = '';
                errorDiv.style.color = '#e64b4b'; // 기본 에러 색상으로 복원
            }, 3000);

        } catch (error) {
            console.error('Reset error:', error);
            errorDiv.textContent = '초기화 중 오류가 발생했습니다. 다시 시도해주세요.';
        } finally {
            button.disabled = false;
        }
    }

    // 새로고침 버튼 추가
    function addRefreshButton() {
        const refreshButton = document.createElement('button');
        refreshButton.textContent = '세션 초기화';
        refreshButton.className = 'reset-button';
        refreshButton.style.marginTop = '20px';
        refreshButton.style.backgroundColor = '#4CAF50';
        refreshButton.onclick = function() {
            // 세션 스토리지 모두 비우기
            sessionStorage.clear();
            // 페이지 새로고침
            window.location.reload();
        };

        const container = document.querySelector('.container');
        container.insertBefore(refreshButton, document.querySelector('footer'));
    }

    // 페이지 로드 시 초기화
    document.addEventListener('DOMContentLoaded', function() {
        updateHistoryUI('lunch');
        updateHistoryUI('dinner');
        addRefreshButton(); // 새로고침 버튼 추가
    });