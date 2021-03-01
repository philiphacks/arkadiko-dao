'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-ae0ba824.js');

const CloseIcon = ({ onClick }) => (index.h("svg", { width: 16, height: 16, viewBox: "0 0 16 16", onClick: onClick },
    index.h("path", { fill: "#C1C3CC", d: "M4.817 3.403a1 1 0 00-1.414 1.414L6.586 8l-3.183 3.183a1 1 0 001.414 1.415L8 9.415l3.183 3.183a1 1 0 101.415-1.415L9.415 8l3.183-3.183a1.002 1.002 0 00-.325-1.631 1 1 0 00-1.09.217L8 6.586 4.817 3.403z" })));

const isChrome = () => {
    const isChromium = !!window['chrome'];
    const winNav = window.navigator;
    const vendorName = winNav.vendor;
    const isOpera = typeof window.opr !== 'undefined';
    const isIEedge = winNav.userAgent.includes('Edge');
    const isIOSChrome = /CriOS/.exec(winNav.userAgent);
    if (isIOSChrome) {
        return false;
    }
    else if (isChromium !== null &&
        typeof isChromium !== 'undefined' &&
        vendorName === 'Google Inc.' &&
        isOpera === false &&
        isIEedge === false) {
        return true;
    }
    else {
        return false;
    }
};
const getBrowser = () => {
    if (isChrome()) {
        return 'Chrome';
    }
    else if (window.navigator.userAgent.includes('Firefox')) {
        return 'Firefox';
    }
    return null;
};

const StacksIcon = () => {
    return (index.h("svg", { width: "32", height: "32", viewBox: "0 0 32 32", fill: "none", xmlns: "http://www.w3.org/2000/svg" },
        index.h("circle", { cx: "16", cy: "16", r: "16", fill: "#111215" }),
        index.h("path", { d: "M18.3426 18.1411L20.8917 22H18.9874L15.995 17.466L13.0025 22H11.1083L13.6574 18.1511H10V16.6902H22V18.1411H18.3426Z", fill: "white" }),
        index.h("path", { d: "M22 13.8086V15.2695V15.2796H10V13.8086H13.5869L11.068 10H12.9723L15.995 14.5945L19.0277 10H20.932L18.4131 13.8086H22Z", fill: "white" })));
};
/**
 * <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="16" cy="16" r="16" fill="#111215"/>
<path d="M18.3426 18.1411L20.8917 22H18.9874L15.995 17.466L13.0025 22H11.1083L13.6574 18.1511H10V16.6902H22V18.1411H18.3426Z" fill="white"/>
<path d="M22 13.8086V15.2695V15.2796H10V13.8086H13.5869L11.068 10H12.9723L15.995 14.5945L19.0277 10H20.932L18.4131 13.8086H22Z" fill="white"/>
</svg>

 */

const modalCss = ":host{all:initial}.modal-container{display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;background-color:rgba(0, 0, 0, 0.48);width:100%;height:100%;position:fixed;top:0px;left:0px;-ms-flex-pack:center;justify-content:center;font-family:\"Inter\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Helvetica, Arial, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\";z-index:8999}.modal-body{width:512px;max-width:100%;max-height:calc(100% - 48px);background:white;-ms-flex-direction:column;flex-direction:column;display:-ms-flexbox;display:flex;margin-left:auto;margin-right:auto;border-radius:6px}.modal-body .pxl{padding-left:64px;padding-right:64px}.modal-body div{-webkit-box-sizing:border-box;box-sizing:border-box}.pxl{padding-left:64px;padding-right:64px}.modal-top{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;padding:16px}.modal-top svg{cursor:pointer}.modal-content{overflow-y:auto}.modal-header{font-size:44px;font-weight:900;line-height:48px;padding:10px 32px;display:block;text-align:center}.intro-subtitle{font-size:18px;font-weight:400;line-height:32px;margin:10px 0;color:#424248;text-align:center}.divider{margin:8px 0;-webkit-box-sizing:border-box;box-sizing:border-box;width:100%;height:1px;background:#E5E5EC}.intro-entry{display:-ms-flexbox;display:flex;width:100%;-ms-flex-align:center;align-items:center;padding:20px 32px;-webkit-box-sizing:border-box;box-sizing:border-box}.intro-entry-icon{-ms-flex-item-align:stretch;align-self:stretch;margin-top:4px;margin-right:16px}.intro-entry-copy{display:inline;font-size:14px;line-height:20px;color:#222933;white-space:unset}.button-container{padding:10px 24px;width:100%;-webkit-box-sizing:border-box;box-sizing:border-box}.button{width:100%;max-width:344px;margin:0px auto;-webkit-box-sizing:border-box;box-sizing:border-box;border-radius:6px;display:block;line-height:1.333;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;background-color:#3700ff;color:#ffffff;min-height:48px;min-width:126px;font-size:14px !important;padding-left:20px;padding-right:20px;-webkit-appearance:none;-moz-appearance:none;appearance:none;-webkit-transition:all 250ms;transition:all 250ms;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;white-space:nowrap;outline:none;border:none;cursor:pointer}.button span{-ms-flex-align:center;align-items:center;-webkit-box-pack:center;font-weight:500;line-height:1.333;color:#ffffff;font-size:14px !important;white-space:nowrap}.modal-footer{margin-top:10px;padding:24px 0;background-color:#F7F7FA;text-align:center;border-radius:0 0 6px 6px}.modal-footer .link{color:#747478;font-size:14px}.link{color:#3700ff;margin-right:16px;font-weight:500;display:inline;font-size:12px;line-height:1.333;-webkit-letter-spacing:0em;-moz-letter-spacing:0em;-ms-letter-spacing:0em;letter-spacing:0em;white-space:unset;cursor:pointer;text-decoration:none}.link:hover{text-decoration:underline}.link-l{font-size:14px}.hero-icon{width:100%}.hero-icon svg{margin:20px auto;width:64px;height:64px;display:block}.how-it-works{padding:24px;border-top:1px solid #e5e5ec;width:100%}.how-it-works .modal-header{padding-left:0;padding-right:0;padding-top:3px;padding-bottom:10px;line-height:24px;font-size:24px;text-align:left}.label{display:block;width:100%;line-height:20px;font-size:11px;text-transform:uppercase;color:#677282}.hiw-content{display:block;margin-top:8px;font-size:14px;line-height:20px}.hiw-content .link{margin:0}.hiw-question{display:block;margin-top:32px;font-size:14px;line-height:20px;font-weight:500}.powered-by-container{width:100%;padding:24px;text-align:center}.powered-by-container .powered-by{color:#677282;font-size:12px;text-decoration:none}.powered-by-container .powered-by:hover{text-decoration:underline;cursor:pointer}.powered-by-container .powered-by svg{position:relative;top:2px;display:inline-block;margin:0 4px}";

const Modal = class {
    constructor(hostRef) {
        index.registerInstance(this, hostRef);
        this.onSignUp = index.createEvent(this, "onSignUp", 7);
        this.onSignIn = index.createEvent(this, "onSignIn", 7);
        this.onCloseModal = index.createEvent(this, "onCloseModal", 7);
    }
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
        return (index.h("div", { class: "modal-container", onClick: handleContainerClick }, index.h("div", { class: "modal-body" }, index.h("div", { class: "modal-top" }, index.h(CloseIcon, { onClick: () => this.onCloseModal.emit() })), index.h("div", { class: "modal-content" }, index.h("div", null, index.h("div", { class: "hero-icon" }, index.h(StacksIcon, null)), index.h("span", { class: "modal-header pxl" }, "Use ", this.authOptions.appDetails.name, " with Stacks"), index.h("div", { class: "intro-subtitle pxl" }, "Stacks Wallet gives you control over your digital assets and data in apps like", ' ', this.authOptions.appDetails.name, ".", browser ? ` Add it to ${browser} to continue.` : ''), this.openedInstall ? (index.h("div", { class: "intro-subtitle pxl" }, "After installing Stacks Wallet, reload this page and sign in.")) : (index.h("div", { class: "button-container" }, index.h("button", { class: "button", onClick: () => {
                window.open('https://www.hiro.so/wallet/install-web', '_blank');
                this.openedInstall = true;
            } }, index.h("span", null, "Install Stacks Wallet")))), index.h("div", { class: "modal-footer" }, index.h("span", { class: "link", onClick: () => window.open('https://www.hiro.so/questions/how-does-stacks-work', '_blank') }, "How it works")))))));
    }
    static get assetsDirs() { return ["screens", "assets"]; }
};
Modal.style = modalCss;

exports.connect_modal = Modal;
