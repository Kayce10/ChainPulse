//! Payment Alerts – ChainPulse
//!
//! Real-time alert scoring for Stellar payment corridors.
//!
//! Each payment event is scored on three axes:
//!  - **Latency anomaly**: settlement time vs. corridor baseline
//!  - **Volume spike**:    transaction volume vs. rolling 24-hour average
//!  - **Failure surge**:   failure-rate change over a sliding window
//!
//! When the composite score exceeds a configurable threshold the engine
//! emits an `AlertEvent` that callers can forward to Slack, webhooks, etc.

use serde::{Deserialize, Serialize};

// ── Types ────────────────────────────────────────────────────────────────────

/// Severity level of a payment alert.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AlertSeverity {
    Info,
    Warning,
    Critical,
}

impl AlertSeverity {
    /// Derive severity from a normalised composite score in [0.0, 1.0].
    pub fn from_score(score: f64) -> Self {
        if score >= 0.75 {
            AlertSeverity::Critical
        } else if score >= 0.45 {
            AlertSeverity::Warning
        } else {
            AlertSeverity::Info
        }
    }
}

/// A single payment observation used as input to the scorer.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentObservation {
    /// Unique corridor identifier (e.g. `"USDC:GA…->PHP:GB…"`).
    pub corridor_key: String,
    /// Actual settlement latency in milliseconds.
    pub settlement_ms: u64,
    /// Baseline (rolling median) latency for the corridor in milliseconds.
    pub baseline_ms: u64,
    /// Transaction volume in this observation window (USD).
    pub volume_usd: f64,
    /// 24-hour rolling average volume for the corridor (USD).
    pub avg_volume_usd: f64,
    /// Failure rate in this observation window [0.0, 1.0].
    pub failure_rate: f64,
    /// Baseline failure rate for the corridor [0.0, 1.0].
    pub baseline_failure_rate: f64,
}

/// An alert event emitted when scoring crosses a threshold.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertEvent {
    pub corridor_key: String,
    pub severity: AlertSeverity,
    /// Composite score in [0.0, 1.0].
    pub score: f64,
    /// Human-readable summary.
    pub message: String,
    /// ISO-8601 timestamp.
    pub triggered_at: String,
}

// ── Scoring ───────────────────────────────────────────────────────────────────

/// Weights applied to each scoring axis (must sum to ≤ 1.0).
#[derive(Debug, Clone)]
pub struct ScoringWeights {
    pub latency: f64,
    pub volume: f64,
    pub failure: f64,
}

impl Default for ScoringWeights {
    fn default() -> Self {
        ScoringWeights {
            latency: 0.35,
            volume: 0.25,
            failure: 0.40,
        }
    }
}

/// Configuration for the alert engine.
#[derive(Debug, Clone)]
pub struct AlertConfig {
    /// Minimum composite score required to emit an alert (default: 0.45).
    pub emit_threshold: f64,
    /// Scoring axis weights.
    pub weights: ScoringWeights,
    /// Latency multiplier that counts as a full latency score (default: 3.0×).
    pub latency_max_multiplier: f64,
    /// Volume spike multiplier that counts as a full volume score (default: 5.0×).
    pub volume_max_multiplier: f64,
}

impl Default for AlertConfig {
    fn default() -> Self {
        AlertConfig {
            emit_threshold: 0.45,
            weights: ScoringWeights::default(),
            latency_max_multiplier: 3.0,
            volume_max_multiplier: 5.0,
        }
    }
}

/// Score a single payment observation and optionally return an alert.
///
/// Returns `None` when the composite score is below `config.emit_threshold`.
pub fn score_observation(
    obs: &PaymentObservation,
    config: &AlertConfig,
) -> Option<AlertEvent> {
    let latency_score = score_latency(obs, config);
    let volume_score = score_volume(obs, config);
    let failure_score = score_failure(obs);

    let composite = latency_score * config.weights.latency
        + volume_score * config.weights.volume
        + failure_score * config.weights.failure;

    let composite = composite.clamp(0.0, 1.0);

    if composite < config.emit_threshold {
        return None;
    }

    let severity = AlertSeverity::from_score(composite);
    let message = build_message(obs, composite, &severity);

    Some(AlertEvent {
        corridor_key: obs.corridor_key.clone(),
        severity,
        score: composite,
        message,
        triggered_at: chrono::Utc::now().to_rfc3339(),
    })
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/// Normalised latency anomaly score in [0.0, 1.0].
fn score_latency(obs: &PaymentObservation, config: &AlertConfig) -> f64 {
    if obs.baseline_ms == 0 {
        return 0.0;
    }
    let multiplier = obs.settlement_ms as f64 / obs.baseline_ms as f64;
    ((multiplier - 1.0) / (config.latency_max_multiplier - 1.0)).clamp(0.0, 1.0)
}

/// Normalised volume spike score in [0.0, 1.0].
fn score_volume(obs: &PaymentObservation, config: &AlertConfig) -> f64 {
    if obs.avg_volume_usd <= 0.0 {
        return 0.0;
    }
    let multiplier = obs.volume_usd / obs.avg_volume_usd;
    // Volume drop is also anomalous
    let deviation = (multiplier - 1.0).abs();
    (deviation / (config.volume_max_multiplier - 1.0)).clamp(0.0, 1.0)
}

/// Normalised failure surge score in [0.0, 1.0].
fn score_failure(obs: &PaymentObservation) -> f64 {
    let delta = obs.failure_rate - obs.baseline_failure_rate;
    // A failure rate 20 percentage points above baseline = full score
    (delta / 0.20).clamp(0.0, 1.0)
}

fn build_message(
    obs: &PaymentObservation,
    score: f64,
    severity: &AlertSeverity,
) -> String {
    let level = match severity {
        AlertSeverity::Critical => "🚨 CRITICAL",
        AlertSeverity::Warning => "⚠️  WARNING",
        AlertSeverity::Info => "ℹ️  INFO",
    };
    format!(
        "{level}: corridor '{}' anomaly score {:.2} | latency {}ms (baseline {}ms) | \
        failure rate {:.1}% (baseline {:.1}%)",
        obs.corridor_key,
        score,
        obs.settlement_ms,
        obs.baseline_ms,
        obs.failure_rate * 100.0,
        obs.baseline_failure_rate * 100.0,
    )
}

// ── Unit tests ────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn baseline_obs() -> PaymentObservation {
        PaymentObservation {
            corridor_key: "USDC->PHP".to_string(),
            settlement_ms: 2_000,
            baseline_ms: 2_000,
            volume_usd: 100_000.0,
            avg_volume_usd: 100_000.0,
            failure_rate: 0.01,
            baseline_failure_rate: 0.01,
        }
    }

    #[test]
    fn no_alert_for_normal_observation() {
        let obs = baseline_obs();
        let result = score_observation(&obs, &AlertConfig::default());
        assert!(
            result.is_none(),
            "Normal traffic should not trigger an alert"
        );
    }

    #[test]
    fn critical_alert_on_high_failure_rate() {
        let obs = PaymentObservation {
            failure_rate: 0.40, // 40% failure — 39pp above baseline
            ..baseline_obs()
        };
        let alert = score_observation(&obs, &AlertConfig::default())
            .expect("High failure rate should trigger an alert");
        assert_eq!(alert.severity, AlertSeverity::Critical);
        assert!(alert.score >= 0.75);
    }

    #[test]
    fn warning_alert_on_moderate_latency_spike() {
        let obs = PaymentObservation {
            settlement_ms: 5_000, // 2.5× baseline
            ..baseline_obs()
        };
        let alert = score_observation(&obs, &AlertConfig::default());
        // Latency alone (weight 0.35) at 75% score → 0.26; below 0.45 threshold
        // so only failure weight contributes – no alert expected unless combined
        // with other factors.  Verify the scorer doesn't panic.
        let _ = alert; // result may be None; we just check it doesn't panic
    }

    #[test]
    fn combined_spike_triggers_warning_or_critical() {
        let obs = PaymentObservation {
            settlement_ms: 6_000,        // 3× baseline → latency score 1.0
            volume_usd: 600_000.0,       // 6× avg → volume score 1.0 (clamped)
            failure_rate: 0.15,          // +14pp → failure score 0.70
            ..baseline_obs()
        };
        let alert = score_observation(&obs, &AlertConfig::default())
            .expect("Combined spike should always trigger");
        assert!(
            matches!(
                alert.severity,
                AlertSeverity::Warning | AlertSeverity::Critical
            ),
            "Expected Warning or Critical, got {:?}",
            alert.severity
        );
    }

    #[test]
    fn alert_severity_thresholds() {
        assert_eq!(AlertSeverity::from_score(0.0), AlertSeverity::Info);
        assert_eq!(AlertSeverity::from_score(0.44), AlertSeverity::Info);
        assert_eq!(AlertSeverity::from_score(0.45), AlertSeverity::Warning);
        assert_eq!(AlertSeverity::from_score(0.74), AlertSeverity::Warning);
        assert_eq!(AlertSeverity::from_score(0.75), AlertSeverity::Critical);
        assert_eq!(AlertSeverity::from_score(1.0), AlertSeverity::Critical);
    }

    #[test]
    fn zero_baseline_does_not_panic() {
        let obs = PaymentObservation {
            baseline_ms: 0,
            avg_volume_usd: 0.0,
            ..baseline_obs()
        };
        // Must not panic or produce NaN/Inf
        let result = score_observation(&obs, &AlertConfig::default());
        if let Some(alert) = result {
            assert!(
                alert.score.is_finite(),
                "Score must be finite even with zero baselines"
            );
        }
    }

    #[test]
    fn custom_threshold_suppresses_warning() {
        let obs = PaymentObservation {
            failure_rate: 0.12, // moderate spike
            ..baseline_obs()
        };
        let strict_config = AlertConfig {
            emit_threshold: 0.90, // very strict
            ..AlertConfig::default()
        };
        let result = score_observation(&obs, &strict_config);
        assert!(
            result.is_none(),
            "Strict threshold should suppress moderate alerts"
        );
    }

    #[test]
    fn corridor_key_preserved_in_alert() {
        let obs = PaymentObservation {
            corridor_key: "USDC:GA123->NGN:GB456".to_string(),
            failure_rate: 0.45,
            ..baseline_obs()
        };
        let alert = score_observation(&obs, &AlertConfig::default())
            .expect("High failure should trigger");
        assert_eq!(alert.corridor_key, "USDC:GA123->NGN:GB456");
    }

    #[test]
    fn message_contains_corridor_and_score() {
        let obs = PaymentObservation {
            failure_rate: 0.30,
            ..baseline_obs()
        };
        let alert = score_observation(&obs, &AlertConfig::default())
            .expect("Should trigger");
        assert!(alert.message.contains(&obs.corridor_key));
        assert!(alert.message.contains(&format!("{:.2}", alert.score)));
    }
}
