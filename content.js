// 페이지가 완전히 로드된 후 실행
console.log("확장 프로그램 스크립트가 로드되었습니다.");

// DOMContentLoaded 이벤트 사용
document.addEventListener("DOMContentLoaded", initializeExtension);

// window.onload 이벤트도 함께 사용 (DOMContentLoaded가 이미 발생했을 경우 대비)
window.onload = initializeExtension;

// 초기화 완료 여부 추적
let initialized = false;

// 프로그레스 바 스타일 정의
const progressBarStyles = `
	.progress-container {
		position: fixed;
		top: 10px;
		right: 10px;
		width: 200px;
		background-color: #f3f3f3;
		border-radius: 5px;
		box-shadow: 0 1px 5px rgba(0,0,0,0.2);
		padding: 10px;
		z-index: 9999;
		font-family: Arial, sans-serif;
	}
	.progress-bar {
		height: 20px;
		background-color: #4CAF50;
		border-radius: 3px;
		width: 0%;
		transition: width 1s;
	}
	.progress-text {
		margin-top: 5px;
		font-size: 12px;
		color: #333;
		text-align: center;
	}
	.progress-title {
		margin-bottom: 5px;
		font-size: 14px;
		font-weight: bold;
		color: #333;
	}
`;

function initializeExtension() {
	// 이미 초기화되었으면 중복 실행 방지
	if (initialized) return;
	initialized = true;

	console.log("초기화 함수 실행됨, 현재 URL:", window.location.href);

	// 페이지 URL이 hrdcen.com 도메인의 courses 경로를 포함하는지 확인
	if (window.location.href.includes("hrdcen.com/courses/course")) {
		console.log("망할법정의무교육이 활성화되었습니다.");

		// 문서 가시성 상태를 항상 "visible"로 설정
		Object.defineProperty(Document.prototype, "visibilityState", {
			get: function () {
				return "visible";
			}
		});

		Object.defineProperty(Document.prototype, "hidden", {
			get: function () {
				return "visible";
			}
		});

		document.addEventListener("visibilitychange", event => {
			event.stopImmediatePropagation();
		}, true);

		// 스타일 추가
		addStyles(progressBarStyles);

		if (document.querySelector("span.check-circle")) {
			// 최소 학습 시간을 두 번째 <strong> 태그에서 추출
			let minStudySeconds = 0;
			const minTimeElement = document.querySelector("[data-min_study_seconds]");

			if (minTimeElement) {
				// <strong> 태그들을 찾음
				const strongTags = minTimeElement.querySelectorAll("strong");

				// 두 번째 <strong> 태그가 존재하면 (최소 학습 시간)
				if (strongTags && strongTags.length >= 2) {
					// 텍스트에서 숫자만 추출 ("17분"에서 17 추출)
					const minTimeText = strongTags[1].textContent;
					const minTimeMatch = minTimeText.match(/(\d+)/);

					if (minTimeMatch && minTimeMatch[1]) {
						// 분을 초로 변환
						const minTimeMinutes = parseInt(minTimeMatch[1], 10);
						minStudySeconds = minTimeMinutes * 60;
						console.log(`최소 학습 시간: ${minTimeMinutes}분 (${minStudySeconds}초)`);
					} else {
						console.error("최소 학습 시간을 추출할 수 없습니다.");
						// 백업으로 data-min_study_seconds 속성 사용
						minStudySeconds = parseInt(minTimeElement.getAttribute("data-min_study_seconds"), 10);
						console.log(`data-min_study_seconds 속성에서 가져온 최소 시간: ${minStudySeconds}초`);
					}
				} else {
					console.error("<strong> 태그를 찾을 수 없습니다.");
					// 백업으로 data-min_study_seconds 속성 사용
					minStudySeconds = parseInt(minTimeElement.getAttribute("data-min_study_seconds"), 10);
					console.log(`data-min_study_seconds 속성에서 가져온 최소 시간: ${minStudySeconds}초`);
				}

				// 프로그레스 바 생성
				createProgressBar(minStudySeconds);

				// 텍스트 선택 제한, 복사 제한, 붙여넣기 제한을 해제
				disableTextSelection();

				if (minStudySeconds > 0) {
					let startTime = Date.now();
					let timer = setInterval(() => {
						const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
						const progress = Math.min(100, (elapsedSeconds / minStudySeconds) * 100);

						// 프로그레스 바 업데이트
						updateProgressBar(progress, elapsedSeconds, minStudySeconds);

						// 완료되면 타이머 중지하고 페이지 새로고침
						if (elapsedSeconds >= minStudySeconds) {
							clearInterval(timer);
							console.log(`${minStudySeconds}초가 지났습니다. 페이지를 새로고침합니다.`);
							setTimeout(() => {
								location.reload();
							}, 1000);
						}
					}, 1000);
				}
			} else {
				console.error("data-min_study_seconds 요소를 찾을 수 없습니다.");
			}

			// 페이지 로드 시 체크 서클 상태 확인
			checkAndProceed();

			// 체크 서클 상태를 확인하고 다음으로 진행하는 함수
			function checkAndProceed() {
				console.group("완료 상태 확인");
				const checkCircle = document.querySelector("span.check-circle");
				if (checkCircle.classList.contains("is-hidden") && (checkCircle.style.display == "" || checkCircle.style.display == "none")) {
					console.log("안넘겼음");
				} else {
					console.log("넘겼음");
					document.querySelector("button.sequence-nav-button.button-next").click();
				}
				console.groupEnd();
			}
		} else {
			console.error("최소 시간 확인 요소가 없습니다.");
		}

	} else {
		console.error("URL이 일치하지 않습니다:", window.location.href);
	}
}

// 스타일을 페이지에 추가
function addStyles(styles) {
	const styleElement = document.createElement("style");
	styleElement.textContent = styles;
	document.head.appendChild(styleElement);
}

// 프로그레스 바 생성
function createProgressBar(totalSeconds) {
	const progressContainer = document.createElement("div");
	progressContainer.className = "progress-container";
	progressContainer.innerHTML = `
		<div class="progress-title">학습 진행 상황</div>
		<div class="progress-bar"></div>
		<div class="progress-text">0초 / ${totalSeconds}초 (0%)</div>
	`;
	document.body.appendChild(progressContainer);
}

// 프로그레스 바 업데이트
function updateProgressBar(progress, currentSeconds, totalSeconds) {
	const progressBar = document.querySelector(".progress-bar");
	const progressText = document.querySelector(".progress-text");

	if (progressBar && progressText) {
		progressBar.style.width = `${progress}%`;
		progressText.textContent = `${currentSeconds}초 / ${totalSeconds}초 (${Math.round(progress)}%)`;
	}
}

// 텍스트 선택 제한, 복사 제한, 붙여넣기 제한을 해제
function disableTextSelection() {
	function removeEventListeners(eventTypes) {
		const elements = document.querySelectorAll("*");

		eventTypes.forEach(eventType => {
			document[`on${eventType}`] = null;

			document.body[`on${eventType}`] = null;
			document.documentElement[`on${eventType}`] = null;

			elements.forEach(el => {
				el[`on${eventType}`] = null;
			});
		});
	}

	function resetCSS() {
		const style = document.createElement("style");
		style.innerHTML = `
						* {
								-webkit-user-select: auto !important;
								-moz-user-select: auto !important;
								-ms-user-select: auto !important;
								user-select: auto !important;
						}
						
						::selection {
								background: #b3d4fc !important;
								color: #000 !important;
								text-shadow: none !important;
						}
				`;
		document.head.appendChild(style);
	}

	const events = [
		"selectstart",
		"mousedown",
		"mouseup",
		"contextmenu",
		"copy",
		"cut",
		"paste",
		"dragstart",
	];

	// 기본 이벤트 동작 복원
	function restoreDefaultEvents() {
		events.forEach(event => {
			document.addEventListener(
				event,
				function (e) {
					e.stopPropagation();
				},
				true
			);
		});
	}

	removeEventListeners(events);
	resetCSS();
	restoreDefaultEvents();

	console.log("텍스트 선택 방지 기능이 비활성화되었습니다.");

	// 5초마다 반복 실행하여 동적으로 추가되는 코드에도 대응
	setInterval(() => {
		removeEventListeners(events);
		resetCSS();
	}, 5000);
};