// .mx/store/registry.npmjs.org/fiberfx/hyperscript@v4.0.0/dist/mhs.mjs
const t = {};
const n$1 = [];
const e$1 = /^m(i|n|o|s|text|space)$/;
const o$2 = Array.isArray;
const i$2 = n$1.slice;
const r$1 = Object.assign;

function l$1(t) {
    t && t.parentNode && t.remove();
}

const u$1 = {
    __e: function (t, n, e, o) {
        let i, r, l;
        for (; n = n.__;) if ((i = n.__c) && !(1 & i.__g)) {
            i.__g |= 4;
            try {
                if (r = i.constructor, (l = r && r.getDerivedStateFromError) && i.setState(r.getDerivedStateFromError(t)), i.componentDidCatch && (i.componentDidCatch(t, o || {}), l = 1), l && 8 & i.__g) return void (i.__g |= 2);
            } catch (n) {
                t = n;
            }
        }
        throw O$2 = 0, t;
    }
};
let f$3 = 0;

function a$1(t, n, e, o, i) {
    const r = {
        type: t,
        props: n,
        key: e,
        ref: o,
        __k: null,
        __: null,
        __b: 0,
        __e: null,
        __c: null,
        constructor: void 0,
        __v: i || ++f$3,
        __i: -1,
        __u: 0
    };
    return !i && u$1.vnode && u$1.vnode(r), r;
}

function p$2(t) {
    return t.children;
}

const y$2 = /* @__PURE__ */ new Set([
    "animation-iteration-count",
    "aspect-ratio",
    "border-image-outset",
    "border-image-slice",
    "border-image-width",
    "box-flex",
    "box-flex-group",
    "box-ordinal-group",
    "column-count",
    "columns",
    "fill-opacity",
    "flex",
    "flex-grow",
    "flex-negative",
    "flex-order",
    "flex-positive",
    "flex-shrink",
    "flood-opacity",
    "font-weight",
    "grid-area",
    "grid-column",
    "grid-column-end",
    "grid-column-span",
    "grid-column-start",
    "grid-row",
    "grid-row-end",
    "grid-row-span",
    "grid-row-start",
    "line-clamp",
    "line-height",
    "opacity",
    "order",
    "orphans",
    "scale",
    "stop-opacity",
    "stroke-dasharray",
    "stroke-dashoffset",
    "stroke-miterlimit",
    "stroke-opacity",
    "stroke-width",
    "tab-size",
    "widows",
    "z-index",
    "zoom"
]);
const w$1 = /[A-Z]/g;
const g$1 = {};

function m$2(t) {
    return "-" == t[0] ? t : g$1[t] || (g$1[t] = t.replace(w$1, "-$&").toLowerCase());
}

function x$1(t, n) {
    return "number" != typeof n || t.startsWith("--") || y$2.has(t) ? n : n + "px";
}

let v$2 = Symbol();

function k$1(t, n, e) {
    e = null == e ? "" : x$1(m$2(n), e), "-" == n[0] ? t.setProperty(n, e) : t[n] = e;
}

const b$2 = /(PointerCapture)$|Capture$/i;
let _$2 = 0;

function M$1(t, n, e, o, i) {
    let r;
    if ("style" == n) if ("string" == typeof e) t.style.cssText = e;
    else {
        if ("string" == typeof o && (t.style.cssText = o = ""), o) for (n in o) e && n in e || k$1(t.style, n);
        if (e) for (n in e) o && e[n] == o[n] || k$1(t.style, n, e[n]);
    }
    else if ("o" == n[0] && "n" == n[1]) {
        if ((t.__e || (t.__e = {}))[n] = e, !e || !o) {
            const o = j$1[n] || (j$1[n] = $(n));
            (t.__a || (t.__a = {}))[n] = _$2, r = n != (n = n.replace(b$2, "$1")), (n = n.slice(2))[0] < "a" && (n = n.toLowerCase()), e ? t.addEventListener(n, o, r) : t.removeEventListener(n, o, r);
        }
    } else {
        if ("http://www.w3.org/2000/svg" == i) n = n.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
        else if ("width" != n && "height" != n && "href" != n && "list" != n && "form" != n && "tabIndex" != n && "download" != n && "rowSpan" != n && "colSpan" != n && "role" != n && "popover" != n && n in t) try {
            t[n] = e ?? "";
            return;
        } catch (t) {
        }
        if ("function" == typeof e) return;
        null == e || !1 === e && "-" != n[4] ? t.removeAttribute(n) : t.setAttribute(n, "popover" == n && 1 == e ? "" : e);
    }
}

function $(t) {
    return function (n) {
        let e = this.__e;
        if (e) {
            if (e = e[t], null == n[v$2]) n[v$2] = _$2++;
            else if (n[v$2] < this.__a[t]) return;
            const o = e(u$1.event ? u$1.event(n) : n);
            return !this.__C || "input" != n.type && "change" != n.type || n.isComposing || (D$1.indexOf(this) < 0 && D$1.push(this), O$2++ && I$1 == u$1.debounceRendering || (I$1 = u$1.debounceRendering, (I$1 || queueMicrotask)(N$1))), o;
        }
    };
}

function S$2(t) {
    let n, e, o, i, r = t.__C;
    if (r && (n = r.value, null != n && (t.value != n || 0 === n && "" === t.value) && (e = t.selectionEnd, o = t.value.length, t.value = n, null != e && (e += t.value.length - o, e < 0 && (e = 0), t.setSelectionRange(e, e))), C$2(t), "radio" == t.type && t.name)) for (i of t.getRootNode().querySelectorAll("input[type=radio]")) i != t && i.name == t.name && i.form == t.form && C$2(i);
}

function C$2(t) {
    const n = t.__C && t.__C.checked;
    null != n && !n != !t.checked && (t.checked = !!n);
}

const j$1 = {};

function L$1(t, n) {
    this.props = t, this.context = n, this.__g = 0;
}

function q$1(t, n) {
    if (null == n) return t.__ && q$1(t.__, t.__i + 1);
    let e;
    for (; n < t.__k.length; n++) if (e = t.__k[n], e && e.__e) return e.__e;
    return "function" != typeof t.type || t.props.__P ? null : q$1(t);
}

function z$2(t) {
    const n = t.__v, e = n.__e, o = [], i = [], l = t.__P;
    if (l) {
        const f = r$1({constructor: void 0}, n);
        f.__v = n.__v + 1, u$1.vnode && u$1.vnode(f), G$2(l, f, n, t.__n, l.namespaceURI, 32 & n.__u ? [e] : null, o, e || q$1(n), 32 & n.__u, i), f.__v = n.__v, f.__.__k[f.__i] = f, Q(o, f, i), n.__ = n.__e = null, f.__e != e && A$1(f);
    }
}

function A$1(t) {
    if ((t = t.__) && t.__c && !t.props.__P) return t.__e = null, t.__k.some((n) => n && (t.__e = n.__e)), A$1(t);
}

L$1.prototype.setState = function (t, n) {
    let e = this.__s;
    e && e != this.state || (e = this.__s = r$1({}, this.state)), "function" == typeof t && (t = t(r$1({}, e), this.props)), t && (r$1(e, t), this.__v && (n && this.__k.push(n), T$1(this)));
}, L$1.prototype.forceUpdate = function (t) {
    this.__v && (this.__g |= 4, t && this.__h.push(t), T$1(this));
}, L$1.prototype.render = p$2;
const H$2 = [];
let I$1;
let O$2 = 0;

function T$1(t) {
    (8 & t.__g || (t.__g |= 8, H$2.push(t), O$2++)) && I$1 == u$1.debounceRendering || (I$1 = u$1.debounceRendering, (I$1 || queueMicrotask)(N$1));
}

const D$1 = [];
const E$1 = (t, n) => t.__v.__b - n.__v.__b;

function N$1() {
    try {
        let t, n = 1;
        for (; H$2.length;) H$2.length > n && H$2.sort(E$1), t = H$2.shift(), n = H$2.length, 8 & t.__g && z$2(t);
        for (; D$1.length;) S$2(D$1.shift());
    } finally {
        (O$2 = H$2.length) && (I$1 || queueMicrotask)(N$1);
    }
}

function P$2(e, o, i, r, l, u, f, c, s, a, h) {
    let p, d, y, w, g, m = r.__k || n$1, x = o.length;
    for (s = V$1(i, o, m, s, x), p = 0; p < x; p++) {
        if (y = i.__k[p], null == y) continue;
        d = ~y.__i && m[y.__i] || t, y.__i = p;
        let n = G$2(e, y, d, l, u, f, c, s, a, h);
        w = y.__e, (d.ref != y.ref || 8 & d.__u) && (d.ref && U$1(d.ref, null, y, d), y.ref && h.push(y.ref, y.__c || w, y)), g = g || w, 4 & y.__u ? (s = Z(y, s, e, !d.__v), d.__e && (d.__e = null)) : "function" == typeof y.type && void 0 !== n ? s = n : w && (s = w.nextSibling), y.__u &= -21;
    }
    return i.__e = g, s;
}

function V$1(t, n, e, i, r) {
    let l, u, f, c = e.length, s = c, h = 0, d = 0, y = t.__k = Array(r);
    for (l = 0; l < r; l++) {
        if (u = n[l], null == u || "boolean" == typeof u || "function" == typeof u) {
            y[l] = null;
            continue;
        }
        "object" != typeof u || u.constructor == String ? u = y[l] = a$1(null, u) : o$2(u) ? u = y[l] = a$1(p$2, {children: u}) : void 0 === u.constructor && u.__b ? u = y[l] = a$1(u.type, u.props, u.key, u.ref, u.__v) : y[l] = u;
        const i = l + h;
        u.__ = t, u.__b = t.__b + 1;
        const w = u.__i = F$1(u, e, i, s);
        f = null, ~w && (f = e[w], s--, f && (f.__u |= 2)), f && f.__v ? (u.__u |= 16, w == i - 1 ? h-- : w == i + 1 ? h++ : w != i && (w > i ? h-- : h++, d = 1)) : (~w || (r > c ? h-- : r < c && h++), "function" != typeof u.type && (u.__u |= 4));
    }
    if (d) {
        let t = [], n = [];
        for (l = 0; l < r; l++) if (u = y[l], u && 16 & u.__u) {
            h = 0;
            let e = t.length;
            for (; h < e;) {
                const n = h + e >> 1;
                t[n] < u.__i ? h = n + 1 : e = n;
            }
            t[h] = u.__i, n[l] = h + 1;
        }
        for (h = t.length; l--;) n[l] && (n[l] == h ? h-- : y[l].__u |= 4);
    }
    if (s) for (l = 0; l < c; l++) f = e[l], !f || 2 & f.__u || (f.__e == i && (i = q$1(f)), W$1(f, f));
    return i;
}

function Z(t, n, e, o) {
    if ("function" == typeof t.type) {
        if (t.props.__P) return n;
        let o = t.__k;
        if (o) for (let i = 0; i < o.length; i++) o[i] && (o[i].__ = t, n = Z(o[i], n, e, !1));
        return n;
    }
    {
        n && !n.parentNode && (n = q$1(t)) && !n.parentNode && (n = null);
        let i = t.__e, r = n;
        for (; r && 8 == r.nodeType;) r = r.nextSibling;
        i != r && (!o && e.moveBefore && i.parentNode ? e.moveBefore(i, n) : e.insertBefore(i, n || null)), n = i;
    }
    for (; (n = n && n.nextSibling) && 8 == n.nodeType && !n.data.startsWith("$s");) ;
    return n;
}

function F$1(t, n, e, o) {
    const i = t.key, r = t.type;
    let l = n[e];
    const u = l && !(2 & l.__u);
    if (null === l && null == i || u && i == l.key && r == l.type) return e;
    if (o > (u ? 1 : 0)) {
        let t;
        for (t = e - 1; t >= 0; t--) if (l = n[t], l && !(2 & l.__u) && i == l.key && r == l.type) return t;
        for (t = e + 1; t < n.length; t++) if (l = n[t], l && !(2 & l.__u) && i == l.key && r == l.type) return t;
    }
    return -1;
}

function G$2(t, e, i, f, c, s, a, h, d, y) {
    let w, g, m = e.type;
    if (void 0 !== e.constructor) return null;
    128 & i.__u && (d = 32 & i.__u, w = i.__c.__z) && (e.__u |= d, g = s = [], 8 == w.nodeType ? h = J$1(w, s) : s.push(w), h = s[0] || h), (w = u$1.__b) && w(e);
    t: if ("function" == typeof m) {
        let x = a.length;
        try {
            let x, v, k, b, _ = e.props;
            const M = (w = m.prototype) && w.render;
            w = m.contextType;
            const $ = w && f[w.__c], S = w ? $ ? $.props.value : w.__ : f;
            if ((x = i.__c) ? (e.__c = x, 2 & x.__g && (x.__g |= 1)) : (M ? e.__c = x = new m(_, S) : (e.__c = x = new L$1(_, S), x.constructor = m, x.render = X), $ && $.sub(x), x.state || (x.state = {}), x.__n = f, x.__g |= 8, x.__h = [], x.__k = []), M && (x.__s || (x.__s = x.state), m.getDerivedStateFromProps && (x.__s == x.state && (x.__s = r$1({}, x.__s)), r$1(x.__s, m.getDerivedStateFromProps(_, x.__s)))), v = x.props, k = x.state, x.__v = e, i.__c) {
                if (_ !== v && M && !m.getDerivedStateFromProps && x.componentWillReceiveProps && x.componentWillReceiveProps(_, S), e.__v == i.__v && !(8 & x.__g) || !(4 & x.__g) && x.shouldComponentUpdate && !1 === x.shouldComponentUpdate(_, x.__s, S)) {
                    e.__v != i.__v && (x.props = _, x.state = x.__s, x.__g &= -9), e.__e = i.__e, e.__k = i.__k, e.__k.some((t) => {
                        t && (t.__ = e);
                    }), n$1.push.apply(x.__h, x.__k), x.__k = [], x.__h.length && a.push(x), h = q$1(i);
                    break t;
                }
                x.componentWillUpdate && x.componentWillUpdate(_, x.__s, S), M && x.componentDidUpdate && x.__h.push(() => {
                    x.componentDidUpdate(v, k, b);
                });
            } else M && !m.getDerivedStateFromProps && x.componentWillMount && x.componentWillMount(), M && x.componentDidMount && x.__h.push(x.componentDidMount);
            x.context = S, x.props = _, x.__P = t, x.__g &= -5;
            let C = u$1.__r, j = 0;
            if (M) x.state = x.__s, x.__g &= -9, C && C(e), w = x.render(x.props, x.state, x.context), n$1.push.apply(x.__h, x.__k), x.__k = [];
            else do
                x.__g &= -9, C && C(e), w = x.render(x.props, x.state, x.context), x.state = x.__s;
            while (8 & x.__g && ++j < 25);
            x.state = x.__s, x.getChildContext && (f = r$1({}, f, x.getChildContext())), M && i.__c && x.getSnapshotBeforeUpdate && (b = x.getSnapshotBeforeUpdate(v, k));
            const z = w && w.type === p$2 && null == w.key ? w.props.children : w;
            _.__P && (w = h, c = (t = _.__P).namespaceURI, d = s = null, i.props && i.props.__P != t && (i.__k.some((t) => {
                t && W$1(t, t);
            }), i.__k = null), h = i.__k ? q$1(i, 0) : null), h = P$2(t, o$2(z) ? z : [z], e, i, f, c, s, a, h, d, y), _.__P && (e.__e = null, h = w), e.__u &= -161, g && g.some(l$1), x.__h.length && a.push(x), 1 & x.__g && (x.__g &= -4);
        } catch (t) {
            if (a.length = x, e.__v = null, d || s) if (t.then) {
                let t, n = 0;
                if (e.__u |= 128 | d, s) {
                    let e, o = s.indexOf(h || void 0);
                    for (~o || (o = s.length); (e = s[o - 1]) && 8 == e.nodeType;) o--;
                    for (; o < s.length; o++) if (e = s[o], e) {
                        if (s[o] = null, 8 == e.nodeType) {
                            if (e.data.startsWith("$s")) n++ || (t = e);
                            else if (n && e.data.startsWith("/$s") && !--n) break;
                        } else if (!n) break;
                    }
                }
                if (!t) {
                    for (; h && 8 == h.nodeType && h.nextSibling;) h = h.nextSibling;
                    t = h;
                }
                t = e.__c.__z || (e.__c.__z = t), (w = J$1(t)) ? (e.__e = t, h = w) : e.__e = h, h = h && h.nextSibling;
            } else s && s.some(l$1);
            else e.__e = i.__e;
            e.__k || (e.__k = i.__k || []), t.then || K(e), u$1.__e(t, e, i);
        }
    } else h = e.__e = R$1(i.__e, e, i, f, c, s, a, d, y, t);
    return (w = u$1.diffed) && w(e), h;
}

function J$1(t, n) {
    if (t && 8 == t.nodeType && t.data.startsWith("$s")) for (let e = 1; t = t.nextSibling;) {
        if (8 == t.nodeType) {
            if (t.data.startsWith("$s")) e++;
            else if (t.data.startsWith("/$s") && !--e) return t;
        }
        n && n.push(t);
    }
}

function K(t) {
    t && (t.__c && (t.__c.__g |= 4), t.__k && t.__k.some(K));
}

function Q(t, n, e) {
    for (let t = 0; t < e.length;) U$1(e[t++], e[t++], e[t++]);
    u$1.__c && u$1.__c(n, t), t.some((n) => {
        try {
            t = n.__h, n.__h = [], t.some((t) => {
                t.call(n);
            });
        } catch (t) {
            u$1.__e(t, n.__v);
        }
    });
}

function R$1(n, r, f, c, s, a, h, p, d, y) {
    let w = f.props || t;
    const g = r.props, m = r.type;
    let x, v, k, b, _, $, S;
    if ("svg" == m ? s = "http://www.w3.org/2000/svg" : "math" == m ? s = "http://www.w3.org/1998/Math/MathML" : s || (s = "http://www.w3.org/1999/xhtml"), a) {
        for (x = 0; x < a.length; x++) if (_ = a[x], _ && (m ? _.localName == m : 3 == _.nodeType)) {
            n = _, a[x] = null;
            break;
        }
    }
    if (!n) {
        const t = y.ownerDocument || document;
        if (!m) return t.createTextNode(g);
        n = t.createElementNS(s, m, g.is && g), p && (u$1.__m && u$1.__m(r, a), p = !1), a = null;
    }
    if (m) {
        if (y = "template" == m ? n.content : n, a = "textarea" == m && null != g.defaultValue ? null : a && i$2.call(y.childNodes), !p && a) for (w = {}, x = 0; x < n.attributes.length; x++) _ = n.attributes[x], w[_.name] = _.value;
        for (x in w) _ = w[x], "dangerouslySetInnerHTML" == x ? k = _ : "children" == x || x in g || "value" == x && "defaultValue" in g || "checked" == x && "defaultChecked" in g || M$1(n, x, null, _, s);
        const t = 1 & f.__u;
        for (x in g) _ = g[x], "children" == x ? b = _ : "dangerouslySetInnerHTML" == x ? v = _ : "value" == x ? $ = _ : "checked" == x ? S = _ : p && "function" != typeof _ || !(w[x] !== _ || t && null != _) || M$1(n, x, _, w[x], s);
        v ? (p || k && (v.__html == k.__html || v.__html == n.innerHTML) || (n.innerHTML = v.__html), r.__k = []) : (k && (n.textContent = ""), ("foreignObject" == m || "http://www.w3.org/1998/Math/MathML" == s && e$1.test(m)) && (s = "http://www.w3.org/1999/xhtml"), P$2(y, o$2(b) ? b : [b], r, f, c, s, a, h, a ? a[0] : f.__k && q$1(f, 0), p, d), a && a.some(l$1)), p && "textarea" != m || (x = "value", "progress" == m && null == $ ? n.removeAttribute(x) : null == $ || $ === n[x] && ("progress" != m || $) || M$1(n, x, $, w[x], s), x = "checked", null != S && S != n[x] && M$1(n, x, S, w[x], s)), "input" != m && "textarea" != m && "select" != m || (n.__C = null != $ || null != S ? g : void 0);
    } else w === g || p && n.data == g || (n.data = g);
    return n;
}

function U$1(t, n, e, o) {
    try {
        "function" == typeof t ? n ? n.__x = t(n) || 1 : o && (o = o.__c || o.__e) && (n = o.__x) && (o.__x = null, "function" == typeof n ? n() : t(null)) : t.current = n;
    } catch (t) {
        u$1.__e(t, e);
    }
}

function W$1(t, n, e) {
    let o, i, r;
    if (u$1.unmount && u$1.unmount(t), !(o = t.ref) || o.current && o.current != t.__e || U$1(o, null, n, t), o = t.__c) {
        if (o.componentWillUnmount) try {
            o.componentWillUnmount();
        } catch (t) {
            u$1.__e(t, n);
        }
        o.__P = o.__n = null;
    }
    if (o = t.__k) for (let i = 0; i < o.length; i++) o[i] && W$1(o[i], n, "function" != typeof t.type || e && !t.props.__P);
    !e && (o = t.__c) && (o = o.__z) && (i = J$1(o, r = [])) && (o == t.__e && r.some(l$1), l$1(i), l$1(o)), (o = t.__e) && (e || l$1(o), o.__e && (o.__e = null)), t.__e = t.__c = t.__ = null;
}

function X(t, n, e) {
    return this.constructor(t, e);
}

function Y(n, e) {
    u$1.__ && u$1.__(n, e), 9 == e.nodeType && (e = e.documentElement);
    let o = n && 32 & n.__u, r = o ? null : e.__k;
    e.__k = a$1(p$2, {children: [n]});
    let l = [], f = [];
    G$2(e, e.__k, r || t, t, e.namespaceURI, r ? null : e.firstChild ? i$2.call(e.childNodes) : null, l, r ? r.__e : e.firstChild, o, f), Q(l, e.__k, f), e.__k.props.children = null;
}

let nt = 0;

function et(t) {
    function n(t) {
        if (!this.getChildContext) {
            let t = /* @__PURE__ */ new Set(), e = {};
            e[n.__c] = this, this.getChildContext = () => e, this.shouldComponentUpdate = function (n) {
                this.props.value != n.value && t.forEach((t) => {
                    t.__g |= 4, T$1(t);
                });
            }, this.sub = (n) => {
                t.add(n);
                let e = n.componentWillUnmount;
                n.componentWillUnmount = () => {
                    t.delete(n), e && e.call(n);
                };
            };
        }
        return t.children;
    }

    return n.__c = "__cC" + nt++, n.__ = t, n.Provider = (n.Consumer = (t, n) => t.children(n)).contextType = n, n;
}

// .mx/store/registry.npmjs.org/fiberfx/hyperscript@v4.0.0/dist/hooks.mjs
const n = Object.is;
let o$1;
let c;
let e;
let i$1 = 0;
let r = [];
let u = [];
const f$2 = u$1;
let s;
let l = f$2.__b;
let a = f$2.__r;
let p$1 = f$2.diffed;
let h$1 = f$2.__c;
let m$1 = f$2.unmount;
let y$1 = f$2.__;
f$2.__b = (t) => {
    c = null, l && l(t);
};
let d$1 = [];

function _$1(t, n) {
    f$2.__h && f$2.__h(c, t, i$1 || n), i$1 = 0;
    const o = c.__H || (c.__H = {
        __: [],
        __h: []
    });
    return t >= o.__.length && o.__.push({}), o.__[t];
}

function v$1(t) {
    return i$1 = 1, b$1(G$1, t);
}

function b$1(t, e, i) {
    const r = _$1(o$1++, 2);
    if (r.t = t, !r.__c && (r.__ = [i ? i(e) : G$1(void 0, e), (t) => {
        const o = r.__N ? r.__N[0] : r.__[0], c = r.t(o, t);
        n(o, c) || (r.__N = [c, r.__[1]], r.__c.setState({}));
    }], r.__c = c, !c.__f)) {
        c.__f = !0;
        const t = c.shouldComponentUpdate;
        c.shouldComponentUpdate = function (o, c, e) {
            const i = this.__H;
            if (!i) return !0;
            let r = !1, u = this.props != o;
            if (i.__.some((t) => {
                t.__N && (r = !0, n(t.__[0], t.__N[0]) || (u = !0));
            }), t) {
                const n = t.call(this, o, c, e);
                return r ? n || u : n;
            }
            return !r || u;
        };
    }
    return r.__;
}

function O$1() {
    let t;
    do {
        for (; t = u.shift();) try {
            B$1(t);
        } catch (n) {
            t = t.__P, f$2.__e(n, {__: t && t.__v});
        }
        for (; t = r.shift();) {
            const n = t.__H;
            if (t.__P && n) try {
                n.__h.some(B$1), n.__h.some(C$1), n.__h = [];
            } catch (o) {
                n.__h = [], f$2.__e(o, t.__v);
            }
        }
    } while (u.length);
}

f$2.__ = (t, n) => {
    t && n.__k && n.__k.__m ? t.__m = n.__k.__m : t && "object" == typeof t && n.ownerDocument && (t.__m = function (t, n) {
        d$1 = d$1.filter((t) => t.container.isConnected);
        const o = d$1.find((n) => n.container == t);
        if (o) return o.mask;
        let c = 0;
        if (!n) for (; d$1.some((t) => t.mask[0] == c);) c++;
        const e = [c, 0];
        return d$1.push({
            container: t,
            mask: e
        }), e;
    }(n, t.__u & H$1)), y$1 && y$1(t, n);
}, f$2.__r = (t) => {
    a && a(t), c = t.__c, o$1 = 0;
    const n = c.__H;
    n && (e == c ? c.__h = [] : (n.__h.some(B$1), n.__h.some(C$1), o$1 = 0), n.__h = [], n.__.some((t) => {
        t.__N && (t.__ = t.__N), t.o = t.__N = void 0;
    })), e = c;
}, f$2.diffed = (t) => {
    p$1 && p$1(t);
    const n = t.__c;
    n && n.__H && (n.__H.__h.length && z$1(r.push(n)), n.__H.__.some((t) => {
        t.o && (t.__H = t.o);
    })), e = c = null;
}, f$2.__c = (t, n) => {
    n.some((t) => {
        try {
            t.__h.some(B$1), t.__h = t.__h.filter((t) => !t.__ || C$1(t));
        } catch (n) {
            t.__h = [() => {
                throw n;
            }];
        }
    }), h$1 && h$1(t, n);
}, f$2.unmount = (t) => {
    m$1 && m$1(t);
    const n = t.__c;
    if (n && n.__H) {
        let o, c;
        n.__H.__.some((n) => {
            try {
                if (n.__P && n.__c) {
                    if (void 0 === c) {
                        for (c = t.__; c && (!c.__c || !c.__c.__P);) c = c.__;
                        c = c && c.__c;
                    }
                    n.__P = c, z$1(u.push(n));
                } else B$1(n);
            } catch (t) {
                o = t;
            }
        }), n.__H = void 0, o && f$2.__e(o, n.__v);
    }
};
let P$1 = "function" == typeof requestAnimationFrame;

function S$1(t) {
    const n = () => {
        clearTimeout(o), P$1 && cancelAnimationFrame(c), setTimeout(t);
    }, o = setTimeout(n, 35);
    let c;
    P$1 && (c = requestAnimationFrame(n));
}

function z$1(t) {
    1 != t && s == f$2.requestAnimationFrame || (s = f$2.requestAnimationFrame, (s || S$1)(O$1));
}

function B$1(t) {
    const n = c;
    let o = t.__c;
    "function" == typeof o && (t.__c = void 0, o()), c = n;
}

function C$1(t) {
    const n = c;
    t.__c = t.__(), c = n;
}

function G$1(t, n) {
    return "function" == typeof n ? n(t) : n;
}

const H$1 = 32;

// .mx/store/registry.npmjs.org/fiberfx/core@v4.0.0/dist/index.js
function d(...e) {
    return e.map((e) => typeof e == "object" && e ? e.value : e).filter(Boolean).join(" ");
}

function f$1(e) {
    let t = e.eras.flatMap((t) => [e.linear(t, 1), e.linear(t, e.yearsInEra(t))]), n = {
        ...e,
        minLinear: Math.min(...t),
        maxLinear: Math.max(...t),
        getEras: () => [...e.eras],
        getYearsInEra: (t) => e.yearsInEra(t.era),
        getMonthsInYear: (t) => e.monthsIn(e.linear(t.era, t.year)),
        getDaysInMonth: (t) => e.daysIn(e.linear(t.era, t.year), t.month),
        dayOf: (t) => e.toDay(e.linear(t.era, t.year), t.month, t.day)
    };
    return Object.freeze(n);
}

const p = (e, t) => Math.floor(e / t);
const m = (e, t) => e - t * Math.floor(e / t);
const h = (e, t, n) => Math.max(t, Math.min(n, e));
const g = (e) => m(e, 4) === 0 && (m(e, 100) !== 0 || m(e, 400) === 0);
const _ = [
    31,
    28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
];
const v = (e, t) => t === 2 && g(e) ? 29 : _[t - 1] ?? 30;

function y(e, t, n) {
    let r = t <= 2 ? e - 1 : e, i = p(r, 400), a = r - i * 400, o = p(153 * (t + (t > 2 ? -3 : 9)) + 2, 5) + n - 1;
    return i * 146097 + a * 365 + p(a, 4) - p(a, 100) + o - 719468;
}

function b(e) {
    let t = e + 719468, n = p(t, 146097), r = t - n * 146097, i = p(r - p(r, 1460) + p(r, 36524) - p(r, 146096), 365),
        a = r - (365 * i + p(i, 4) - p(i, 100)), o = p(5 * a + 2, 153), s = o < 10 ? o + 3 : o - 9;
    return {
        year: i + n * 400 + +(s <= 2),
        month: s,
        day: a - p(153 * o + 2, 5) + 1
    };
}

function x(e) {
    let {offset: t, eraOf: n, ...r} = e;
    return f$1({
        ...r,
        monthsIn: () => 12,
        daysIn: (e, n) => v(e + t, n),
        toDay: (e, n, r) => y(e + t, n, r),
        fromDay(e) {
            let {year: r, month: i, day: a} = b(e);
            return {
                ...n(r - t),
                month: i,
                day: a
            };
        }
    });
}

const S = x({
    identifier: "gregory",
    eras: ["BC", "AD"],
    offset: 0,
    linear: (e, t) => e === "BC" ? 1 - t : t,
    yearsInEra: () => 9999,
    eraOf: (e) => e < 1 ? {
        era: "BC",
        year: 1 - e
    } : {
        era: "AD",
        year: e
    }
});
const C = 864e5;
const w = 36e5;

function T(e, t) {
    let n = t.era;
    if (!e.eras.includes(n)) throw RangeError(`Invalid era for ${e.identifier}: ${n}`);
    let r = h(t.year, 1, e.yearsInEra(n)), i = e.linear(n, r), a = h(t.month, 1, e.monthsIn(i)),
        o = h(t.day, 1, e.daysIn(i, a));
    return e.constrain ? e.constrain({
        era: n,
        year: r,
        month: a,
        day: o
    }) : {
        era: n,
        year: r,
        month: a,
        day: o
    };
}

const E = (e) => ({
    hour: h(e.hour, 0, 23),
    minute: h(e.minute, 0, 59),
    second: h(e.second, 0, 59),
    millisecond: h(e.millisecond, 0, 999)
});
const D = (e) => e.calendar.dayOf(e);
const O = (e) => e.hour * w + e.minute * 6e4 + e.second * 1e3 + e.millisecond;
const k = (e) => D(e) * C + O(e);

function A(e, t, n, r = 0) {
    let i = e.linear(t.era, t.year), a = i + (n.years ?? 0), o = e.carryMonth ? e.carryMonth(t.month, i, a) : t.month;
    for (o += n.months ?? 0; o < 1 && a >= e.minLinear;) o += e.monthsIn(--a);
    for (; a <= e.maxLinear && o > e.monthsIn(a);) o -= e.monthsIn(a++);
    if (a < e.minLinear) return e.fromDay(e.toDay(e.minLinear, 1, 1));
    if (a > e.maxLinear) return j(e);
    let s = h(t.day, 1, e.daysIn(a, o)), c = e.toDay(a, o, s) + (n.weeks ?? 0) * 7 + (n.days ?? 0) + r,
        l = e.toDay(e.minLinear, 1, 1), u = e.dayOf(j(e));
    return e.fromDay(h(c, l, u));
}

function j(e) {
    let t = e.maxLinear, n = e.monthsIn(t);
    return e.fromDay(e.toDay(t, n, e.daysIn(t, n)));
}

function M(e, t, n, r, i = !1) {
    if (!i) {
        let i = e + t;
        return i < n ? r - (n - i - 1) : i > r ? n + (i - r - 1) : i;
    }
    let a = e + Math.sign(t);
    a < n && (a = r);
    let o = Math.abs(t);
    return a = t > 0 ? Math.ceil(a / o) * o : Math.floor(a / o) * o, a > r ? n : a;
}

function N(e, t, n, r, i) {
    let a = i?.round;
    switch (n) {
        case "era": {
            let n = e.eras, i = n.indexOf(t.era);
            if (i < 0) throw Error(`Invalid era: ${t.era}`);
            return T(e, {
                ...t,
                era: n[M(i, r, 0, n.length - 1, a)]
            });
        }
        case "year": {
            let n = e.linear(t.era, 2) < e.linear(t.era, 1), i = M(t.year, n ? -r : r, -Infinity, 9999, a),
                o = i === -Infinity ? 1 : i, s = e.linear(t.era, t.year),
                c = h(e.linear(t.era, o), e.minLinear, e.maxLinear),
                l = h(e.carryMonth ? e.carryMonth(t.month, s, c) : t.month, 1, e.monthsIn(c));
            return T(e, e.fromDay(e.toDay(c, l, h(t.day, 1, e.daysIn(c, l)))));
        }
        case "month": {
            let n = e.linear(t.era, t.year), i = e.monthsIn(n), o = h(M(t.month, r, 1, i, a), 1, i);
            return e.fromDay(e.toDay(n, o, h(t.day, 1, e.daysIn(n, o))));
        }
        case "day": {
            let n = e.linear(t.era, t.year), i = e.daysIn(n, t.month);
            return e.fromDay(e.toDay(n, t.month, h(M(t.day, r, 1, i, a), 1, i)));
        }
        default:
            throw Error(`Unsupported field ${n}`);
    }
}

function P(e, t, n, r) {
    let i = r?.round;
    switch (t) {
        case "hour": {
            let t = r?.hourCycle === 12, a = e.hour >= 12;
            return {
                ...e,
                hour: M(e.hour, n, t && a ? 12 : 0, t && !a ? 11 : 23, i)
            };
        }
        case "minute":
            return {
                ...e,
                minute: M(e.minute, n, 0, 59, i)
            };
        case "second":
            return {
                ...e,
                second: M(e.second, n, 0, 59, i)
            };
        case "millisecond":
            return {
                ...e,
                millisecond: M(e.millisecond, n, 0, 999, i)
            };
        default:
            throw Error(`Unsupported field ${t}`);
    }
}

function F(e, t) {
    let n = O(e) + (t.hours ?? 0) * w + (t.minutes ?? 0) * 6e4 + (t.seconds ?? 0) * 1e3 + (t.milliseconds ?? 0);
    return {
        time: I(m(n, C)),
        days: p(n, C)
    };
}

const I = (e) => ({
    hour: p(e, w),
    minute: p(m(e, w), 6e4),
    second: p(m(e, 6e4), 1e3),
    millisecond: m(e, 1e3)
});
const L = (e) => Object.fromEntries(Object.entries(e).map(([e, t]) => [e, typeof t == "number" ? -t : t]));

function ee(e) {
    let t = [...e], n = typeof t[0] == "object" ? t.shift() : S,
        r = typeof t[0] == "string" ? t.shift() : n.eras[n.eras.length - 1], [i, a, o, ...s] = t;
    return {
        calendar: n,
        fields: {
            era: r,
            year: i,
            month: a,
            day: o
        },
        rest: s
    };
}

const R = (e) => {
    let [t = 0, n = 0, r = 0, i = 0] = e;
    return E({
        hour: t,
        minute: n,
        second: r,
        millisecond: i
    });
};
const z = (e, t = 2) => String(e).padStart(t, "0");

function te(e) {
    let {year: t, month: n, day: r} = b(D(e));
    return `${t < 0 ? `-${z(-t, 6)}` : z(t, 4)}-${z(n)}-${z(r)}`;
}

const B = (e) => `${z(e.hour)}:${z(e.minute)}:${z(e.second)}${e.millisecond ? String(e.millisecond / 1e3).slice(1) : ""}`;

function ne(e) {
    let t = e < 0 ? "-" : "+", n = Math.abs(e), r = p(m(n, 6e4), 1e3);
    return `${t}${z(p(n, w))}:${z(p(m(n, w), 6e4))}${r ? `:${z(r)}` : ""}`;
}

var re = class {
    calendar;
    era;
    year;
    month;
    day;

    constructor(...e) {
        let {calendar: t, fields: n} = ee(e);
        this.calendar = t;
        let r = T(t, n);
        this.era = r.era, this.year = r.year, this.month = r.month, this.day = r.day;
    }

    copy() {
        return de(this.calendar, this);
    }

    add(e) {
        return de(this.calendar, A(this.calendar, this, e));
    }

    subtract(e) {
        return this.add(L(e));
    }

    set(e) {
        return de(this.calendar, {
            ...this,
            ...ue(e)
        });
    }

    cycle(e, t, n) {
        return de(this.calendar, N(this.calendar, this, e, t, n));
    }

    toDate(e, t) {
        return new Date(W(this, e, t));
    }

    toString() {
        return te(this);
    }

    compare(e) {
        return D(this) - D(e);
    }
};
var ae = class {
    calendar;
    era;
    year;
    month;
    day;
    hour;
    minute;
    second;
    millisecond;

    constructor(...e) {
        let {calendar: t, fields: n, rest: r} = ee(e);
        this.calendar = t;
        let i = T(t, n);
        this.era = i.era, this.year = i.year, this.month = i.month, this.day = i.day;
        let a = R(r);
        this.hour = a.hour, this.minute = a.minute, this.second = a.second, this.millisecond = a.millisecond;
    }

    copy() {
        return pe(this.calendar, this, this);
    }

    add(e) {
        let {time: t, days: n} = F(this, e);
        return pe(this.calendar, A(this.calendar, this, e, n), t);
    }

    subtract(e) {
        return this.add(L(e));
    }

    set(e) {
        let {era: t, year: n, month: r, day: i, ...a} = e;
        return pe(this.calendar, {
            ...this,
            ...ue({
                era: t,
                year: n,
                month: r,
                day: i
            })
        }, {
            ...le(this),
            ...ue(a)
        });
    }

    cycle(e, t, n) {
        return se(e) ? pe(this.calendar, N(this.calendar, this, e, t, n), this) : pe(this.calendar, this, P(this, e, t, n));
    }

    toDate(e, t) {
        return new Date(W(this, e, t));
    }

    toString() {
        return `${te(this)}T${B(this)}`;
    }

    compare(e) {
        return D(this) - D(e) || O(this) - O(ce(e) ? e : V);
    }
};
var oe = class e {
    calendar;
    era;
    year;
    month;
    day;
    hour;
    minute;
    second;
    millisecond;
    timeZone;
    offset;

    constructor(...e) {
        let {calendar: t, fields: n, rest: r} = ee(e);
        this.calendar = t;
        let i = T(t, n);
        this.era = i.era, this.year = i.year, this.month = i.month, this.day = i.day;
        let [a, o, ...s] = r;
        this.timeZone = a, this.offset = o;
        let c = R(s);
        this.hour = c.hour, this.minute = c.minute, this.second = c.second, this.millisecond = c.millisecond;
    }

    copy() {
        return H(G(this.toDate().getTime(), this.timeZone), this.calendar);
    }

    add(e) {
        let {years: t, months: n, weeks: r, days: i} = e;
        return H(G((t || n || r || i ? W(he(this).add({
            years: t,
            months: n,
            weeks: r,
            days: i
        }), this.timeZone) : k(this) - this.offset) + (e.milliseconds ?? 0) + (e.seconds ?? 0) * 1e3 + (e.minutes ?? 0) * 6e4 + (e.hours ?? 0) * w, this.timeZone), this.calendar);
    }

    subtract(e) {
        return this.add(L(e));
    }

    set(e, t) {
        let n = he(this), r = n.set(e);
        return r.compare(n) === 0 ? this : H(G(W(r, this.timeZone, t), this.timeZone), this.calendar);
    }

    cycle(t, n, r) {
        if (t === "hour") {
            let e = r?.hourCycle === 12, t = this.hour >= 12, i = he(this), a = (e) => {
                    let t = i.set({hour: e});
                    return [W(t, this.timeZone, "earlier"), W(t, this.timeZone, "later")].filter((e) => G(e, this.timeZone).day === H(t, S).day);
                }, o = a(e && t ? 12 : 0)[0] ?? k(this) - this.offset,
                s = a(e && !t ? 11 : 23).pop() ?? k(this) - this.offset, c = k(this) - this.offset;
            return H(G(M(p(c, w), n, p(o, w), p(s, w), r?.round) * w + m(c, w), this.timeZone), this.calendar);
        }
        if (se(t)) return H(G(W(he(this).cycle(t, n, r), this.timeZone), this.timeZone), this.calendar);
        let i = P(this, t, n, r);
        return new e(this.calendar, this.era, this.year, this.month, this.day, this.timeZone, this.offset, i.hour, i.minute, i.second, i.millisecond);
    }

    toDate() {
        return new Date(k(this) - this.offset);
    }

    toString() {
        return `${te(this)}T${B(this)}${ne(this.offset)}[${this.timeZone}]`;
    }

    toAbsoluteString() {
        return this.toDate().toISOString();
    }

    compare(e) {
        return this.toDate().getTime() - ge(e, this.timeZone).toDate().getTime();
    }
};
const V = {
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0
};
const se = (e) => e === "era" || e === "year" || e === "month" || e === "day";
const ce = (e) => "hour" in e;
const le = (e) => ({
    hour: e.hour,
    minute: e.minute,
    second: e.second,
    millisecond: e.millisecond
});
const ue = (e) => Object.fromEntries(Object.entries(e).filter(([, e]) => e != null));
const de = (e, t) => new re(e, t.era, t.year, t.month, t.day);
const pe = (e, t, n) => new ae(e, t.era, t.year, t.month, t.day, n.hour, n.minute, n.second, n.millisecond);

function H(e, t) {
    if (e.calendar.identifier === t.identifier) return e;
    let n = t.fromDay(D(e));
    return e instanceof oe ? new oe(t, n.era, n.year, n.month, n.day, e.timeZone, e.offset, e.hour, e.minute, e.second, e.millisecond) : ce(e) ? pe(t, n, e) : de(t, n);
}

const me = (e) => de(e.calendar, e);
const he = (e, t) => pe(e.calendar, e, t ?? (ce(e) ? e : V));

function ge(e, t, n) {
    return e instanceof oe ? e.timeZone === t ? e : H(G(e.toDate().getTime(), t), e.calendar) : H(G(W(e, t, n), t), e.calendar);
}

const _e = /* @__PURE__ */ new Map();

function ve(e) {
    let t = _e.get(e);
    return t || (t = new Intl.DateTimeFormat("en-US", {
        timeZone: e,
        hourCycle: "h23",
        era: "short",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    }), _e.set(e, t)), t;
}

function ye(e, t) {
    let n = {};
    for (let r of ve(t).formatToParts(new Date(e))) n[r.type] = r.value;
    let r = Number(n.year), i = n.era === "BC" || n.era === "B" ? 1 - r : r, a = Number(n.hour) % 24;
    return y(i, Number(n.month), Number(n.day)) * C + a * w + Number(n.minute) * 6e4 + Number(n.second) * 1e3;
}

const U = (e, t) => t === "UTC" ? 0 : ye(e, t) - p(e, 1e3) * 1e3;

function be(e, t) {
    let n = e - U(e - C, t), r = e - U(e + C, t), i = p(e, 1e3) * 1e3;
    return {
        valid: (n === r ? [n] : [n, r]).filter((e) => ye(e, t) === i),
        earlier: n,
        later: r
    };
}

function W(e, t, n = "compatible") {
    let r = D(e) * C + (ce(e) ? O(e) : 0);
    if (t === "UTC") return r;
    let {valid: i, earlier: a, later: o} = be(r, t);
    if (i.length === 1) return i[0];
    if (i.length > 1) {
        if (n === "reject") throw RangeError("Multiple possible absolute times found");
        return n === "later" ? i[i.length - 1] : i[0];
    }
    if (n === "reject") throw RangeError("No such absolute time found");
    return n === "earlier" ? Math.min(a, o) : Math.max(a, o);
}

function G(e, t) {
    let n = U(e, t), r = e + n, i = S.fromDay(p(r, C)), a = I(m(r, C));
    return new oe(S, i.era, i.year, i.month, i.day, t, n, a.hour, a.minute, a.second, a.millisecond);
}

function Oe(e) {
    let t = new Intl.Locale(e), n = t.getWeekInfo?.() ?? t.weekInfo;
    if (n) return n.firstDay % 7;
    let r = t.maximize().region ?? "";
    return r === "MV" ? 5 : "AG AS AU BD BR BS BT BW BZ CA CN CO DM DO ET GT GU HK HN ID IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW".includes(r) ? 0 : "AE AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY".includes(r) ? 6 : 1;
}

const ke = (e, t) => m(D(e) + 4 - Oe(t), 7);
const st = [
    "day",
    "month",
    "year"
];
const ct = [
    "hour",
    "minute",
    "second",
    "dayPeriod"
];
const lt = ["literal", "timeZoneName"];
const dt = [...[...st, ...ct], ...lt];
const ft = [...ct, ...lt];
dt.filter((e) => e !== "literal"), ft.filter((e) => e !== "literal");
const pt = typeof document < "u";
mt();

function mt() {
    return pt && window?.navigator?.userAgent && (/iP(ad|hone|od)/.test(window.navigator.userAgent) || window?.navigator?.maxTouchPoints > 2 && /iPad|Macintosh/.test(window?.navigator.userAgent));
}

const _t = "ArrowDown";
const bt = "ArrowUp";
const $t$1 = /^(\d{4})-(\d{2})-(\d{2})$/;

function en$1(e) {
    if (e === "") return {kind: "empty"};
    let t = $t$1.exec(e);
    if (!t) return {
        kind: "issue",
        reason: "malformed",
        input: e
    };
    let [n, r, i] = [
        Number(t[1]),
        Number(t[2]),
        Number(t[3])
    ];
    if (n < 1 || r < 1 || r > 12 || i < 1) return {
        kind: "issue",
        reason: "impossible",
        input: e
    };
    let a = new re(n, r, i);
    return a.year !== n || a.month !== r || a.day !== i ? {
        kind: "issue",
        reason: "impossible",
        input: e
    } : {
        kind: "date",
        value: a
    };
}

function tn$1(e) {
    let t = H(me(e), S), n = (e, t) => String(e).padStart(t, "0");
    return `${n(t.year, 4)}-${n(t.month, 2)}-${n(t.day, 2)}`;
}

et(null);
const Wn = [
    _t,
    "PageUp",
    "Home"
];
const Gn = [
    bt,
    "PageDown",
    "End"
];
[...Wn, ...Gn];

function Jn(e) {
    let t = [], n = /* @__PURE__ */ new Map(), r = [];
    for (let i of e) n.has(i.key) ? r.includes(i.key) || r.push(i.key) : (n.set(i.key, t.length), t.push(i));
    return {
        nodes: t,
        size: t.length,
        duplicates: r,
        has: (e) => n.has(e),
        get: (e) => {
            let r = n.get(e);
            return r === void 0 ? void 0 : t[r];
        },
        indexOf: (e) => n.get(e) ?? -1,
        at: (e) => t[e],
        keys: () => t.map((e) => e.key)
    };
}

Jn([]);

function jr(e, t = {}) {
    let n = [], r = /* @__PURE__ */ new Map(), i = [], a = [], o = /* @__PURE__ */ new Set(),
        s = /* @__PURE__ */ new Set();
    for (let t of e) o.has(t.key) ? i.includes(t.key) || i.push(t.key) : (o.add(t.key), a.push(t), (t.kind ?? "item") === "section" && s.add(t.key));
    let c = 0;
    for (let e of a) {
        let t = e.kind ?? "item",
            i = e.parentKey != null && s.has(e.parentKey) && e.parentKey !== e.key ? e.parentKey : null, a = {
                key: e.key,
                kind: t,
                parentKey: i,
                textValue: t === "separator" ? "" : (e.textValue ?? "").trim(),
                disabled: !!e.disabled,
                index: t === "item" ? c++ : -1
            };
        r.set(a.key, a), n.push(a);
    }
    let l = Jn(n.filter((e) => e.kind === "item").map((e) => ({
        key: e.key,
        textValue: e.textValue,
        disabled: e.disabled,
        section: e.parentKey
    }))), u = t.total === "unknown" ? {kind: "unknown"} : {
        kind: "known",
        count: Math.max(l.size, Number.isFinite(t.total) ? Math.floor(t.total) : l.size)
    }, d = /* @__PURE__ */ new Map();
    for (let e of n) {
        let t = d.get(e.parentKey) ?? [];
        t.push(e), d.set(e.parentKey, t);
    }
    return {
        nodes: n,
        items: l,
        total: u,
        loadedCount: l.size,
        duplicates: i,
        has: (e) => r.has(e),
        get: (e) => r.get(e),
        isItem: (e) => r.get(e)?.kind === "item",
        childrenOf: (e) => d.get(e) ?? [],
        positionOf: (e) => {
            let t = r.get(e);
            return t && t.kind === "item" ? t.index + 1 : null;
        }
    };
}

jr([]);
Object.freeze({
    phase: "idle",
    pointerId: null,
    originMain: 0,
    originCross: 0,
    startExtent: 0,
    extent: 0,
    samples: Object.freeze([])
});
const la = new re(2026, 1, 4);

function q(e, t, n) {
    let r = en$1(n.min), i = en$1(n.max);
    if (r.kind !== "date" || i.kind !== "date" || r.value.compare(i.value) > 0) throw RangeError(`Calendar adapter ${e} declares invalid bounds`);
    return {
        identifier: e,
        calendar: t,
        eras: t.getEras(),
        bounds: {
            min: n.min,
            max: n.max
        },
        fromIso(e) {
            let n = en$1(e);
            if (n.kind === "empty") return {
                kind: "issue",
                reason: "malformed",
                input: e
            };
            if (n.kind === "issue") return {
                kind: "issue",
                reason: n.reason,
                input: e
            };
            if (n.value.compare(r.value) < 0 || n.value.compare(i.value) > 0) return {
                kind: "issue",
                reason: "out-of-bounds",
                input: e
            };
            let a = H(n.value, t);
            return tn$1(a) === e ? {
                kind: "date",
                value: a
            } : {
                kind: "issue",
                reason: "conversion-mismatch",
                input: e
            };
        },
        toIso: (e) => tn$1(e),
        monthsInYear: (e) => t.getMonthsInYear(H(e, t)),
        daysInMonth: (e) => t.getDaysInMonth(H(e, t)),
        add: (e, n) => H(e, t).add(n),
        weekStart: (e) => (7 - ke(la, e)) % 7
    };
}

q("gregory", S, {
    min: "0001-01-01",
    max: "9999-12-31"
});
x({
    identifier: "buddhist",
    eras: ["BE"],
    offset: -543,
    linear: (e, t) => t,
    yearsInEra: () => 9999,
    eraOf: (e) => ({
        era: "BE",
        year: e
    })
});
x({
    identifier: "roc",
    eras: ["before_minguo", "minguo"],
    offset: 1911,
    linear: (e, t) => e === "before_minguo" ? 1 - t : t,
    yearsInEra: (e) => e === "before_minguo" ? 9999 : 8088,
    eraOf: (e) => e < 1 ? {
        era: "before_minguo",
        year: 1 - e
    } : {
        era: "minguo",
        year: e
    }
});
const va = [
    {
        era: "meiji",
        start: [
            1868,
            9,
            8
        ]
    },
    {
        era: "taisho",
        start: [
            1912,
            7,
            30
        ]
    },
    {
        era: "showa",
        start: [
            1926,
            12,
            25
        ]
    },
    {
        era: "heisei",
        start: [
            1989,
            1,
            8
        ]
    },
    {
        era: "reiwa",
        start: [
            2019,
            5,
            1
        ]
    }
];
const ya = (e) => {
    let [t, n, r] = va[e].start;
    return y(t, n, r);
};
const ba = (e) => {
    let t = va.findIndex((t) => t.era === e);
    return t < 0 ? va.length - 1 : t;
};
const xa$1 = (e) => va[ba(e)].start[0] - 1;
f$1({
    identifier: "japanese",
    eras: va.map((e) => e.era),
    linear: (e, t) => t + xa$1(e),
    yearsInEra(e) {
        let t = va[ba(e) + 1];
        return (t ? t.start[0] : 9999) - xa$1(e);
    },
    monthsIn: () => 12,
    daysIn: (e, t) => v(e, t),
    toDay: (e, t, n) => y(e, t, n),
    fromDay(e) {
        let t = Math.max(e, ya(0)), n = va.length - 1;
        for (; t < ya(n);) n--;
        let r = b(t), i = va[n].era;
        return {
            era: i,
            year: r.year - xa$1(i),
            month: r.month,
            day: r.day
        };
    },
    constrain(e) {
        let t = ba(e.era), n = xa$1(e.era), [, r, i] = va[t].start,
            a = t + 1 < va.length ? b(ya(t + 1) - 1) : void 0, {year: o, month: s, day: c} = e;
        return a && (o = Math.min(o, a.year - n), o + n === a.year && (s = Math.min(s, a.month), s === a.month && (c = Math.min(c, a.day)))), o === 1 && (s = Math.max(s, r), s === r && (c = Math.max(c, i))), {
            era: e.era,
            year: o,
            month: s,
            day: Math.min(c, v(o + n, s))
        };
    }
});
const Ca = (e) => {
    let t = e + 78;
    return y(t, 3, g(t) ? 21 : 22);
};
const wa = (e, t) => t === 1 ? g(e + 78) ? 31 : 30 : t <= 6 ? 31 : 30;
f$1({
    identifier: "indian",
    eras: ["saka"],
    linear: (e, t) => t,
    yearsInEra: () => 9919,
    monthsIn: () => 12,
    daysIn: wa,
    toDay(e, t, n) {
        let r = Ca(e);
        for (let n = 1; n < t; n++) r += wa(e, n);
        return r + n - 1;
    },
    fromDay(e) {
        let t = b(e).year - 78;
        e < Ca(t) && t--;
        let n = e - Ca(t), r = 1;
        for (; n >= wa(t, r);) n -= wa(t, r++);
        return {
            era: "saka",
            year: t,
            month: r,
            day: n + 1
        };
    }
});
const Ea = y(622, 3, 21);
const Da = (e) => m(25 * e + 11, 33) < 8;
const Oa = (e) => Ea + 365 * (e - 1) + p(8 * e + 21, 33);
const ka = (e) => e <= 7 ? 31 * (e - 1) : 30 * (e - 1) + 6;
f$1({
    identifier: "persian",
    eras: ["AP"],
    linear: (e, t) => t,
    yearsInEra: () => 9377,
    monthsIn: () => 12,
    daysIn: (e, t) => t <= 6 ? 31 : t <= 11 || Da(e) ? 30 : 29,
    toDay: (e, t, n) => Oa(e) + ka(t) + n - 1,
    fromDay(e) {
        let t = p(33 * (e - Ea) + 3, 12053) + 1;
        for (; Oa(t + 1) <= e;) t++;
        for (; Oa(t) > e;) t--;
        let n = e - Oa(t), r = n < 186 ? p(n, 31) + 1 : p(n - 6, 30) + 1;
        return {
            era: "AP",
            year: t,
            month: r,
            day: n - ka(r) + 1
        };
    }
});
const ja = (e, t) => e + 354 * (t - 1) + p(3 + 11 * t, 30);
const Ma = (e, t) => t === 12 ? m(14 + 11 * e, 30) < 11 ? 30 : 29 : m(t, 2) === 1 ? 30 : 29;
const Na = (e, t, n, r) => ja(e, t) + 29 * (n - 1) + p(n, 2) + r - 1;

function Pa$1(e, t) {
    let n = p(30 * (t - e) + 10646, 10631), r = h(p(11 * (t - ja(e, n)) + 330, 325), 1, 12);
    return {
        era: "AH",
        year: n,
        month: r,
        day: t - Na(e, n, r, 1) + 1
    };
}

const Fa$1 = (e, t) => f$1({
    identifier: e,
    eras: ["AH"],
    linear: (e, t) => t,
    yearsInEra: () => 9665,
    monthsIn: () => 12,
    daysIn: Ma,
    toDay: (e, n, r) => Na(t, e, n, r),
    fromDay: (e) => Pa$1(t, e)
});
Fa$1("islamic-civil", y(622, 7, 19));
Fa$1("islamic-tbla", y(622, 7, 18));
const Ra = y(-3760, 9, 7);
const za = (e) => m(7 * e + 1, 19) < 7;

function Ba(e) {
    let t = p(235 * e - 234, 19), n = 29 * t + p(12084 + 13753 * t, 25920);
    return m(3 * (n + 1), 7) < 3 ? n + 1 : n;
}

function Va(e) {
    let t = Ba(e - 1), n = Ba(e), r = Ba(e + 1) - n === 356 ? 2 : +(n - t === 382);
    return Ra + n + r;
}

const Ha = (e) => Va(e + 1) - Va(e);
const Ua = [
    30,
    29,
    29,
    29,
    30,
    30,
    29,
    30,
    29,
    30,
    29,
    30,
    29
];

function Wa(e, t) {
    let n = !za(e) && t >= 6 ? t + 1 : t;
    return n === 2 ? m(Ha(e), 10) === 5 ? 30 : 29 : n === 3 ? m(Ha(e), 10) === 3 ? 29 : 30 : Ua[n - 1] ?? 29;
}

f$1({
    identifier: "hebrew",
    eras: ["AM"],
    linear: (e, t) => t,
    yearsInEra: () => 9999,
    monthsIn: (e) => za(e) ? 13 : 12,
    daysIn: Wa,
    toDay(e, t, n) {
        let r = Va(e);
        for (let n = 1; n < t; n++) r += Wa(e, n);
        return r + n - 1;
    },
    fromDay(e) {
        let t = p(98496 * (e - Ra), 35975351) + 1;
        for (; Va(t + 1) <= e;) t++;
        for (; Va(t) > e;) t--;
        let n = e - Va(t), r = 1;
        for (; n >= Wa(t, r);) n -= Wa(t, r++);
        return {
            era: "AM",
            year: t,
            month: r,
            day: n + 1
        };
    },
    carryMonth(e, t, n) {
        return e <= 6 ? e : za(t) && !za(n) ? e - 1 : !za(t) && za(n) ? e + 1 : e;
    }
});

function Ka(e, t, n, r, i) {
    let a = (e) => n + 365 * (e - 1) + p(e, 4);
    return f$1({
        identifier: e,
        eras: t,
        linear: r,
        yearsInEra: () => 9999,
        monthsIn: () => 13,
        daysIn: (e, t) => t < 13 ? 30 : m(e, 4) === 3 ? 6 : 5,
        toDay: (e, t, n) => a(e) + 30 * (t - 1) + n - 1,
        fromDay(e) {
            let t = p(4 * (e - n) + 1463, 1461), r = e - a(t), o = p(r, 30) + 1;
            return {
                ...i(t),
                month: o,
                day: r - 30 * (o - 1) + 1
            };
        }
    });
}

Ka("coptic", ["BCE", "CE"], y(284, 8, 29), (e, t) => e === "BCE" ? 1 - t : t, (e) => e < 1 ? {
    era: "BCE",
    year: 1 - e
} : {
    era: "CE",
    year: e
});
const Ja = y(8, 8, 27);
const Ya = 5500;
Ka("ethiopic", ["AA", "AM"], Ja, (e, t) => e === "AA" ? t - Ya : t, (e) => e < 1 ? {
    era: "AA",
    year: e + Ya
} : {
    era: "AM",
    year: e
});
Ka("ethioaa", ["AA"], Ja, (e, t) => t - Ya, (e) => ({
    era: "AA",
    year: e + Ya
}));

function J(e, t, n = 1) {
    return Object.freeze({
        kind: "literal",
        space: e,
        channels: Object.freeze([
            t[0],
            t[1],
            t[2]
        ]),
        alpha: n
    });
}

const os$1 = [
    [
        "slate",
        "Slate",
        [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            11,
            12
        ]
    ],
    [
        "iris",
        "Iris",
        [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            11,
            12
        ]
    ],
    [
        "indigo",
        "Indigo",
        [
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            11,
            12
        ]
    ],
    [
        "green",
        "Green",
        [
            3,
            9,
            11
        ]
    ],
    [
        "red",
        "Red",
        [
            3,
            9,
            11
        ]
    ],
    [
        "orange",
        "Orange",
        [
            3,
            9,
            11
        ]
    ],
    [
        "plum",
        "Plum",
        [
            3,
            9,
            11
        ]
    ]
];
const ss = [
    [
        "Background",
        "bg",
        "primary secondary tertiary elevated inverse inverse-hover inverse-pressed disabled hover pressed backdrop overlay selected brand brand-hover brand-pressed brand-subtle brand-muted active active-hover active-subtle positive positive-subtle negative negative-subtle caution caution-subtle discovery discovery-subtle info info-subtle"
    ],
    [
        "Foreground",
        "fg",
        "primary secondary tertiary disabled inverse on-brand on-active on-positive on-negative on-caution on-discovery brand brand-hover active link link-hover link-visited positive negative caution discovery info"
    ],
    [
        "Border",
        "border",
        "primary secondary strong disabled focus active brand inverse positive negative caution discovery"
    ],
    [
        "Ring",
        "ring",
        "focus negative"
    ]
];
const cs = (e) => e.split("-").map((e, t) => t === 0 ? e[0].toUpperCase() + e.slice(1) : e).join(" ");
Object.freeze([...os$1.flatMap(([e, t, n]) => n.map((n) => ({
    id: `${e}-${n}`,
    cssVar: `--${e}-${n}`,
    type: "color",
    label: `${t} ${n}`,
    group: t
}))), ...ss.flatMap(([e, t, n]) => n.split(" ").map((n) => ({
    id: `${t}-${n}`,
    cssVar: `--${t}-${n}`,
    type: "color",
    label: `${e} ${cs(n).toLowerCase()}`,
    group: e
})))]);
Object.freeze([]);
et(null);
et(null);
// .mx/store/registry.npmjs.org/fiberfx/hyperscript@v4.0.0/dist/jsx-runtime.mjs
let o = 0;
Array.isArray;

function i(e, n, r, f, i, u) {
    n || (n = {});
    let l, c, p = n;
    if ("ref" in p && "function" != typeof e) for (c in p = {}, n) "ref" == c ? l = n[c] : p[c] = n[c];
    const s = {
        type: e,
        props: p,
        key: r,
        ref: l,
        __k: null,
        __: null,
        __b: 0,
        __e: null,
        __c: null,
        constructor: void 0,
        __v: --o,
        __i: -1,
        __u: 0
    };
    return (i || u) && (s.__source = i, s.__self = u), u$1.vnode && u$1.vnode(s), s;
}

// .mx/store/registry.npmjs.org/fiberfx/ui@v4.0.0/dist/index.js
var Ht = function ({
                       variant: e = "primary",
                       size: t = "md",
                       loading: n = !1,
                       fullWidth: r = !1,
                       leading: i$3,
                       trailing: a,
                       type: o = "button",
                       class: s,
                       children: c,
                       disabled: l,
                       ref: u,
                       ...d$2
                   }) {
    return /* @__PURE__ */ i("button", {
        ref: u,
        type: o,
        disabled: l || n,
        "aria-busy": n || void 0,
        class: d("mx-btn", `mx-btn--${e}`, `mx-btn--${t}`, r && "is-full", s),
        ...d$2,
        children: [
            n ? /* @__PURE__ */ i("span", {
                class: "mx-btn__spin",
                "aria-hidden": "true"
            }) : i$3 ? /* @__PURE__ */ i("span", {
                class: "mx-btn__icon",
                children: i$3
            }) : null,
            c != null && /* @__PURE__ */ i("span", {
                class: "mx-btn__lbl",
                children: c
            }),
            a && !n ? /* @__PURE__ */ i("span", {
                class: "mx-btn__icon mx-btn__icon--trail",
                children: a
            }) : null
        ]
    });
};
var $t = /* @__PURE__ */ new Set(/* @__PURE__ */ "animation-iteration-count.aspect-ratio.border-image-outset.border-image-slice.border-image-width.box-flex.box-flex-group.box-ordinal-group.column-count.columns.fill-opacity.flex.flex-grow.flex-negative.flex-order.flex-positive.flex-shrink.flood-opacity.font-weight.grid-area.grid-column.grid-column-end.grid-column-span.grid-column-start.grid-row.grid-row-end.grid-row-span.grid-row-start.line-clamp.line-height.opacity.order.orphans.scale.stop-opacity.stroke-dasharray.stroke-dashoffset.stroke-miterlimit.stroke-opacity.stroke-width.tab-size.widows.z-index.zoom".split("."));

function en(e) {
    return e[0] === "-" ? e : e.replace(/[A-Z]/g, "-$&").toLowerCase();
}

function tn(e) {
    let t = [];
    for (let n in e) {
        let r = e[n];
        if (r == null || r === "") continue;
        let i = en(n), a = typeof r == "number" && !i.startsWith("--") && !$t.has(i) ? `${r}px` : String(r);
        t.push(`${i}:${a}`);
    }
    return t;
}

var nn = (e) => e.trim().replace(/;+\s*$/, "").trim();

function rn(...e) {
    if (!e.some((e) => typeof e == "string" && nn(e) !== "")) {
        let t = {};
        for (let n of e) typeof n != "string" && (t = {
            ...t,
            ...n
        });
        return t;
    }
    let t = [];
    for (let n of e) if (typeof n == "string") {
        let e = nn(n);
        e !== "" && t.push(e);
    } else n != null && t.push(...tn(n));
    return t.join(";");
}

et(null);
var zn = et(null);
et(null);
zn.Provider;
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et({
    inToolbar: !1,
    orientation: "horizontal",
    size: "md",
    focusableWhenDisabled: !1
});
et(null);
et(null);
et(null);
et(null);

function oa({variant: e = "flat", padding: t = 20, title: n, actions: r, class: i$64, style: a, children: o, ...s}) {
    let c = n != null || r != null;
    return /* @__PURE__ */ i("div", {
        class: d("mx-card", e !== "flat" && `mx-card--${e}`, i$64),
        style: rn({padding: t}, a),
        ...s,
        children: [c && /* @__PURE__ */ i("div", {
            class: "mx-card__header",
            children: [n != null && /* @__PURE__ */ i("div", {
                class: "mx-card__title",
                children: n
            }), r != null && /* @__PURE__ */ i("div", {
                class: "mx-card__actions",
                children: r
            })]
        }), o]
    });
}

et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(!1);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
J("hsb", [
    0,
    100,
    100
]);
J("hsb", [
    0,
    100,
    100
]);
et(null);
[
    0,
    30,
    60,
    90,
    120,
    150,
    180,
    210,
    240,
    270,
    300,
    330,
    360
].map((e) => `hsl(${e} 100% 50%)`).join(", ");
J("hsb", [
    0,
    100,
    100
]);
et(null);
J("hsb", [
    0,
    0,
    100
]);
et(null);
et(null);
et(null);
et(null);
et(null);
et(null);
Object.values({
    create: "@@mx-entity-picker:create",
    more: "@@mx-entity-picker:more",
    retry: "@@mx-entity-picker:retry"
});
et(null);
et(null);
et(!1);
et(null);
et(null);
et(null);
et(null);
et(null);

// app/main.tsx
function Counter() {
    const [count, setCount] = v$1(0);
    return i(oa, {
        title: "My first Mercury page",
        children: [i("p", {
            "aria-live": "polite",
            children: ["Count: ", count]
        }), i(Ht, {
            onClick: () => setCount(count + 1),
            children: "Increment"
        })]
    });
}

Y(i(Counter, {}), document.getElementById("app"));
