import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository.js';
import { SessionService } from './SessionService.js';
import { IUser } from '../models/User.js';
import { LeanUser } from '../types/lean.js';
import { config } from '../config/environment.js';
import { Log } from '../decorators/LoggingDecorator.js';

export class AuthService {
    private userRepo: UserRepository;
    private sessionService: SessionService;

    constructor() {
        this.userRepo = new UserRepository();
        this.sessionService = new SessionService();
    }

    @Log
    async register(data: {
        email: string;
        password: string;
        username: string;
        firstName?: string;
        lastName?: string;
    }): Promise<{ user: LeanUser; token: string }> {
        const existingUser = await this.userRepo.findByEmail(data.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const existingUsername = await this.userRepo.findByUsername(data.username);
        if (existingUsername) {
            throw new Error('Username is already taken');
        }

        const hashedPassword = await bcrypt.hash(data.password, config.bcryptRounds);

        const user = await this.userRepo.create({
            ...data,
            password: hashedPassword,
            preferences: {
                favoriteGenres: [],
                dislikedGenres: []
            }
        });

        const leanUser = {
            ...user.toObject(),
            _id: user._id
        } as LeanUser;

        const token = this.generateToken(leanUser);
        await this.createUserSession(token, leanUser);

        return { user: leanUser, token };
    }

    @Log
    async login(email: string, password: string): Promise<{ user: LeanUser; token: string }> {
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken(user);
        await this.createUserSession(token, user);

        return { user, token };
    }

    @Log
    async logout(token: string): Promise<void> {
        await this.sessionService.deleteSession(token);
    }

    @Log
    async validateToken(token: string): Promise<LeanUser | null> {
        try {
            const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
            const session = await this.sessionService.getSession(token);

            if (!session) {
                return null;
            }

            await this.sessionService.refreshSession(token);
            return await this.userRepo.findById(decoded.userId);
        } catch (error) {
            return null;
        }
    }

    private generateToken(user: LeanUser): string {
        return jwt.sign(
            { userId: user._id.toString() },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
        );
    }

    private async createUserSession(token: string, user: LeanUser): Promise<void> {
        await this.sessionService.createSession(token, {
            userId: user._id.toString(),
            email: user.email,
            username: user.username,
            createdAt: Date.now()
        });
    }
}