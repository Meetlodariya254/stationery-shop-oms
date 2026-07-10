import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export function validateRequest(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((e: any) => {
      if (e.type === 'field') {
        return { field: e.path, message: e.msg };
      }
      if (e.type === 'unknown_fields') {
        const fields = Array.isArray(e.fields) ? e.fields.map((f: any) => f.path || f.key || JSON.stringify(f)).join(', ') : 'unknown_field';
        return { field: fields, message: e.msg || 'Unknown field(s) not allowed by schema' };
      }
      return { field: e.path || 'unknown', message: e.msg };
    });

    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
    return;
  }
  next();
}
