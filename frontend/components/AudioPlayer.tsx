"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw, ExternalLink, Sparkles } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface AudioPlayerProps {
  recordingUrl?: string | null;
  candidateName?: string;
  durationSeconds?: number;
}

export default function AudioPlayer({
  recordingUrl,
  candidateName,
  durationSeconds = 180,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds || 180);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current && recordingUrl) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate, recordingUrl]);

  const togglePlay = () => {
    if (!recordingUrl) {
      // Simulated audio playback for demo / preview
      if (isPlaying) {
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
      }
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  };

  // Simulated timer loop if real URL audio is not loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && (!recordingUrl || !audioRef.current)) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackRate);
    }
    return () => clearInterval(interval);
  }, [isPlaying, recordingUrl, duration, playbackRate]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const resetAudio = () => {
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl">
      {recordingUrl && (
        <audio
          ref={audioRef}
          src={recordingUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
          }}
          onLoadedMetadata={() => {
            if (audioRef.current && audioRef.current.duration) {
              setDuration(audioRef.current.duration);
            }
          }}
        />
      )}

      {/* Header info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">
              Voice Screening Recording
            </h4>
            <p className="text-xs text-slate-400">
              {candidateName ? `Candidate: ${candidateName}` : "AI Recruiter & Candidate Audio"}
            </p>
          </div>
        </div>

        {recordingUrl && (
          <a
            href={recordingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            <span>Raw File</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Animated Waveform Visualization */}
      <div className="flex items-center justify-center gap-1.5 h-12 my-2 bg-slate-950/60 rounded-xl px-4 border border-slate-800/60">
        {[20, 45, 75, 90, 60, 30, 85, 100, 65, 40, 95, 70, 50, 80, 60, 35, 90, 75, 40, 60].map(
          (height, idx) => {
            const isPassed = (idx / 20) * 100 <= progressPercent;
            return (
              <div
                key={idx}
                className={`w-1.5 rounded-full transition-all duration-200 ${
                  isPassed
                    ? "bg-gradient-to-t from-indigo-500 to-cyan-400 shadow-[0_0_6px_rgba(99,102,241,0.6)]"
                    : "bg-slate-800"
                } ${isPlaying ? (idx % 2 === 0 ? "animate-wave-1" : "animate-wave-2") : ""}`}
                style={{
                  height: isPlaying ? undefined : `${Math.max(6, (height / 100) * 32)}px`,
                }}
              />
            );
          }
        )}
      </div>

      {/* Seek bar */}
      <div className="space-y-1.5 mt-3">
        <input
          type="range"
          min="0"
          max={duration || 180}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
        />
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>{formatDuration(currentTime)}</span>
          <span>{formatDuration(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60">
        <div className="flex items-center gap-2">
          <button
            onClick={resetAudio}
            title="Restart"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setIsMuted(!isMuted);
              if (audioRef.current) audioRef.current.muted = !isMuted;
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Main Play / Pause Button */}
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-white" />
          ) : (
            <Play className="w-5 h-5 fill-white translate-x-0.5" />
          )}
        </button>

        {/* Speed multiplier badge button */}
        <button
          onClick={cycleSpeed}
          className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors"
        >
          {playbackRate}x
        </button>
      </div>
    </div>
  );
}
