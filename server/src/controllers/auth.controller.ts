import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { sendResponse } from '../utils/response.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/auth.js';

export class AuthController {
  constructor(private authService: AuthService = new AuthService()) {}

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, accessToken, refreshToken } = await this.authService.register(req.body);
      setRefreshTokenCookie(res, refreshToken);
      sendResponse(res, 201, { user, accessToken }, 'Registration successful');
    } catch (err) {
      next(err);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, accessToken, refreshToken } = await this.authService.login(req.body);
      setRefreshTokenCookie(res, refreshToken);
      sendResponse(res, 200, { user, accessToken }, 'Login successful');
    } catch (err) {
      next(err);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (req.user?.userId) {
        await this.authService.logout(req.user.userId, refreshToken);
      }
      clearRefreshTokenCookie(res);
      sendResponse(res, 200, null, 'Logout successful');
    } catch (err) {
      next(err);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const incomingRefreshToken =
        req.cookies?.refreshToken || req.headers['x-refresh-token'] || req.body?.refreshToken;

      if (!incomingRefreshToken) {
        sendResponse(res, 401, null, 'Refresh token missing.');
        return;
      }

      const { user, accessToken, refreshToken } =
        await this.authService.refreshTokens(incomingRefreshToken);
      setRefreshTokenCookie(res, refreshToken);
      sendResponse(res, 200, { user, accessToken }, 'Token refresh successful');
    } catch (err) {
      clearRefreshTokenCookie(res);
      next(err);
    }
  };

  public forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.authService.forgotPassword(req.body.email);
      sendResponse(
        res,
        200,
        result,
        'If an account exists with that email, a password reset link has been issued.',
      );
    } catch (err) {
      next(err);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.authService.resetPassword(req.body.token, req.body.password);
      sendResponse(res, 200, null, 'Password reset successful. You may now log in.');
    } catch (err) {
      next(err);
    }
  };

  public verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.authService.verifyEmail(req.body.token);
      sendResponse(res, 200, null, 'Email verification successful.');
    } catch (err) {
      next(err);
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        sendResponse(res, 401, null, 'Unauthorized');
        return;
      }
      const user = await this.authService.getCurrentUser(req.user.userId);
      sendResponse(res, 200, { user }, 'Current user profile retrieved');
    } catch (err) {
      next(err);
    }
  };
}
