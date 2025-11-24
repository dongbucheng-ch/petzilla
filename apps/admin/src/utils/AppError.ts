/**
 * 自定义应用错误类
 */
export class AppError extends Error {
  public readonly details?: any;
  public readonly errorCode: string;
  public readonly isOperational: boolean;
  public readonly statusCode: number;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_ERROR',
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = isOperational;

    // 保持正确的堆栈跟踪
  }
}

/**
 * 业务错误类 (400)
 */
export class BadRequestError extends AppError {
  constructor(message: string = '请求参数错误', details?: any) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

/**
 * 未授权错误类 (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = '未授权', details?: any) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

/**
 * 禁止访问错误类 (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = '禁止访问', details?: any) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

/**
 * 资源不存在错误类 (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string = '资源不存在', details?: any) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

/**
 * 冲突错误类 (409)
 */
export class ConflictError extends AppError {
  constructor(message: string = '资源冲突', details?: any) {
    super(message, 409, 'CONFLICT', details);
  }
}

/**
 * 验证错误类 (422)
 */
export class ValidationError extends AppError {
  constructor(message: string = '数据验证失败', details?: any) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

/**
 * 服务器错误类 (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = '服务器内部错误', details?: any) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', details);
  }
}

/**
 * 服务不可用错误类 (503)
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = '服务暂时不可用', details?: any) {
    super(message, 503, 'SERVICE_UNAVAILABLE', details);
  }
}
