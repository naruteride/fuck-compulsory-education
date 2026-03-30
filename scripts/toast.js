const Toast = {
	styles: `
		.custom-toast-container {
			position: fixed;
			bottom: 20px;
			left: 50%;
			transform: translateX(-50%);
			z-index: 10000;
			display: flex;
			flex-direction: column;
			align-items: center;
			pointer-events: none;
		}
		.custom-toast {
			background-color: rgba(51, 51, 51, 0.9);
			color: #fff;
			padding: 12px 24px;
			border-radius: 8px;
			margin-top: 10px;
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
			font-size: 14px;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
			opacity: 0;
			transform: translateY(20px);
			transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
		}
		.custom-toast.show {
			opacity: 1;
			transform: translateY(0);
		}
	`,
	
	init: function() {
		if (!document.querySelector("#custom-toast-styles")) {
			const styleElement = document.createElement("style");
			styleElement.id = "custom-toast-styles";
			styleElement.textContent = this.styles;
			document.head.appendChild(styleElement);
		}

		if (!document.querySelector("#custom-toast-container")) {
			const container = document.createElement("div");
			container.id = "custom-toast-container";
			container.className = "custom-toast-container";
			document.body.appendChild(container);
		}
	},

	show: function(message, duration = 4000) {
		this.init();
		const container = document.querySelector("#custom-toast-container");
		
		const toast = document.createElement("div");
		toast.className = "custom-toast";
		toast.textContent = message;
		
		container.appendChild(toast);
		
		// 리플로우(reflow)를 강제하여 transition 애니메이션이 동작하도록 함
		toast.offsetHeight;
		toast.classList.add("show");
		
		setTimeout(() => {
			toast.classList.remove("show");
			setTimeout(() => {
				toast.remove();
			}, 300); // transition 종료 후 DOM에서 제거
		}, duration);
	}
};
