import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({
    schema: {
      example: {
        status: 'ok',
      },
    },
  })
  getHealth(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
