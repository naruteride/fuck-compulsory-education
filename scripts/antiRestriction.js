const AntiRestriction = {
	disableTextSelection: function() {
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

		console.log("텍스트 선택 제한, 복사 제한, 붙여넣기 제한 기능이 비활성화되었습니다.");

		// 5초마다 반복 실행하여 동적으로 추가되는 코드에 대응
		setInterval(() => {
			removeEventListeners(events);
			resetCSS();
		}, 5000);
	},

	enableAlwaysVisiblePage: function() {
		// visibilityState 속성을 재정의하여 항상 "visible" 상태를 유지
		Object.defineProperty(Document.prototype, "visibilityState", {
			get: function () {
				return "visible";
			}
		});

		// hidden 속성도 재정의해서 페이지가 숨겨진 상태에서도 계속 활성화된 것으로 인식
		Object.defineProperty(Document.prototype, "hidden", {
			get: function () {
				return "visible";
			}
		});

		// visibilitychange 이벤트 리스너를 추가하여 페이지 가시성 변경 이벤트 차단
		document.addEventListener("visibilitychange", event => {
			event.stopImmediatePropagation();
		}, true);
	}
};
