import { Component, h, Prop, Event, State } from '@stencil/core';
import { CloseIcon } from './assets/close-icon';
import { getBrowser } from './extension-util';
import { StacksIcon } from './assets/stacks-icon';
export class Modal {
    handleOpenedInstall() {
        this.openedInstall = true;
    }
    render() {
        const browser = getBrowser();
        const handleContainerClick = (event) => {
            var _a;
            const target = event.target;
            if (((_a = target.className) === null || _a === void 0 ? void 0 : _a.includes) && target.className.includes('modal-container')) {
                this.onCloseModal.emit();
            }
        };
        return (h("div", { class: "modal-container", onClick: handleContainerClick },
            h("div", { class: "modal-body" },
                h("div", { class: "modal-top" },
                    h(CloseIcon, { onClick: () => this.onCloseModal.emit() })),
                h("div", { class: "modal-content" },
                    h("div", null,
                        h("div", { class: "hero-icon" },
                            h(StacksIcon, null)),
                        h("span", { class: "modal-header pxl" },
                            "Use ",
                            this.authOptions.appDetails.name,
                            " with Stacks"),
                        h("div", { class: "intro-subtitle pxl" },
                            "Stacks Wallet gives you control over your digital assets and data in apps like",
                            ' ',
                            this.authOptions.appDetails.name,
                            ".",
                            browser ? ` Add it to ${browser} to continue.` : ''),
                        this.openedInstall ? (h("div", { class: "intro-subtitle pxl" }, "After installing Stacks Wallet, reload this page and sign in.")) : (h("div", { class: "button-container" },
                            h("button", { class: "button", onClick: () => {
                                    window.open('https://www.hiro.so/wallet/install-web', '_blank');
                                    this.openedInstall = true;
                                } },
                                h("span", null, "Install Stacks Wallet")))),
                        h("div", { class: "modal-footer" },
                            h("span", { class: "link", onClick: () => window.open('https://www.hiro.so/questions/how-does-stacks-work', '_blank') }, "How it works")))))));
    }
    static get is() { return "connect-modal"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["modal.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["modal.css"]
    }; }
    static get assetsDirs() { return ["screens", "assets"]; }
    static get properties() { return {
        "authOptions": {
            "type": "unknown",
            "mutable": false,
            "complexType": {
                "original": "AuthOptions",
                "resolved": "AuthOptions",
                "references": {
                    "AuthOptions": {
                        "location": "import",
                        "path": "@stacks/connect/types/auth"
                    }
                }
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            }
        }
    }; }
    static get states() { return {
        "openedInstall": {}
    }; }
    static get events() { return [{
            "method": "onSignUp",
            "name": "onSignUp",
            "bubbles": true,
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [],
                "text": ""
            },
            "complexType": {
                "original": "any",
                "resolved": "any",
                "references": {}
            }
        }, {
            "method": "onSignIn",
            "name": "onSignIn",
            "bubbles": true,
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [],
                "text": ""
            },
            "complexType": {
                "original": "any",
                "resolved": "any",
                "references": {}
            }
        }, {
            "method": "onCloseModal",
            "name": "onCloseModal",
            "bubbles": true,
            "cancelable": true,
            "composed": true,
            "docs": {
                "tags": [],
                "text": ""
            },
            "complexType": {
                "original": "any",
                "resolved": "any",
                "references": {}
            }
        }]; }
}
