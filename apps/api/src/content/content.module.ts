import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { FaqsController } from './faqs.controller';
import { FaqsService } from './faqs.service';
import { TestimonialsController } from './testimonials.controller';
import { TestimonialsService } from './testimonials.service';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';

@Module({
  controllers: [BlogController, FaqsController, TestimonialsController, GalleryController],
  providers: [BlogService, FaqsService, TestimonialsService, GalleryService],
})
export class ContentModule {}
