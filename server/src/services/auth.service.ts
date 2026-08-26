import { UserRepository } from '../repositories/user.repository.js';
import { IUserDocument, UserRole } from '../models/user.model.js';
import { AppError } from '../utils/appError.js';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateRandomToken,
} from '../utils/auth.js';

export interface SanitizedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export class AuthService {
  constructor(private userRepository: UserRepository = new UserRepository()) {}

  public sanitizeUser(user: IUserDocument): SanitizedUser {
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      isVerified: user.isVerified,
      createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString(),
    };
  }

  public async register(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    phone?: string;
  }): Promise<{ user: SanitizedUser; accessToken: string; refreshToken: string }> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('An account with this email address already exists.', 400);
    }

    const hashedPassword = await hashPassword(data.password);
    const verificationToken = generateRandomToken();
    const verificationTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const newUser = await this.userRepository.create({
      name: data.name,
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      role: data.role || 'CUSTOMER',
      phone: data.phone,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
      refreshTokens: [],
    });

    const accessToken = generateAccessToken({
      userId: newUser._id.toString(),
      role: newUser.role,
    });
    const refreshToken = generateRefreshToken({ userId: newUser._id.toString() });

    newUser.refreshTokens.push(refreshToken);
    await newUser.save();

    // Trigger registration email asynchronously
    import('./email.service.js').then(({ emailService }) => {
      emailService.sendRegistrationEmail({ email: newUser.email, name: newUser.name });
    });

    return {
      user: this.sanitizeUser(newUser),
      accessToken,
      refreshToken,
    };
  }

  public async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: SanitizedUser; accessToken: string; refreshToken: string }> {
    // Select password and refreshTokens explicitly
    const user = await this.userRepository['model']
      .findOne({ email: data.email.toLowerCase().trim() })
      .select('+password +refreshTokens')
      .exec();

    if (!user || !user.password) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });
    const refreshToken = generateRefreshToken({ userId: user._id.toString() });

    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push(refreshToken);
    await user.save();

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  public async logout(userId: string, refreshToken?: string): Promise<void> {
    const user = await this.userRepository['model']
      .findById(userId)
      .select('+refreshTokens')
      .exec();

    if (user && refreshToken) {
      user.refreshTokens = (user.refreshTokens || []).filter((token) => token !== refreshToken);
      await user.save();
    }
  }

  public async refreshTokens(incomingRefreshToken: string): Promise<{
    user: SanitizedUser;
    accessToken: string;
    refreshToken: string;
  }> {
    let payload;
    try {
      payload = verifyRefreshToken(incomingRefreshToken);
    } catch (_err) {
      throw new AppError('Invalid or expired refresh token.', 401);
    }

    const user = await this.userRepository['model']
      .findById(payload.userId)
      .select('+refreshTokens')
      .exec();

    if (!user) {
      throw new AppError('User belonging to this token no longer exists.', 401);
    }

    const tokenExists = (user.refreshTokens || []).includes(incomingRefreshToken);

    // Reuse detection: if token is not found in active refreshTokens, clear all tokens for security
    if (!tokenExists) {
      user.refreshTokens = [];
      await user.save();
      throw new AppError('Refresh token reuse detected or invalid token.', 401);
    }

    // Refresh Token Rotation: invalidate used token and issue new pair
    user.refreshTokens = user.refreshTokens.filter((token) => token !== incomingRefreshToken);

    const newAccessToken = generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });
    const newRefreshToken = generateRefreshToken({ userId: user._id.toString() });

    user.refreshTokens.push(newRefreshToken);
    await user.save();

    return {
      user: this.sanitizeUser(user),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  public async forgotPassword(email: string): Promise<{ resetToken: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Don't leak registered users
      return { resetToken: 'if-registered-token-sent' };
    }

    const resetToken = generateRandomToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    return { resetToken };
  }

  public async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository['model']
      .findOne({
        resetPasswordToken: token,
        resetPasswordTokenExpires: { $gt: new Date() },
      })
      .select('+resetPasswordToken +resetPasswordTokenExpires +password +refreshTokens')
      .exec();

    if (!user) {
      throw new AppError('Password reset token is invalid or has expired.', 400);
    }

    user.password = await hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    user.refreshTokens = []; // Revoke active sessions on password change
    await user.save();
  }

  public async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository['model']
      .findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: new Date() },
      })
      .select('+verificationToken +verificationTokenExpires')
      .exec();

    if (!user) {
      throw new AppError('Verification token is invalid or has expired.', 400);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
  }

  public async getCurrentUser(userId: string): Promise<SanitizedUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User profile not found.', 444);
    }
    return this.sanitizeUser(user);
  }
}
