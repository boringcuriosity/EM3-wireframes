import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { playCueFor, primeAudio } from '@/lib/breathSounds';

export type BreathKind = 'inhale' | 'hold' | 'exhale';

export interface BreathPhase {
  /** stable id, e.g. 'inhale' | 'hold1' | 'exhale' | 'hold2' */
  id: string;
  label: string;
  seconds: number;
  kind: BreathKind;
}

interface Options {
  mobile?: string;
  exerciseName: string;
  exerciseType: string;
  phases: BreathPhase[];
}

export interface BreathingEngine {
  running: boolean;
  phase: BreathPhase;
  phaseIndex: number;
  /** 0 → 1 within the current phase */
  phaseProgress: number;
  /** 0 → 1 across a whole cycle */
  cycleProgress: number;
  secondsLeft: number;
  cycles: number;
  soundOn: boolean;
  toggleSound: () => void;
  start: () => void;
  stop: () => void;
}

export function useBreathingEngine({ mobile, exerciseName, exerciseType, phases }: Options): BreathingEngine {
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [soundOn, setSoundOn] = useState(true);

  const soundRef = useRef(true);
  const rafRef = useRef<number | null>(null);
  const phasesRef = useRef(phases);
  phasesRef.current = phases;

  const sessionRef = useRef<{ id: string; startedAt: Date } | null>(null);
  const cyclesRef = useRef(0);

  const totalCycleSeconds = phases.reduce((s, p) => s + p.seconds, 0);

  const stopLoop = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const endSession = useCallback(
    async (status: 'stopped' | 'completed') => {
      const session = sessionRef.current;
      sessionRef.current = null;
      if (!session || !mobile) return;
      const endedAt = new Date();
      const durationSeconds = Math.round((endedAt.getTime() - session.startedAt.getTime()) / 1000);
      // analytics event
      console.info('breathing_exercise_ended', {
        user_id: mobile,
        exercise_name: exerciseName,
        exercise_type: exerciseType,
        started_at: session.startedAt.toISOString(),
        ended_at: endedAt.toISOString(),
        duration_seconds: durationSeconds,
        completed_cycles: cyclesRef.current,
        session_id: session.id,
      });
      await supabase
        .from('breathing_exercise_sessions')
        .update({
          ended_at: endedAt.toISOString(),
          duration_seconds: durationSeconds,
          completed_cycles: cyclesRef.current,
          status,
        })
        .eq('session_id', session.id);
    },
    [mobile, exerciseName, exerciseType],
  );

  const start = useCallback(() => {
    primeAudio();
    cyclesRef.current = 0;
    setCycles(0);
    setPhaseIndex(0);
    setPhaseProgress(0);
    setRunning(true);

    if (soundRef.current) playCueFor(phasesRef.current[0].kind);

    const startedAt = new Date();
    const sessionId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    sessionRef.current = { id: sessionId, startedAt };

    console.info('breathing_exercise_started', {
      user_id: mobile,
      exercise_name: exerciseName,
      exercise_type: exerciseType,
      started_at: startedAt.toISOString(),
      session_id: sessionId,
    });

    if (mobile) {
      void supabase.from('breathing_exercise_sessions').insert({
        mobile,
        exercise_name: exerciseName,
        exercise_type: exerciseType,
        session_id: sessionId,
        started_at: startedAt.toISOString(),
        status: 'started',
      });
    }
  }, [mobile, exerciseName, exerciseType]);

  const stop = useCallback(() => {
    setRunning(false);
    setPhaseIndex(0);
    setPhaseProgress(0);
    void endSession('stopped');
  }, [endSession]);

  // timing loop
  useEffect(() => {
    if (!running) {
      stopLoop();
      return;
    }
    let idx = 0;
    let phaseStart = performance.now();

    const tick = (now: number) => {
      const list = phasesRef.current;
      const current = list[idx];
      const elapsed = (now - phaseStart) / 1000;
      if (elapsed >= current.seconds) {
        phaseStart = now;
        idx = (idx + 1) % list.length;
        if (idx === 0) {
          cyclesRef.current += 1;
          setCycles(cyclesRef.current);
        }
        setPhaseIndex(idx);
        setPhaseProgress(0);
        if (soundRef.current) playCueFor(list[idx].kind);
      } else {
        setPhaseProgress(elapsed / current.seconds);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return stopLoop;
  }, [running]);

  // log the session if the user navigates away mid-exercise
  useEffect(() => {
    return () => {
      if (sessionRef.current) void endSession('stopped');
      stopLoop();
    };
  }, [endSession]);

  const toggleSound = useCallback(() => {
    setSoundOn((s) => {
      soundRef.current = !s;
      if (!s) primeAudio();
      return !s;
    });
  }, []);

  const phase = phases[Math.min(phaseIndex, phases.length - 1)];
  const secondsLeft = Math.max(1, Math.ceil(phase.seconds - phaseProgress * phase.seconds));
  const elapsedBefore = phases.slice(0, phaseIndex).reduce((s, p) => s + p.seconds, 0);
  const cycleProgress = totalCycleSeconds
    ? (elapsedBefore + phaseProgress * phase.seconds) / totalCycleSeconds
    : 0;

  return {
    running,
    phase,
    phaseIndex,
    phaseProgress,
    cycleProgress,
    secondsLeft,
    cycles,
    soundOn,
    toggleSound,
    start,
    stop,
  };
}
