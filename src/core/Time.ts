class Time {
	public time = 0;
	public sceneLoaded = 0;
	public lastFrame = 0;
	public sinceSceneLoaded = 0;
	public deltaTime = 0;
	public timeScale = 0;
	public frameCount = 0;
	public totalFrames = 0;
	public avfps = 0;
	public fps = 0;
	public scale = 1;

	public tick() {
		this.time = Date.now();
		this.sinceSceneLoaded = this.time - this.sceneLoaded;
		this.deltaTime = this.time - this.lastFrame;
		this.lastFrame = this.time;
		this.frameCount++;
		this.totalFrames++;
		this.avfps = Math.round(1000*this.totalFrames/this.sinceSceneLoaded);
	}

	public framerate() {
		this.fps = this.frameCount;
		this.frameCount = 0;
	}
}

export default Time;