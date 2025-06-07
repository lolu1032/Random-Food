document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".tab");
    const tabContents = document.querySelectorAll(".tab-content");

    const UUID_KEY = "randomFoodUuid";
    const HISTORY_KEY_PREFIX = "randomFoodHistory_";

    // UUID 초기화 (수정 불가능하게)
    const initializeUuid = async () => {
        if (!localStorage.getItem(UUID_KEY)) {
            try {
                const response = await fetch("/uuid");
                const uuid = await response.text();
                localStorage.setItem(UUID_KEY, uuid);
            } catch (err) {
                console.error("UUID 요청 실패", err);
            }
        }
    };

    // 탭 전환
    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));
            tab.classList.add("active");
            tabContents[index].classList.add("active");
        });
    });

    // 공통 함수들
    const updateResult = (resultBox, foodName) => {
        resultBox.textContent = foodName;
    };

const MAX_HISTORY_LENGTH = 8;

const saveToHistory = (typeStr, foodName) => {
    const key = HISTORY_KEY_PREFIX + typeStr;
    let history = JSON.parse(localStorage.getItem(key)) || [];

    // 새 음식 추가 후, 오래된 항목 잘라냄
    history.push(foodName);
    if (history.length > MAX_HISTORY_LENGTH) {
        history = history.slice(-MAX_HISTORY_LENGTH);
    }

    localStorage.setItem(key, JSON.stringify(history));
};

const addHistoryItem = (listEl, foodName) => {
    // 새 항목 추가
    const li = document.createElement("li");
    li.textContent = foodName;
    listEl.appendChild(li);

    // 8개 초과 시, 맨 앞 항목 제거
    while (listEl.children.length > MAX_HISTORY_LENGTH) {
        listEl.removeChild(listEl.firstChild);
    }
};
    const loadHistory = (typeStr, listEl) => {
        const key = HISTORY_KEY_PREFIX + typeStr;
        const history = JSON.parse(localStorage.getItem(key)) || [];
        listEl.innerHTML = "";
        history.forEach(name => addHistoryItem(listEl, name));
    };

    const clearHistory = (typeStr, listEl) => {
        const key = HISTORY_KEY_PREFIX + typeStr;
        localStorage.removeItem(key);
        listEl.innerHTML = "";
    };

    // 숫자 type -> 문자열 type 변환 헬퍼
    const typeNumToStr = (typeNum) => {
        return typeNum === 0 ? "lunch" : "dinner";
    };

    // 버튼 핸들링
    const handlePick = async (typeNum) => {
        const uuid = localStorage.getItem(UUID_KEY);
        const typeStr = typeNumToStr(typeNum);

        const resultBox = document.getElementById(`${typeStr}-result`);
        const historyList = document.getElementById(`${typeStr}-history`);
        const errorBox = document.getElementById(`${typeStr}-error`);
        errorBox.textContent = "";

        try {
            const response = await fetch("/api", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ uuid, type: typeNum })
            });

            if (!response.ok) {
                let errorMessage = "음식을 불러오는 데 실패했습니다.";
                try {
                    const errData = await response.json();
                    if (errData.message) {
                        errorMessage = errData.message;
                    }
                } catch {}

                throw new Error(errorMessage);
            }

            const data = await response.json();
            const foodName = data.food.name;

            updateResult(resultBox, foodName);
            addHistoryItem(historyList, foodName);
            saveToHistory(typeStr, foodName);

        } catch (err) {
            console.error(err);
            errorBox.textContent = err.message;
        }
    };

    // 초기화 버튼
    const setupResetButton = (typeStr) => {
        document.getElementById(`${typeStr}-reset`).addEventListener("click", () => {
            const list = document.getElementById(`${typeStr}-history`);
            clearHistory(typeStr, list);
            document.getElementById(`${typeStr}-result`).textContent = "결과가 여기에 표시됩니다";
        });
    };

    // 초기화
    (async () => {
        await initializeUuid();

        loadHistory("lunch", document.getElementById("lunch-history"));
        loadHistory("dinner", document.getElementById("dinner-history"));

        document.getElementById("lunch-button").addEventListener("click", () => handlePick(0));  // 점심: 0
        document.getElementById("dinner-button").addEventListener("click", () => handlePick(1)); // 저녁: 1

        setupResetButton("lunch");
        setupResetButton("dinner");
    })();
});
