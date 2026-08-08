import { Module } from '@nestjs/common';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  controllers: [NewsletterController, ContactController],
  providers: [NewsletterService, ContactService],
})
export class MarketingModule {}
