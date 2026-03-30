const ProgressBar = {
	styles: `
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
	`,
	
	init: function() {
		this.addStyles(this.styles);
	},

	addStyles: function(styles) {
		const styleElement = document.createElement("style");
		styleElement.textContent = styles;
		document.head.appendChild(styleElement);
	},

	create: function(totalSeconds) {
		const progressContainer = document.createElement("div");
		progressContainer.className = "progress-container";
		progressContainer.innerHTML = `
			<div class="progress-title">학습 진행 상황</div>
			<div class="progress-bar"></div>
			<div class="progress-text">0초 / ${totalSeconds}초 (0%)</div>
		`;
		document.body.appendChild(progressContainer);
	},

	update: function(currentSeconds, totalSeconds) {
		const progress = Math.min(100, (currentSeconds / totalSeconds) * 100);
		const progressBar = document.querySelector(".progress-bar");
		const progressText = document.querySelector(".progress-text");

		if (progressBar && progressText) {
			progressBar.style.width = `${progress}%`;
			progressText.textContent = `${currentSeconds}초 / ${totalSeconds}초 (${Math.round(progress)}%)`;
		}
	}
};
