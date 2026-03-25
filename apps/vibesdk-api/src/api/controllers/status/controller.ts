import { BaseController } from '@/api/controllers/baseController';
import type { ApiResponse, ControllerResponse } from '@/api/controllers/types';
import type { RouteContext } from '@/api/types/route-context';
import type { PlatformStatusData } from '@/api/controllers/status/types';

export class StatusController extends BaseController {
  static async getPlatformStatus(
    _request: Request,
    _env: Env,
    _ctx: ExecutionContext,
    context: RouteContext,
  ): Promise<ControllerResponse<ApiResponse<PlatformStatusData>>> {
    const messaging = context.config.globalMessaging ?? {
      globalUserMessage: '',
      changeLogs: '',
    };
    const globalUserMessage = messaging.globalUserMessage ?? '';
    const changeLogs = messaging.changeLogs ?? '';

    const data: PlatformStatusData = {
      globalUserMessage,
      changeLogs,
      hasActiveMessage: globalUserMessage.trim().length > 0,
    };

    return StatusController.createSuccessResponse(data);
  }
}
