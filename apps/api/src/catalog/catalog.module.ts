import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { IngredientsController } from './ingredients.controller';
import { IngredientsService } from './ingredients.service';

@Module({
  controllers: [ProductsController, CategoriesController, CollectionsController, IngredientsController],
  providers: [ProductsService, CategoriesService, CollectionsService, IngredientsService],
  exports: [ProductsService],
})
export class CatalogModule {}
