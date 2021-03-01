import { EventEmitter } from '../../stencil-public-runtime';
import type { AuthOptions } from '@stacks/connect/types/auth';
export declare class Modal {
    authOptions: AuthOptions;
    onSignUp: EventEmitter;
    onSignIn: EventEmitter;
    onCloseModal: EventEmitter;
    openedInstall: boolean;
    handleOpenedInstall(): void;
    render(): any;
}
