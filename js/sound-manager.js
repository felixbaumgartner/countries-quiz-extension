/**
 * Sound Manager - Handles sound effects using Web Audio API
 */

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.initialized = false;
  }

  /**
   * Initialize the audio context (must be called after user interaction)
   */
  init() {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
      this.enabled = false;
    }
  }

  /**
   * Play a correct answer sound (pleasant ascending tone)
   */
  playCorrect() {
    if (!this.enabled || !this.initialized) return;

    try {
      const context = this.audioContext;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, context.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, context.currentTime + 0.2); // G5

      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.3);
    } catch (error) {
      console.warn('Error playing correct sound:', error);
    }
  }

  /**
   * Play an incorrect answer sound (descending tone)
   */
  playIncorrect() {
    if (!this.enabled || !this.initialized) return;

    try {
      const context = this.audioContext;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.setValueAtTime(392.00, context.currentTime); // G4
      oscillator.frequency.setValueAtTime(329.63, context.currentTime + 0.1); // E4
      oscillator.frequency.setValueAtTime(261.63, context.currentTime + 0.2); // C4

      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.3);
    } catch (error) {
      console.warn('Error playing incorrect sound:', error);
    }
  }

  /**
   * Play a tick sound for timer
   */
  playTick() {
    if (!this.enabled || !this.initialized) return;

    try {
      const context = this.audioContext;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.setValueAtTime(800, context.currentTime);
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.05);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.05);
    } catch (error) {
      console.warn('Error playing tick sound:', error);
    }
  }

  /**
   * Play a finish sound
   */
  playFinish() {
    if (!this.enabled || !this.initialized) return;

    try {
      const context = this.audioContext;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, context.currentTime + 0.15); // E5
      oscillator.frequency.setValueAtTime(783.99, context.currentTime + 0.3); // G5
      oscillator.frequency.setValueAtTime(1046.50, context.currentTime + 0.45); // C6

      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.6);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.6);
    } catch (error) {
      console.warn('Error playing finish sound:', error);
    }
  }

  /**
   * Enable or disable sounds
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Check if sounds are enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }
}

// Create singleton instance
const soundManager = new SoundManager();
