import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { HomepageController } from './homepage.controller';
import { HomepageService } from './homepage.service';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';

@Module({
  controllers: [SettingsController, HomepageController, SeoController],
  providers: [SettingsService, HomepageService, SeoService],
})
export class SiteModule {}
