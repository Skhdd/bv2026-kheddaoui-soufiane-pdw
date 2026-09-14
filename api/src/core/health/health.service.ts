import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
    getHello(): any {
        return {'status': 'ok'};
    }
}
