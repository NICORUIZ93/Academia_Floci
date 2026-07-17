package academy.rutaflow;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public final class PricingEngine {
    public record QuoteRequest(BigDecimal weightKg, int distanceKm) {
        public QuoteRequest {
            if (weightKg.signum() <= 0) throw new IllegalArgumentException("weightKg must be positive");
            if (distanceKm < 0) throw new IllegalArgumentException("distanceKm cannot be negative");
        }
    }

    @FunctionalInterface
    public interface PricingRule {
        BigDecimal charge(QuoteRequest request);
    }

    private final List<PricingRule> rules;

    public PricingEngine(List<PricingRule> rules) {
        this.rules = List.copyOf(rules);
    }

    public BigDecimal quote(QuoteRequest request) {
        return rules.stream()
                .map(rule -> rule.charge(request))
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_EVEN);
    }
}
