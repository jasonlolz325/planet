import { o as __toESM } from "../_runtime.mjs";
import { J as require_react, x as require_jsx_runtime, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-BVcyflV7.mjs";
import { i as signOut, t as authClient } from "./client-1vAx-gM_.mjs";
import { a as hasGateSessionMarker } from "./server-C9TCTE_Z.mjs";
import { n as Plus, r as Hash } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BLhtzpvc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	return useSessionUserState();
}
function useSessionUserState() {
	const { data, isPending } = authClient.useSession();
	const id = data?.user.id;
	const displayName = data?.user.name ?? null;
	const primaryEmail = data?.user.email ?? null;
	const profileImageUrl = data?.user.image ?? null;
	const user = (0, import_react.useMemo)(() => id ? {
		id,
		displayName,
		primaryEmail,
		profileImageUrl,
		isDevFallback: false
	} : null, [
		id,
		displayName,
		primaryEmail,
		profileImageUrl
	]);
	return (0, import_react.useMemo)(() => ({
		user,
		isPending
	}), [user, isPending]);
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var listSpaces = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	return { displayName: (input.displayName || "Member").slice(0, 40) };
}).handler(createSsrRpc("a275d2a2ca7bac930ed0395daae259813285192cff11ceddf53c9a85aa862db5"));
var createSpace = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	name: input.name.trim().slice(0, 32),
	displayName: (input.displayName || "Member").slice(0, 40)
})).handler(createSsrRpc("eec62aa7517520e9eccf1fb88680f024738de989576647654451484ad240a877"));
var joinSpace = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	spaceId: Number(input.spaceId),
	displayName: (input.displayName || "Member").slice(0, 40)
})).handler(createSsrRpc("451d1ff3483b04369f028fc26a39bd50683f6cd2475719fabf2034d93d9c8a66"));
var listChannels = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ spaceId: Number(input.spaceId) })).handler(createSsrRpc("877da657b39eaac1bf4c03c21b23d29b02a4650f453ed848a8a199355264ec92"));
var createChannel = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	spaceId: Number(input.spaceId),
	name: input.name.trim().toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 24)
})).handler(createSsrRpc("64eab9673dd107219aa3c67db63d28d882953f8294ee06593da5f76bfee1bef5"));
var listMessages = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ channelId: Number(input.channelId) })).handler(createSsrRpc("2b959b7bd43ddd43a51e1dd9cca95badc1092b76bd0f9c4baae4684fedba09b7"));
var sendMessage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	channelId: Number(input.channelId),
	body: input.body.trim().slice(0, 2e3),
	authorName: (input.authorName || "Member").slice(0, 40)
})).handler(createSsrRpc("4f34919086f2a4130097c5da5423c36b625cea14ed1b142c70bfe1b53f9fd398"));
function Home() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center text-muted",
		children: "Loading…"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chat, {
		userId: user.id,
		displayName: user.displayName || user.primaryEmail || "Member"
	});
}
function Chat({ userId, displayName }) {
	const [spaces, setSpaces] = (0, import_react.useState)([]);
	const [discover, setDiscover] = (0, import_react.useState)([]);
	const [spaceId, setSpaceId] = (0, import_react.useState)(null);
	const [channels, setChannels] = (0, import_react.useState)([]);
	const [channelId, setChannelId] = (0, import_react.useState)(null);
	const [messages, setMessages] = (0, import_react.useState)([]);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [spaceName, setSpaceName] = (0, import_react.useState)("");
	const [channelName, setChannelName] = (0, import_react.useState)("");
	const [showDiscover, setShowDiscover] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const scroller = (0, import_react.useRef)(null);
	const refreshSpaces = (0, import_react.useCallback)(async () => {
		const res = await listSpaces({ data: { displayName } });
		setSpaces(res.mine);
		setDiscover(res.discover);
		setSpaceId((cur) => cur ?? res.mine[0]?.id ?? null);
	}, [displayName]);
	(0, import_react.useEffect)(() => {
		refreshSpaces().catch((e) => setError(String(e)));
	}, [refreshSpaces]);
	(0, import_react.useEffect)(() => {
		if (!spaceId) return;
		listChannels({ data: { spaceId } }).then((rows) => {
			setChannels(rows);
			setChannelId((cur) => rows.some((c) => c.id === cur) ? cur : rows[0]?.id ?? null);
		}).catch((e) => setError(String(e)));
	}, [spaceId]);
	(0, import_react.useEffect)(() => {
		if (!channelId) return;
		let alive = true;
		const pull = () => {
			listMessages({ data: { channelId } }).then((rows) => {
				if (alive) setMessages(rows);
			}).catch(() => {});
		};
		pull();
		const t = setInterval(pull, 1500);
		return () => {
			alive = false;
			clearInterval(t);
		};
	}, [channelId]);
	(0, import_react.useEffect)(() => {
		scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
	}, [messages.length, channelId]);
	const space = spaces.find((s) => s.id === spaceId);
	const channel = channels.find((c) => c.id === channelId);
	async function onSend(e) {
		e.preventDefault();
		if (!channelId || !draft.trim()) return;
		const body = draft;
		setDraft("");
		try {
			await sendMessage({ data: {
				channelId,
				body,
				authorName: displayName
			} });
			const rows = await listMessages({ data: { channelId } });
			setMessages(rows);
		} catch (err) {
			setError(String(err));
			setDraft(body);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh overflow-hidden bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "flex w-16 shrink-0 flex-col items-center gap-2 bg-rail py-3",
				children: [
					spaces.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: s.name,
						onClick: () => setSpaceId(s.id),
						className: `grid h-11 w-11 place-items-center rounded-2xl text-sm font-semibold ${s.id === spaceId ? "bg-accent text-accent-ink" : "bg-raised text-fg"}`,
						children: s.name.slice(0, 1).toUpperCase()
					}, s.id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "New server",
						onClick: () => setShowDiscover(true),
						className: "grid h-11 w-11 place-items-center rounded-2xl bg-raised text-accent",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 18 })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-auto" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "hidden w-56 shrink-0 flex-col border-r border-line bg-panel md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
						className: "border-b border-line px-4 py-4 font-display text-xl",
						children: space?.name ?? "Servers"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1 space-y-1 overflow-y-auto p-2",
						children: channels.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setChannelId(c.id),
							className: `flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${c.id === channelId ? "bg-raised text-fg" : "text-muted"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, { size: 14 }), c.name]
						}, c.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
						className: "flex gap-2 border-t border-line p-3",
						onSubmit: (e) => {
							e.preventDefault();
							if (!spaceId || !channelName.trim()) return;
							createChannel({ data: {
								spaceId,
								name: channelName
							} }).then(async () => {
								setChannelName("");
								const rows = await listChannels({ data: { spaceId } });
								setChannels(rows);
								setChannelId(rows.at(-1)?.id ?? null);
							});
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: channelName,
							onChange: (e) => setChannelName(e.target.value),
							placeholder: "new channel",
							className: "min-w-0 flex-1 rounded-lg bg-raised px-3 py-2 text-sm outline-none"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex min-w-0 flex-1 flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "flex items-center gap-2 border-b border-line px-4 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, {
								size: 16,
								className: "text-muted"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: channel?.name ?? "channel"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ml-auto flex items-center gap-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ml-auto flex gap-1 overflow-x-auto md:hidden",
								children: channels.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setChannelId(c.id),
									className: `rounded-full px-3 py-1 text-sm ${c.id === channelId ? "bg-accent text-accent-ink" : "bg-raised"}`,
									children: c.name
								}, c.id))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						ref: scroller,
						className: "flex-1 space-y-3 overflow-y-auto px-4 py-4",
						children: [messages.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "No messages yet. Say hello."
						}), messages.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-raised text-sm font-semibold text-accent",
								children: m.authorName.slice(0, 1).toUpperCase()
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-baseline gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `text-sm font-semibold ${m.userId === userId ? "text-accent" : ""}`,
										children: m.authorName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
										className: "text-xs text-muted",
										children: m.createdAt.slice(11, 16)
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "whitespace-pre-wrap break-words text-sm leading-relaxed",
									children: m.body
								})]
							})]
						}, m.id))]
					}),
					error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-4 text-xs text-accent",
						children: error
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("form", {
						onSubmit: onSend,
						className: "border-t border-line p-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: draft,
							onChange: (e) => setDraft(e.target.value),
							placeholder: channel ? `Message #${channel.name}` : "Pick a channel",
							className: "w-full rounded-xl bg-raised px-4 py-3 outline-none"
						})
					})
				]
			}),
			showDiscover && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-20 grid place-items-center bg-black/60 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md space-y-4 rounded-2xl border border-line bg-panel p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Servers"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "flex gap-2",
							onSubmit: (e) => {
								e.preventDefault();
								createSpace({ data: {
									name: spaceName,
									displayName
								} }).then(async (r) => {
									setSpaceName("");
									await refreshSpaces();
									setSpaceId(r.id);
									setShowDiscover(false);
								});
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: spaceName,
								onChange: (e) => setSpaceName(e.target.value),
								placeholder: "New server name",
								className: "min-w-0 flex-1 rounded-lg bg-raised px-3 py-2 outline-none"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								className: "rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-ink",
								children: "Create"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "space-y-2",
							children: [discover.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between rounded-lg bg-raised px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: d.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-sm text-accent",
									onClick: () => {
										joinSpace({ data: {
											spaceId: d.id,
											displayName
										} }).then(async () => {
											await refreshSpaces();
											setSpaceId(d.id);
											setShowDiscover(false);
										});
									},
									children: "Join"
								})]
							}, d.id)), discover.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "text-sm text-muted",
								children: "You are in every public server."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "text-sm text-muted",
							onClick: () => setShowDiscover(false),
							children: "Close"
						})
					]
				})
			})
		]
	});
}
//#endregion
export { Home as component };
