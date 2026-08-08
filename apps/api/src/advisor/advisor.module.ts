import { Module } from '@nestjs/common';
import { AdvisorController } from './advisor.controller';
import { AdvisorService } from './advisor.service';
import { RuleEngineStrategy } from './strategies/rule-engine.strategy';
import { RECOMMENDATION_STRATEGY } from './strategies/recommendation.strategy';

@Module({
  controllers: [AdvisorController],
  providers: [
    AdvisorService,
    RuleEngineStrategy,
    // Swap or augment with an LlmStrategy here in the future — the
    // AdvisorService only depends on the RecommendationStrategy interface.
    { provide: RECOMMENDATION_STRATEGY, useExisting: RuleEngineStrategy },
  ],
})
export class AdvisorModule {}
