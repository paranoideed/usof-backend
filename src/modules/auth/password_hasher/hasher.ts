import bcrypt from "bcrypt";

export class PasswordHasher {
    async hashPassword(password: string): Promise<string> {
        const saltRounds = 12;
        return bcrypt.hash(password, saltRounds);
    }

    async verifyPassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}

const passwordHasher = new PasswordHasher();
export default passwordHasher;