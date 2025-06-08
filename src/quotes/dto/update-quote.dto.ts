import { PartialType } from '@nestjs/swagger';
import { CreateQuote } from './create-quote.dto';
import { ApiExtraModels } from '@nestjs/swagger';

@ApiExtraModels(CreateQuote)
export class UpdateQuote extends PartialType(CreateQuote) {}
