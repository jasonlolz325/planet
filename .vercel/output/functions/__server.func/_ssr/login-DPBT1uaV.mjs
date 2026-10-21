import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn } from "./client-1vAx-gM_.mjs";
import { t as GROK_PROVIDERS } from "./server-C9TCTE_Z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-DPBT1uaV.js
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-bg p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm space-y-4 rounded-2xl border border-line bg-panel p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-3xl text-fg",
					children: "Hearth"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Sign in to join servers and talk in real time."
				}),
				GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => signIn(p.providerId, { callbackURL: "/" }),
					className: "w-full rounded-lg bg-accent px-4 py-3 font-medium text-accent-ink",
					children: ["Continue with ", p.label]
				}, p.providerId))
			]
		})
	});
}
//#endregion
export { Login as component };
