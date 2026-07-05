import "@testing-library/jest-dom";

// jsdom doesn't implement HTMLMediaElement.play / pause — stub them out
window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = vi.fn();
window.HTMLMediaElement.prototype.load = vi.fn();
