import { useCallback, useEffect, useRef } from 'react';
import backgroundMusic from '@/assets/music/Pixel_Heart.mp3';

export const useGameSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const propellerOscillatorRef = useRef<OscillatorNode | null>(null);
  const propellerGainRef = useRef<GainNode | null>(null);

  // Initialize audio context
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play crash sound using Web Audio API
  const playCrashSound = useCallback(() => {
    const ctx = initAudio();
    
    // Create noise for crash
    const bufferSize = ctx.sampleRate * 0.3; // 300ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      // Decaying white noise
      const decay = 1 - (i / bufferSize);
      data[i] = (Math.random() * 2 - 1) * decay * decay;
    }
    
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    // Low pass filter for thump
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.5;
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseSource.start();
    
    // Add low frequency thump
    const thump = ctx.createOscillator();
    thump.type = 'sine';
    thump.frequency.setValueAtTime(150, ctx.currentTime);
    thump.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
    
    const thumpGain = ctx.createGain();
    thumpGain.gain.setValueAtTime(0.6, ctx.currentTime);
    thumpGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    thump.connect(thumpGain);
    thumpGain.connect(ctx.destination);
    thump.start();
    thump.stop(ctx.currentTime + 0.3);
  }, [initAudio]);

  // Start propeller sound
  const startPropellerSound = useCallback((side: 'left' | 'right') => {
    const ctx = initAudio();
    
    // Stop existing propeller sound if any
    if (propellerOscillatorRef.current) {
      propellerOscillatorRef.current.stop();
      propellerOscillatorRef.current = null;
    }
    
    // Create buzzing propeller sound
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sawtooth';
    // Different pitch for left/right
    oscillator.frequency.value = side === 'left' ? 180 : 200;
    
    // Add modulation for buzzing effect
    const modulator = ctx.createOscillator();
    modulator.type = 'square';
    modulator.frequency.value = 25; // Rapid modulation
    
    const modulatorGain = ctx.createGain();
    modulatorGain.gain.value = 30; // Frequency deviation
    
    modulator.connect(modulatorGain);
    modulatorGain.connect(oscillator.frequency);
    
    // Main gain
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.08; // Keep it subtle
    
    // Low pass to soften
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    modulator.start();
    
    propellerOscillatorRef.current = oscillator;
    propellerGainRef.current = gainNode;
    
    // Store modulator for cleanup
    (oscillator as any)._modulator = modulator;
  }, [initAudio]);

  // Stop propeller sound
  const stopPropellerSound = useCallback(() => {
    if (propellerOscillatorRef.current) {
      const osc = propellerOscillatorRef.current;
      const mod = (osc as any)._modulator as OscillatorNode;
      
      // Fade out
      if (propellerGainRef.current) {
        const ctx = audioContextRef.current;
        if (ctx) {
          propellerGainRef.current.gain.setValueAtTime(propellerGainRef.current.gain.value, ctx.currentTime);
          propellerGainRef.current.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        }
      }
      
      setTimeout(() => {
        try {
          osc.stop();
          mod?.stop();
        } catch (e) {
          // Already stopped
        }
      }, 100);
      
      propellerOscillatorRef.current = null;
    }
  }, []);

  // Start background music
  const startBackgroundMusic = useCallback(() => {
    if (!backgroundMusicRef.current) {
      const audio = new Audio(backgroundMusic);
      audio.loop = true;
      audio.volume = 0.3;
      backgroundMusicRef.current = audio;
    }
    
    backgroundMusicRef.current.currentTime = 0;
    backgroundMusicRef.current.play().catch(() => {
      // Autoplay blocked, will play on user interaction
    });
  }, []);

  // Stop background music
  const stopBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
    }
  }, []);

  // Pause background music
  const pauseBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
    }
  }, []);

  // Resume background music
  const resumeBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.play().catch(() => {});
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPropellerSound();
      stopBackgroundMusic();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopPropellerSound, stopBackgroundMusic]);

  return {
    playCrashSound,
    startPropellerSound,
    stopPropellerSound,
    startBackgroundMusic,
    stopBackgroundMusic,
    pauseBackgroundMusic,
    resumeBackgroundMusic,
  };
};
