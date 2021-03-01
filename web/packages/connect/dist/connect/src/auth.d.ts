import { UserSession } from '@stacks/auth';
import type { AuthOptions } from './types/auth';
export declare const defaultAuthURL = "https://app.blockstack.org";
export declare const isMobile: () => boolean;
/**
 * mobile should not use a 'popup' type of window.
 */
export declare const shouldUsePopup: () => boolean;
export declare const getOrCreateUserSession: (userSession?: UserSession | undefined) => UserSession;
export declare const authenticate: (authOptions: AuthOptions) => void;
export declare function authenticateWithExtensionUrl({ extensionUrl, authOptions, }: {
    extensionUrl: string;
    authOptions: AuthOptions;
}): void;
export declare const getUserData: (userSession?: UserSession | undefined) => Promise<import("@stacks/auth").UserData | null>;
