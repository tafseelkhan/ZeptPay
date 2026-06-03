// services/authService.ts
import { verifyToken } from '../../../api/tests/features/private/splashAnimePrivateSlice';
import {
  setToken,
  getToken,
  removeToken,
} from '../../../api/tests/connections/token/tokenSlice';

export interface UserData {
  isDeveloper: boolean;
  [key: string]: any;
}

export class AuthService {
  // Sirf token ke saath kaam karo
  static async getToken(): Promise<string | null> {
    return await getToken();
  }

  static async saveToken(token: string): Promise<void> {
    await setToken(token);
  }

  static async clearAuthData(): Promise<void> {
    await removeToken();
    // userData remove karne ki zaroorat nahi, save hi nahi kar rahe
  }

  // Ab yeh function token leta hai parameter mein
  static async verifyAndGetUserType(): Promise<{
    isValid: boolean;
    isDeveloper: boolean;
    userData?: UserData;
  }> {
    try {
      // API call with token
      const result = await verifyToken(); // verifyToken ko token pass karo

      if (result && result.success && result.user) {
        // Seedha result.user se isDeveloper le lo
        const isDeveloper = result.user.isDeveloper === true;

        return {
          isValid: true,
          isDeveloper,
          userData: result.user, // Fresh data from API
        };
      }

      return {
        isValid: false,
        isDeveloper: false,
      };
    } catch (error) {
      return {
        isValid: false,
        isDeveloper: false,
      };
    }
  }
}
