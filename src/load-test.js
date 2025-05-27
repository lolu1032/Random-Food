import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
    duration: '1m',     // 테스트 지속 시간
    vus: 500            // 동시에 실행될 VU 수
};

// 테스트 중 매 VU에 고유한 UUID 부여 (고정된 VU ID 사용)
export default function () {
    const uuid = `vu-${__VU}`; // VU 고유 식별자 사용
    const payload = JSON.stringify({
        uuid: uuid,
        type: 0  // 또는 1, 필요에 따라 랜덤하게도 가능
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const res = http.post('http://localhost:8080/api', payload, params);

    if (res.status !== 200) {
        console.error(`Error for ${uuid}: status ${res.status} - ${res.body}`);
    }

    sleep(1); // 요청 간 1초 대기 (필요에 따라 조정)
}
