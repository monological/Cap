use std::time::Duration;
use tauri::AppHandle;

#[derive(Debug)]
pub enum PostHogEvent {
    MultipartUploadComplete {
        duration: Duration,
        length: Duration,
        size: u64,
    },
    MultipartUploadFailed {
        duration: Duration,
        error: String,
    },
    RecordingStarted {
        mode: &'static str,
        target_kind: &'static str,
        has_camera: bool,
        has_mic: bool,
        has_system_audio: bool,
        target_fps: u32,
        target_width: u32,
        target_height: u32,
        fragmented: bool,
        custom_cursor_capture: bool,
    },
    RecordingCompleted {
        mode: &'static str,
        status: &'static str,
        duration_secs: u64,
        segment_count: u32,
        track_failure_count: u32,
        error_class: Option<String>,
        video_frames_captured: u64,
        video_frames_dropped: u64,
        drop_rate_pct: f64,
        capture_stalls_count: u64,
        capture_stalls_max_ms: u64,
        mixer_stalls_count: u64,
        mixer_stalls_max_ms: u64,
        audio_gaps_count: u64,
        audio_gaps_total_ms: u64,
        frame_drop_rate_high_count: u64,
        source_restarts_count: u64,
        muxer_crash_count: u64,
        audio_degraded_count: u64,
        dropped_mic_messages: u64,
    },
    RecordingMuxerCrashed {
        mode: &'static str,
        reason: String,
        seconds_into_recording: f64,
    },
    RecordingAudioDegraded {
        mode: &'static str,
        reason: String,
        seconds_into_recording: f64,
    },
    RecordingRecovered {
        trigger: &'static str,
        recovered_duration_secs: u64,
        segments_recovered: u32,
        validation_took_ms: u64,
    },
    RecordingRecoveryFailed {
        trigger: &'static str,
        reason: String,
    },
    RecordingDiskSpaceLow {
        mode: &'static str,
        bytes_remaining: u64,
    },
    RecordingDiskSpaceExhausted {
        mode: &'static str,
        bytes_remaining: u64,
    },
    RecordingDeviceLost {
        mode: &'static str,
        subsystem: String,
    },
    RecordingEncoderRebuilt {
        mode: &'static str,
        backend: String,
        attempt: u32,
    },
    RecordingSourceAudioReset {
        mode: &'static str,
        source: String,
        starvation_ms: u64,
    },
    RecordingCaptureTargetLost {
        mode: &'static str,
        target: String,
    },
}

pub fn init() {}

pub fn set_server_url(_url: &str) {}

pub fn set_telemetry_enabled(_enabled: bool) {}

pub fn async_capture_event(_app: &AppHandle, event: PostHogEvent) {
    match event {
        PostHogEvent::MultipartUploadComplete {
            duration,
            length,
            size,
        } => {
            let _ = (duration, length, size);
        }
        PostHogEvent::MultipartUploadFailed { duration, error } => {
            let _ = (duration, error);
        }
        PostHogEvent::RecordingStarted {
            mode,
            target_kind,
            has_camera,
            has_mic,
            has_system_audio,
            target_fps,
            target_width,
            target_height,
            fragmented,
            custom_cursor_capture,
        } => {
            let _ = (
                mode,
                target_kind,
                has_camera,
                has_mic,
                has_system_audio,
                target_fps,
                target_width,
                target_height,
                fragmented,
                custom_cursor_capture,
            );
        }
        PostHogEvent::RecordingCompleted {
            mode,
            status,
            duration_secs,
            segment_count,
            track_failure_count,
            error_class,
            video_frames_captured,
            video_frames_dropped,
            drop_rate_pct,
            capture_stalls_count,
            capture_stalls_max_ms,
            mixer_stalls_count,
            mixer_stalls_max_ms,
            audio_gaps_count,
            audio_gaps_total_ms,
            frame_drop_rate_high_count,
            source_restarts_count,
            muxer_crash_count,
            audio_degraded_count,
            dropped_mic_messages,
        } => {
            let _ = (
                mode,
                status,
                duration_secs,
                segment_count,
                track_failure_count,
                error_class,
                video_frames_captured,
                video_frames_dropped,
                drop_rate_pct,
                capture_stalls_count,
                capture_stalls_max_ms,
                mixer_stalls_count,
                mixer_stalls_max_ms,
                audio_gaps_count,
                audio_gaps_total_ms,
                frame_drop_rate_high_count,
                source_restarts_count,
                muxer_crash_count,
                audio_degraded_count,
                dropped_mic_messages,
            );
        }
        PostHogEvent::RecordingMuxerCrashed {
            mode,
            reason,
            seconds_into_recording,
        } => {
            let _ = (mode, reason, seconds_into_recording);
        }
        PostHogEvent::RecordingAudioDegraded {
            mode,
            reason,
            seconds_into_recording,
        } => {
            let _ = (mode, reason, seconds_into_recording);
        }
        PostHogEvent::RecordingRecovered {
            trigger,
            recovered_duration_secs,
            segments_recovered,
            validation_took_ms,
        } => {
            let _ = (
                trigger,
                recovered_duration_secs,
                segments_recovered,
                validation_took_ms,
            );
        }
        PostHogEvent::RecordingRecoveryFailed { trigger, reason } => {
            let _ = (trigger, reason);
        }
        PostHogEvent::RecordingDiskSpaceLow {
            mode,
            bytes_remaining,
        } => {
            let _ = (mode, bytes_remaining);
        }
        PostHogEvent::RecordingDiskSpaceExhausted {
            mode,
            bytes_remaining,
        } => {
            let _ = (mode, bytes_remaining);
        }
        PostHogEvent::RecordingDeviceLost { mode, subsystem } => {
            let _ = (mode, subsystem);
        }
        PostHogEvent::RecordingEncoderRebuilt {
            mode,
            backend,
            attempt,
        } => {
            let _ = (mode, backend, attempt);
        }
        PostHogEvent::RecordingSourceAudioReset {
            mode,
            source,
            starvation_ms,
        } => {
            let _ = (mode, source, starvation_ms);
        }
        PostHogEvent::RecordingCaptureTargetLost { mode, target } => {
            let _ = (mode, target);
        }
    }
}
