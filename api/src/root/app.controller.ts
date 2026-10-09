import { Body, Controller, Get, Post } from '@nestjs/common';

import { AppService } from './app.service';
import { TestValidationDto } from './dto/test-validation.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('test-validation')
  testValidation(
    @Body() body: TestValidationDto,
  ): TestValidationDto {
    return body;
  }
}
