import { PartialType } from '@nestjs/mapped-types';
import { CreateQuote } from './create-quote.dto';

export class UpdateQuote extends PartialType(CreateQuote) {}
