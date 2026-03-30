// 페이지가 완전히 로드된 후 실행
console.log("망할법정의무교육 확장 프로그램 스크립트가 로드되었습니다.");

// DOMContentLoaded 이벤트 사용
document.addEventListener("DOMContentLoaded", initializeExtension);

// window.onload 이벤트도 함께 사용 (DOMContentLoaded가 이미 발생했을 경우 대비)
window.onload = initializeExtension;

// 초기화 완료 여부
let initialized = false;

function initializeExtension() {
	// 이미 초기화되었으면 중복 실행 방지
	if (initialized) return;
	initialized = true;

	// 강의 페이지인지 확인
	if (!document.querySelector("#course-content")) {
		return;
	}

	console.log("강의 페이지를 인식하여 망할법정의무교육이 활성화되었습니다.");

	// 페이지가 항상 보이는 상태로 유지되도록 설정
	AntiRestriction.enableAlwaysVisiblePage();

	// 텍스트 선택 제한, 복사 제한, 붙여넣기 제한을 해제
	AntiRestriction.disableTextSelection();

	// 프로그레스 바 스타일 추가 및 초기화
	ProgressBar.init();

	// 최소 학습 시간을 추출
	const minStudySeconds = extractMinStudySeconds();

	// 최소시간 검사
	if (!minStudySeconds) {
		console.log("최소 학습 시간을 추출할 수 없습니다.")
		return;
	}

	// 페이지 로드(새로고침) 직후 완료 상태 확인
	const isCompleted = !!(document.querySelector("[role=tablist]")?.querySelector(".sr")?.textContent?.includes("완료"));
	
	const storageKey = `study_progress_${window.location.pathname}`;
	let savedSeconds = localStorage.getItem(storageKey) || 0;

	// (1) 이미 완료된 강의라면 기록 삭제
	if (isCompleted) {
		localStorage.removeItem(storageKey);
		savedSeconds = 0; // 초과 저장된 시간이 UI에 영향을 주지 않도록 리셋
	}
	// (2) 로컬스토리지의 값은 최소 시간을 넘겼으나, 강의 완료 처리가 안 되어있는 경우
	else if (savedSeconds >= minStudySeconds) {
		Toast.show("시간은 넘겼으나, 강의 완료 처리가 안 되어있습니다. 로컬스토리지를 지우고 10초 뒤 페이지를 새로고침합니다.", 10000);
		localStorage.removeItem(storageKey);
		
		ProgressBar.create(minStudySeconds);
		ProgressBar.update(minStudySeconds, minStudySeconds);
		
		setTimeout(() => {
			location.reload();
		}, 10000);
		return; // 타이머 시작 안 함
	}
	// (3) 정상 진행 (처음 시작 혹은 이어서 진행)
	else {
		const minutes = Math.floor(minStudySeconds / 60);
		const seconds = minStudySeconds % 60;
		let timeText = "";
		if (minutes > 0) timeText += `${minutes}분`;
		if (seconds > 0) timeText += ` ${seconds}초`;
		
		let continueText = savedSeconds > 0 ? ` (이전 진행: ${savedSeconds}초 부터)` : "";
		Toast.show(`망할법정의무교육 활성화: ${timeText} 동안 시청해야 합니다.${continueText}`);
	}
	
	// 프로그레스 바 생성 및 초기 표기
	ProgressBar.create(minStudySeconds);
	ProgressBar.update(savedSeconds, minStudySeconds);
	
	// 타이머 시작
	startStudyTimer(minStudySeconds, savedSeconds, storageKey);

	// 완료 처리가 된 경우 다음 강의로 진행
	checkAndProceed();
}

// 최소 학습 시간을 추출하는 함수
function extractMinStudySeconds() {
	let minStudySeconds = 0;
	const minTimeElement = document.querySelector("[data-min_study_seconds]");

	if (minTimeElement?.dataset?.min_study_seconds) {
		minStudySeconds = minTimeElement.dataset.min_study_seconds;
	} else if (minTimeElement?.querySelector("strong")?.textContent?.match(/(\d+)/)) {
		const minTimeMatch = minTimeElement.querySelector("strong").textContent.match(/(\d+)/);
		minStudySeconds = minTimeMatch[1] * 60;
	} else {
		minStudySeconds = 0;
	}

	return Number(minStudySeconds);
}

// 학습 타이머 측정 및 프로그레스 바 갱신 함수
function startStudyTimer(minStudySeconds, savedSeconds = 0, storageKey = null) {
	let startTime = Date.now() - (savedSeconds * 1000); // 이전 진행된 시간(초) 만큼 보정하여 시작
	let timer = setInterval(() => {
		const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);		

		// 10초에 한 번 로컬스토리지에 저장
		if (storageKey && elapsedSeconds % 10 == 0) {
			localStorage.setItem(storageKey, Math.min(elapsedSeconds, minStudySeconds));
		}

		// 프로그레스 바 업데이트
		ProgressBar.update(elapsedSeconds, minStudySeconds);

		// 완료되면 타이머 중지하고 페이지 새로고침
		if (elapsedSeconds > minStudySeconds) {
			clearInterval(timer);
			console.log(`${minStudySeconds}초가 지났습니다. 로컬스토리지를 지우고 페이지를 새로고침합니다.`);
			if (storageKey) localStorage.removeItem(storageKey);
			
			setTimeout(() => {
				location.reload();
			}, 1000);
		}
	}, 1000);
}

// 완료 상태를 확인하고 다음으로 진행
function checkAndProceed() {
	if (document.querySelector("[role=tablist]")?.querySelector(".sr")?.textContent?.includes("완료")) {
		document.querySelector("button.sequence-nav-button.button-next")?.click();
	}
}


// 네트워크를 조작하는 건 발각당할 위험이 커서 봉인
// 
// fetch("{개발자도구>네트워크>`update_completed_seconds`>헤더>API 호출 경로}", {
// 	method: "POST",
// 	headers: {
// 		"Content-Type": "application/json",
// 		"X-Csrftoken": "{개발자도구>네트워크>`update_completed_seconds`>헤더>`X-Csrftoken` 값}"
// 	},
// 	body: JSON.stringify({
// 		// 원하는 학습 시간을 ↓이곳에 채워넣으세요.
// 		seconds: 924.725
// 	})
// });
// 
// // `update_completed_seconds` 네트워크 요청은, 강의가 켜져있는 브라우저를 내렸다가 다시 켰을 때 확인할 수 있습니다.