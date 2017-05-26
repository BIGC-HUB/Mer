(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e)
            }, l, l.exports, e, t, n, r)
        }
        return n[o].exports
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s
})({
    1: [function(require, module, exports) {
        // Enclose abbreviations in <abbr> tags
        //
        'use strict';


        module.exports = function sub_plugin(md) {
            var escapeRE = md.utils.escapeRE,
                arrayReplaceAt = md.utils.arrayReplaceAt;

            // ASCII characters in Cc, Sc, Sm, Sk categories we should terminate on;
            // you can check character classes here:
            // http://www.unicode.org/Public/UNIDATA/UnicodeData.txt
            var OTHER_CHARS = ' \r\n$+<=>^`|~';

            var UNICODE_PUNCT_RE = md.utils.lib.ucmicro.P.source;
            var UNICODE_SPACE_RE = md.utils.lib.ucmicro.Z.source;


            function abbr_def(state, startLine, endLine, silent) {
                var label, title, ch, labelStart, labelEnd,
                    pos = state.bMarks[startLine] + state.tShift[startLine],
                    max = state.eMarks[startLine];

                if (pos + 2 >= max) {
                    return false;
                }

                if (state.src.charCodeAt(pos++) !== 0x2A /* * */ ) {
                    return false;
                }
                if (state.src.charCodeAt(pos++) !== 0x5B /* [ */ ) {
                    return false;
                }

                labelStart = pos;

                for (; pos < max; pos++) {
                    ch = state.src.charCodeAt(pos);
                    if (ch === 0x5B /* [ */ ) {
                        return false;
                    } else if (ch === 0x5D /* ] */ ) {
                        labelEnd = pos;
                        break;
                    } else if (ch === 0x5C /* \ */ ) {
                        pos++;
                    }
                }

                if (labelEnd < 0 || state.src.charCodeAt(labelEnd + 1) !== 0x3A /* : */ ) {
                    return false;
                }

                if (silent) {
                    return true;
                }

                label = state.src.slice(labelStart, labelEnd).replace(/\\(.)/g, '$1');
                title = state.src.slice(labelEnd + 2, max).trim();
                if (label.length === 0) {
                    return false;
                }
                if (title.length === 0) {
                    return false;
                }
                if (!state.env.abbreviations) {
                    state.env.abbreviations = {};
                }
                // prepend ':' to avoid conflict with Object.prototype members
                if (typeof state.env.abbreviations[':' + label] === 'undefined') {
                    state.env.abbreviations[':' + label] = title;
                }

                state.line = startLine + 1;
                return true;
            }


            function abbr_replace(state) {
                var i, j, l, tokens, token, text, nodes, pos, reg, m, regText, regSimple,
                    currentToken,
                    blockTokens = state.tokens;

                if (!state.env.abbreviations) {
                    return;
                }

                regSimple = new RegExp('(?:' +
                    Object.keys(state.env.abbreviations).map(function(x) {
                        return x.substr(1);
                    }).sort(function(a, b) {
                        return b.length - a.length;
                    }).map(escapeRE).join('|') +
                    ')');

                regText = '(^|' + UNICODE_PUNCT_RE + '|' + UNICODE_SPACE_RE +
                    '|[' + OTHER_CHARS.split('').map(escapeRE).join('') + '])' +
                    '(' + Object.keys(state.env.abbreviations).map(function(x) {
                        return x.substr(1);
                    }).sort(function(a, b) {
                        return b.length - a.length;
                    }).map(escapeRE).join('|') + ')' +
                    '($|' + UNICODE_PUNCT_RE + '|' + UNICODE_SPACE_RE +
                    '|[' + OTHER_CHARS.split('').map(escapeRE).join('') + '])';

                reg = new RegExp(regText, 'g');

                for (j = 0, l = blockTokens.length; j < l; j++) {
                    if (blockTokens[j].type !== 'inline') {
                        continue;
                    }
                    tokens = blockTokens[j].children;

                    // We scan from the end, to keep position when new tags added.
                    for (i = tokens.length - 1; i >= 0; i--) {
                        currentToken = tokens[i];
                        if (currentToken.type !== 'text') {
                            continue;
                        }

                        pos = 0;
                        text = currentToken.content;
                        reg.lastIndex = 0;
                        nodes = [];

                        // fast regexp run to determine whether there are any abbreviated words
                        // in the current token
                        if (!regSimple.test(text)) {
                            continue;
                        }

                        while ((m = reg.exec(text))) {
                            if (m.index > 0 || m[1].length > 0) {
                                token = new state.Token('text', '', 0);
                                token.content = text.slice(pos, m.index + m[1].length);
                                nodes.push(token);
                            }

                            token = new state.Token('abbr_open', 'abbr', 1);
                            token.attrs = [
                                ['title', state.env.abbreviations[':' + m[2]]]
                            ];
                            nodes.push(token);

                            token = new state.Token('text', '', 0);
                            token.content = m[2];
                            nodes.push(token);

                            token = new state.Token('abbr_close', 'abbr', -1);
                            nodes.push(token);

                            reg.lastIndex -= m[3].length;
                            pos = reg.lastIndex;
                        }

                        if (!nodes.length) {
                            continue;
                        }

                        if (pos < text.length) {
                            token = new state.Token('text', '', 0);
                            token.content = text.slice(pos);
                            nodes.push(token);
                        }

                        // replace current node
                        blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
                    }
                }
            }

            md.block.ruler.before('reference', 'abbr_def', abbr_def, {
                alt: ['paragraph', 'reference']
            });

            md.core.ruler.after('linkify', 'abbr_replace', abbr_replace);
        };

    }, {}],
    2: [function(require, module, exports) {
        // Process block-level custom containers
        //
        'use strict';


        module.exports = function container_plugin(md, name, options) {

            function validateDefault(params) {
                return params.trim().split(' ', 2)[0] === name;
            }

            function renderDefault(tokens, idx, _options, env, self) {

                // add a class to the opening tag
                if (tokens[idx].nesting === 1) {
                    tokens[idx].attrPush(['class', name]);
                }

                return self.renderToken(tokens, idx, _options, env, self);
            }

            options = options || {};

            var min_markers = 3,
                marker_str = options.marker || ':',
                marker_char = marker_str.charCodeAt(0),
                marker_len = marker_str.length,
                validate = options.validate || validateDefault,
                render = options.render || renderDefault;

            function container(state, startLine, endLine, silent) {
                var pos, nextLine, marker_count, markup, params, token,
                    old_parent, old_line_max,
                    auto_closed = false,
                    start = state.bMarks[startLine] + state.tShift[startLine],
                    max = state.eMarks[startLine];

                // Check out the first character quickly,
                // this should filter out most of non-containers
                //
                if (marker_char !== state.src.charCodeAt(start)) {
                    return false;
                }

                // Check out the rest of the marker string
                //
                for (pos = start + 1; pos <= max; pos++) {
                    if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
                        break;
                    }
                }

                marker_count = Math.floor((pos - start) / marker_len);
                if (marker_count < min_markers) {
                    return false;
                }
                pos -= (pos - start) % marker_len;

                markup = state.src.slice(start, pos);
                params = state.src.slice(pos, max);
                if (!validate(params)) {
                    return false;
                }

                // Since start is found, we can report success here in validation mode
                //
                if (silent) {
                    return true;
                }

                // Search for the end of the block
                //
                nextLine = startLine;

                for (;;) {
                    nextLine++;
                    if (nextLine >= endLine) {
                        // unclosed block should be autoclosed by end of document.
                        // also block seems to be autoclosed by end of parent
                        break;
                    }

                    start = state.bMarks[nextLine] + state.tShift[nextLine];
                    max = state.eMarks[nextLine];

                    if (start < max && state.sCount[nextLine] < state.blkIndent) {
                        // non-empty line with negative indent should stop the list:
                        // - ```
                        //  test
                        break;
                    }

                    if (marker_char !== state.src.charCodeAt(start)) {
                        continue;
                    }

                    if (state.sCount[nextLine] - state.blkIndent >= 4) {
                        // closing fence should be indented less than 4 spaces
                        continue;
                    }

                    for (pos = start + 1; pos <= max; pos++) {
                        if (marker_str[(pos - start) % marker_len] !== state.src[pos]) {
                            break;
                        }
                    }

                    // closing code fence must be at least as long as the opening one
                    if (Math.floor((pos - start) / marker_len) < marker_count) {
                        continue;
                    }

                    // make sure tail has spaces only
                    pos -= (pos - start) % marker_len;
                    pos = state.skipSpaces(pos);

                    if (pos < max) {
                        continue;
                    }

                    // found!
                    auto_closed = true;
                    break;
                }

                old_parent = state.parentType;
                old_line_max = state.lineMax;
                state.parentType = 'container';

                // this will prevent lazy continuations from ever going past our end marker
                state.lineMax = nextLine;

                token = state.push('container_' + name + '_open', 'div', 1);
                token.markup = markup;
                token.block = true;
                token.info = params;
                token.map = [startLine, nextLine];

                state.md.block.tokenize(state, startLine + 1, nextLine);

                token = state.push('container_' + name + '_close', 'div', -1);
                token.markup = state.src.slice(start, pos);
                token.block = true;

                state.parentType = old_parent;
                state.lineMax = old_line_max;
                state.line = nextLine + (auto_closed ? 1 : 0);

                return true;
            }

            md.block.ruler.before('fence', 'container_' + name, container, {
                alt: ['paragraph', 'reference', 'blockquote', 'list']
            });
            md.renderer.rules['container_' + name + '_open'] = render;
            md.renderer.rules['container_' + name + '_close'] = render;
        };

    }, {}],
    3: [function(require, module, exports) {
        // Process definition lists
        //
        'use strict';


        module.exports = function deflist_plugin(md) {
            var isSpace = md.utils.isSpace;

            // Search `[:~][\n ]`, returns next pos after marker on success
            // or -1 on fail.
            function skipMarker(state, line) {
                var pos, marker,
                    start = state.bMarks[line] + state.tShift[line],
                    max = state.eMarks[line];

                if (start >= max) {
                    return -1;
                }

                // Check bullet
                marker = state.src.charCodeAt(start++);
                if (marker !== 0x7E /* ~ */ && marker !== 0x3A /* : */ ) {
                    return -1;
                }

                pos = state.skipSpaces(start);

                // require space after ":"
                if (start === pos) {
                    return -1;
                }

                // no empty definitions, e.g. "  : "
                if (pos >= max) {
                    return -1;
                }

                return start;
            }

            function markTightParagraphs(state, idx) {
                var i, l,
                    level = state.level + 2;

                for (i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
                    if (state.tokens[i].level === level && state.tokens[i].type === 'paragraph_open') {
                        state.tokens[i + 2].hidden = true;
                        state.tokens[i].hidden = true;
                        i += 2;
                    }
                }
            }

            function deflist(state, startLine, endLine, silent) {
                var ch,
                    contentStart,
                    ddLine,
                    dtLine,
                    itemLines,
                    listLines,
                    listTokIdx,
                    max,
                    nextLine,
                    offset,
                    oldDDIndent,
                    oldIndent,
                    oldParentType,
                    oldSCount,
                    oldTShift,
                    oldTight,
                    pos,
                    prevEmptyEnd,
                    tight,
                    token;

                if (silent) {
                    // quirk: validation mode validates a dd block only, not a whole deflist
                    if (state.ddIndent < 0) {
                        return false;
                    }
                    return skipMarker(state, startLine) >= 0;
                }

                nextLine = startLine + 1;
                if (state.isEmpty(nextLine)) {
                    if (++nextLine > endLine) {
                        return false;
                    }
                }

                if (state.sCount[nextLine] < state.blkIndent) {
                    return false;
                }
                contentStart = skipMarker(state, nextLine);
                if (contentStart < 0) {
                    return false;
                }

                // Start list
                listTokIdx = state.tokens.length;
                tight = true;

                token = state.push('dl_open', 'dl', 1);
                token.map = listLines = [startLine, 0];

                //
                // Iterate list items
                //

                dtLine = startLine;
                ddLine = nextLine;

                // One definition list can contain multiple DTs,
                // and one DT can be followed by multiple DDs.
                //
                // Thus, there is two loops here, and label is
                // needed to break out of the second one
                //
                /*eslint no-labels:0,block-scoped-var:0*/
                OUTER:
                    for (;;) {
                        prevEmptyEnd = false;

                        token = state.push('dt_open', 'dt', 1);
                        token.map = [dtLine, dtLine];

                        token = state.push('inline', '', 0);
                        token.map = [dtLine, dtLine];
                        token.content = state.getLines(dtLine, dtLine + 1, state.blkIndent, false).trim();
                        token.children = [];

                        token = state.push('dt_close', 'dt', -1);

                        for (;;) {
                            token = state.push('dd_open', 'dd', 1);
                            token.map = itemLines = [nextLine, 0];

                            pos = contentStart;
                            max = state.eMarks[ddLine];
                            offset = state.sCount[ddLine] + contentStart - (state.bMarks[ddLine] + state.tShift[ddLine]);

                            while (pos < max) {
                                ch = state.src.charCodeAt(pos);

                                if (isSpace(ch)) {
                                    if (ch === 0x09) {
                                        offset += 4 - offset % 4;
                                    } else {
                                        offset++;
                                    }
                                } else {
                                    break;
                                }

                                pos++;
                            }

                            contentStart = pos;

                            oldTight = state.tight;
                            oldDDIndent = state.ddIndent;
                            oldIndent = state.blkIndent;
                            oldTShift = state.tShift[ddLine];
                            oldSCount = state.sCount[ddLine];
                            oldParentType = state.parentType;
                            state.blkIndent = state.ddIndent = state.sCount[ddLine] + 2;
                            state.tShift[ddLine] = contentStart - state.bMarks[ddLine];
                            state.sCount[ddLine] = offset;
                            state.tight = true;
                            state.parentType = 'deflist';

                            state.md.block.tokenize(state, ddLine, endLine, true);

                            // If any of list item is tight, mark list as tight
                            if (!state.tight || prevEmptyEnd) {
                                tight = false;
                            }
                            // Item become loose if finish with empty line,
                            // but we should filter last element, because it means list finish
                            prevEmptyEnd = (state.line - ddLine) > 1 && state.isEmpty(state.line - 1);

                            state.tShift[ddLine] = oldTShift;
                            state.sCount[ddLine] = oldSCount;
                            state.tight = oldTight;
                            state.parentType = oldParentType;
                            state.blkIndent = oldIndent;
                            state.ddIndent = oldDDIndent;

                            token = state.push('dd_close', 'dd', -1);

                            itemLines[1] = nextLine = state.line;

                            if (nextLine >= endLine) {
                                break OUTER;
                            }

                            if (state.sCount[nextLine] < state.blkIndent) {
                                break OUTER;
                            }
                            contentStart = skipMarker(state, nextLine);
                            if (contentStart < 0) {
                                break;
                            }

                            ddLine = nextLine;

                            // go to the next loop iteration:
                            // insert DD tag and repeat checking
                        }

                        if (nextLine >= endLine) {
                            break;
                        }
                        dtLine = nextLine;

                        if (state.isEmpty(dtLine)) {
                            break;
                        }
                        if (state.sCount[dtLine] < state.blkIndent) {
                            break;
                        }

                        ddLine = dtLine + 1;
                        if (ddLine >= endLine) {
                            break;
                        }
                        if (state.isEmpty(ddLine)) {
                            ddLine++;
                        }
                        if (ddLine >= endLine) {
                            break;
                        }

                        if (state.sCount[ddLine] < state.blkIndent) {
                            break;
                        }
                        contentStart = skipMarker(state, ddLine);
                        if (contentStart < 0) {
                            break;
                        }

                        // go to the next loop iteration:
                        // insert DT and DD tags and repeat checking
                    }

                // Finilize list
                token = state.push('dl_close', 'dl', -1);

                listLines[1] = nextLine;

                state.line = nextLine;

                // mark paragraphs tight if needed
                if (tight) {
                    markTightParagraphs(state, listTokIdx);
                }

                return true;
            }


            md.block.ruler.before('paragraph', 'deflist', deflist, {
                alt: ['paragraph', 'reference']
            });
        };

    }, {}],
    4: [function(require, module, exports) {
        'use strict';


        var emojies_defs = require('./lib/data/full.json');
        var emojies_shortcuts = require('./lib/data/shortcuts');
        var emoji_html = require('./lib/render');
        var emoji_replace = require('./lib/replace');
        var normalize_opts = require('./lib/normalize_opts');


        module.exports = function emoji_plugin(md, options) {
            var defaults = {
                defs: emojies_defs,
                shortcuts: emojies_shortcuts,
                enabled: []
            };

            var opts = normalize_opts(md.utils.assign({}, defaults, options || {}));

            md.renderer.rules.emoji = emoji_html;

            md.core.ruler.push('emoji', emoji_replace(md, opts.defs, opts.shortcuts, opts.scanRE, opts.replaceRE));
        };

    }, {}],
    5: [function(require, module, exports) {
        // Process footnotes
        //
        'use strict';

        ////////////////////////////////////////////////////////////////////////////////
        // Renderer partials

        function render_footnote_anchor_name(tokens, idx, options, env /*, slf*/ ) {
            var n = Number(tokens[idx].meta.id + 1).toString();
            var prefix = '';

            if (typeof env.docId === 'string') {
                prefix = '-' + env.docId + '-';
            }

            return prefix + n;
        }

        function render_footnote_caption(tokens, idx /*, options, env, slf*/ ) {
            var n = Number(tokens[idx].meta.id + 1).toString();

            if (tokens[idx].meta.subId > 0) {
                n += ':' + tokens[idx].meta.subId;
            }

            return '[' + n + ']';
        }

        function render_footnote_ref(tokens, idx, options, env, slf) {
            var id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
            var caption = slf.rules.footnote_caption(tokens, idx, options, env, slf);
            var refid = id;

            if (tokens[idx].meta.subId > 0) {
                refid += ':' + tokens[idx].meta.subId;
            }

            return '<sup class="footnote-ref"><a href="#fn' + id + '" id="fnref' + refid + '">' + caption + '</a></sup>';
        }

        function render_footnote_block_open(tokens, idx, options) {
            return (options.xhtmlOut ? '<hr class="footnotes-sep" />\n' : '<hr class="footnotes-sep">\n') +
                '<section class="footnotes">\n' +
                '<ol class="footnotes-list">\n';
        }

        function render_footnote_block_close() {
            return '</ol>\n</section>\n';
        }

        function render_footnote_open(tokens, idx, options, env, slf) {
            var id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);

            if (tokens[idx].meta.subId > 0) {
                id += ':' + tokens[idx].meta.subId;
            }

            return '<li id="fn' + id + '" class="footnote-item">';
        }

        function render_footnote_close() {
            return '</li>\n';
        }

        function render_footnote_anchor(tokens, idx, options, env, slf) {
            var id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);

            if (tokens[idx].meta.subId > 0) {
                id += ':' + tokens[idx].meta.subId;
            }

            /* ↩ with escape code to prevent display as Apple Emoji on iOS */
            return ' <a href="#fnref' + id + '" class="footnote-backref">\u21a9\uFE0E</a>';
        }


        module.exports = function footnote_plugin(md) {
            var parseLinkLabel = md.helpers.parseLinkLabel,
                isSpace = md.utils.isSpace;

            md.renderer.rules.footnote_ref = render_footnote_ref;
            md.renderer.rules.footnote_block_open = render_footnote_block_open;
            md.renderer.rules.footnote_block_close = render_footnote_block_close;
            md.renderer.rules.footnote_open = render_footnote_open;
            md.renderer.rules.footnote_close = render_footnote_close;
            md.renderer.rules.footnote_anchor = render_footnote_anchor;

            // helpers (only used in other rules, no tokens are attached to those)
            md.renderer.rules.footnote_caption = render_footnote_caption;
            md.renderer.rules.footnote_anchor_name = render_footnote_anchor_name;

            // Process footnote block definition
            function footnote_def(state, startLine, endLine, silent) {
                var oldBMark, oldTShift, oldSCount, oldParentType, pos, label, token,
                    initial, offset, ch, posAfterColon,
                    start = state.bMarks[startLine] + state.tShift[startLine],
                    max = state.eMarks[startLine];

                // line should be at least 5 chars - "[^x]:"
                if (start + 4 > max) {
                    return false;
                }

                if (state.src.charCodeAt(start) !== 0x5B /* [ */ ) {
                    return false;
                }
                if (state.src.charCodeAt(start + 1) !== 0x5E /* ^ */ ) {
                    return false;
                }

                for (pos = start + 2; pos < max; pos++) {
                    if (state.src.charCodeAt(pos) === 0x20) {
                        return false;
                    }
                    if (state.src.charCodeAt(pos) === 0x5D /* ] */ ) {
                        break;
                    }
                }

                if (pos === start + 2) {
                    return false;
                } // no empty footnote labels
                if (pos + 1 >= max || state.src.charCodeAt(++pos) !== 0x3A /* : */ ) {
                    return false;
                }
                if (silent) {
                    return true;
                }
                pos++;

                if (!state.env.footnotes) {
                    state.env.footnotes = {};
                }
                if (!state.env.footnotes.refs) {
                    state.env.footnotes.refs = {};
                }
                label = state.src.slice(start + 2, pos - 2);
                state.env.footnotes.refs[':' + label] = -1;

                token = new state.Token('footnote_reference_open', '', 1);
                token.meta = {
                    label: label
                };
                token.level = state.level++;
                state.tokens.push(token);

                oldBMark = state.bMarks[startLine];
                oldTShift = state.tShift[startLine];
                oldSCount = state.sCount[startLine];
                oldParentType = state.parentType;

                posAfterColon = pos;
                initial = offset = state.sCount[startLine] + pos - (state.bMarks[startLine] + state.tShift[startLine]);

                while (pos < max) {
                    ch = state.src.charCodeAt(pos);

                    if (isSpace(ch)) {
                        if (ch === 0x09) {
                            offset += 4 - offset % 4;
                        } else {
                            offset++;
                        }
                    } else {
                        break;
                    }

                    pos++;
                }

                state.tShift[startLine] = pos - posAfterColon;
                state.sCount[startLine] = offset - initial;

                state.bMarks[startLine] = posAfterColon;
                state.blkIndent += 4;
                state.parentType = 'footnote';

                if (state.sCount[startLine] < state.blkIndent) {
                    state.sCount[startLine] += state.blkIndent;
                }

                state.md.block.tokenize(state, startLine, endLine, true);

                state.parentType = oldParentType;
                state.blkIndent -= 4;
                state.tShift[startLine] = oldTShift;
                state.sCount[startLine] = oldSCount;
                state.bMarks[startLine] = oldBMark;

                token = new state.Token('footnote_reference_close', '', -1);
                token.level = --state.level;
                state.tokens.push(token);

                return true;
            }

            // Process inline footnotes (^[...])
            function footnote_inline(state, silent) {
                var labelStart,
                    labelEnd,
                    footnoteId,
                    token,
                    tokens,
                    max = state.posMax,
                    start = state.pos;

                if (start + 2 >= max) {
                    return false;
                }
                if (state.src.charCodeAt(start) !== 0x5E /* ^ */ ) {
                    return false;
                }
                if (state.src.charCodeAt(start + 1) !== 0x5B /* [ */ ) {
                    return false;
                }

                labelStart = start + 2;
                labelEnd = parseLinkLabel(state, start + 1);

                // parser failed to find ']', so it's not a valid note
                if (labelEnd < 0) {
                    return false;
                }

                // We found the end of the link, and know for a fact it's a valid link;
                // so all that's left to do is to call tokenizer.
                //
                if (!silent) {
                    if (!state.env.footnotes) {
                        state.env.footnotes = {};
                    }
                    if (!state.env.footnotes.list) {
                        state.env.footnotes.list = [];
                    }
                    footnoteId = state.env.footnotes.list.length;

                    state.md.inline.parse(
                        state.src.slice(labelStart, labelEnd),
                        state.md,
                        state.env,
                        tokens = []
                    );

                    token = state.push('footnote_ref', '', 0);
                    token.meta = {
                        id: footnoteId
                    };

                    state.env.footnotes.list[footnoteId] = {
                        tokens: tokens
                    };
                }

                state.pos = labelEnd + 1;
                state.posMax = max;
                return true;
            }

            // Process footnote references ([^...])
            function footnote_ref(state, silent) {
                var label,
                    pos,
                    footnoteId,
                    footnoteSubId,
                    token,
                    max = state.posMax,
                    start = state.pos;

                // should be at least 4 chars - "[^x]"
                if (start + 3 > max) {
                    return false;
                }

                if (!state.env.footnotes || !state.env.footnotes.refs) {
                    return false;
                }
                if (state.src.charCodeAt(start) !== 0x5B /* [ */ ) {
                    return false;
                }
                if (state.src.charCodeAt(start + 1) !== 0x5E /* ^ */ ) {
                    return false;
                }

                for (pos = start + 2; pos < max; pos++) {
                    if (state.src.charCodeAt(pos) === 0x20) {
                        return false;
                    }
                    if (state.src.charCodeAt(pos) === 0x0A) {
                        return false;
                    }
                    if (state.src.charCodeAt(pos) === 0x5D /* ] */ ) {
                        break;
                    }
                }

                if (pos === start + 2) {
                    return false;
                } // no empty footnote labels
                if (pos >= max) {
                    return false;
                }
                pos++;

                label = state.src.slice(start + 2, pos - 1);
                if (typeof state.env.footnotes.refs[':' + label] === 'undefined') {
                    return false;
                }

                if (!silent) {
                    if (!state.env.footnotes.list) {
                        state.env.footnotes.list = [];
                    }

                    if (state.env.footnotes.refs[':' + label] < 0) {
                        footnoteId = state.env.footnotes.list.length;
                        state.env.footnotes.list[footnoteId] = {
                            label: label,
                            count: 0
                        };
                        state.env.footnotes.refs[':' + label] = footnoteId;
                    } else {
                        footnoteId = state.env.footnotes.refs[':' + label];
                    }

                    footnoteSubId = state.env.footnotes.list[footnoteId].count;
                    state.env.footnotes.list[footnoteId].count++;

                    token = state.push('footnote_ref', '', 0);
                    token.meta = {
                        id: footnoteId,
                        subId: footnoteSubId,
                        label: label
                    };
                }

                state.pos = pos;
                state.posMax = max;
                return true;
            }

            // Glue footnote tokens to end of token stream
            function footnote_tail(state) {
                var i, l, j, t, lastParagraph, list, token, tokens, current, currentLabel,
                    insideRef = false,
                    refTokens = {};

                if (!state.env.footnotes) {
                    return;
                }

                state.tokens = state.tokens.filter(function(tok) {
                    if (tok.type === 'footnote_reference_open') {
                        insideRef = true;
                        current = [];
                        currentLabel = tok.meta.label;
                        return false;
                    }
                    if (tok.type === 'footnote_reference_close') {
                        insideRef = false;
                        // prepend ':' to avoid conflict with Object.prototype members
                        refTokens[':' + currentLabel] = current;
                        return false;
                    }
                    if (insideRef) {
                        current.push(tok);
                    }
                    return !insideRef;
                });

                if (!state.env.footnotes.list) {
                    return;
                }
                list = state.env.footnotes.list;

                token = new state.Token('footnote_block_open', '', 1);
                state.tokens.push(token);

                for (i = 0, l = list.length; i < l; i++) {
                    token = new state.Token('footnote_open', '', 1);
                    token.meta = {
                        id: i,
                        label: list[i].label
                    };
                    state.tokens.push(token);

                    if (list[i].tokens) {
                        tokens = [];

                        token = new state.Token('paragraph_open', 'p', 1);
                        token.block = true;
                        tokens.push(token);

                        token = new state.Token('inline', '', 0);
                        token.children = list[i].tokens;
                        token.content = '';
                        tokens.push(token);

                        token = new state.Token('paragraph_close', 'p', -1);
                        token.block = true;
                        tokens.push(token);

                    } else if (list[i].label) {
                        tokens = refTokens[':' + list[i].label];
                    }

                    state.tokens = state.tokens.concat(tokens);
                    if (state.tokens[state.tokens.length - 1].type === 'paragraph_close') {
                        lastParagraph = state.tokens.pop();
                    } else {
                        lastParagraph = null;
                    }

                    t = list[i].count > 0 ? list[i].count : 1;
                    for (j = 0; j < t; j++) {
                        token = new state.Token('footnote_anchor', '', 0);
                        token.meta = {
                            id: i,
                            subId: j,
                            label: list[i].label
                        };
                        state.tokens.push(token);
                    }

                    if (lastParagraph) {
                        state.tokens.push(lastParagraph);
                    }

                    token = new state.Token('footnote_close', '', -1);
                    state.tokens.push(token);
                }

                token = new state.Token('footnote_block_close', '', -1);
                state.tokens.push(token);
            }

            md.block.ruler.before('reference', 'footnote_def', footnote_def, {
                alt: ['paragraph', 'reference']
            });
            md.inline.ruler.after('image', 'footnote_inline', footnote_inline);
            md.inline.ruler.after('footnote_inline', 'footnote_ref', footnote_ref);
            md.core.ruler.after('inline', 'footnote_tail', footnote_tail);
        };

    }, {}],
    6: [function(require, module, exports) {
        'use strict';


        module.exports = function ins_plugin(md) {
            // Insert each marker as a separate text token, and add it to delimiter list
            //
            function tokenize(state, silent) {
                var i, scanned, token, len, ch,
                    start = state.pos,
                    marker = state.src.charCodeAt(start);

                if (silent) {
                    return false;
                }

                if (marker !== 0x2B /* + */ ) {
                    return false;
                }

                scanned = state.scanDelims(state.pos, true);
                len = scanned.length;
                ch = String.fromCharCode(marker);

                if (len < 2) {
                    return false;
                }

                if (len % 2) {
                    token = state.push('text', '', 0);
                    token.content = ch;
                    len--;
                }

                for (i = 0; i < len; i += 2) {
                    token = state.push('text', '', 0);
                    token.content = ch + ch;

                    state.delimiters.push({
                        marker: marker,
                        jump: i,
                        token: state.tokens.length - 1,
                        level: state.level,
                        end: -1,
                        open: scanned.can_open,
                        close: scanned.can_close
                    });
                }

                state.pos += scanned.length;

                return true;
            }


            // Walk through delimiter list and replace text tokens with tags
            //
            function postProcess(state) {
                var i, j,
                    startDelim,
                    endDelim,
                    token,
                    loneMarkers = [],
                    delimiters = state.delimiters,
                    max = state.delimiters.length;

                for (i = 0; i < max; i++) {
                    startDelim = delimiters[i];

                    if (startDelim.marker !== 0x2B /* + */ ) {
                        continue;
                    }

                    if (startDelim.end === -1) {
                        continue;
                    }

                    endDelim = delimiters[startDelim.end];

                    token = state.tokens[startDelim.token];
                    token.type = 'ins_open';
                    token.tag = 'ins';
                    token.nesting = 1;
                    token.markup = '++';
                    token.content = '';

                    token = state.tokens[endDelim.token];
                    token.type = 'ins_close';
                    token.tag = 'ins';
                    token.nesting = -1;
                    token.markup = '++';
                    token.content = '';

                    if (state.tokens[endDelim.token - 1].type === 'text' &&
                        state.tokens[endDelim.token - 1].content === '+') {

                        loneMarkers.push(endDelim.token - 1);
                    }
                }

                // If a marker sequence has an odd number of characters, it's splitted
                // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
                // start of the sequence.
                //
                // So, we have to move all those markers after subsequent s_close tags.
                //
                while (loneMarkers.length) {
                    i = loneMarkers.pop();
                    j = i + 1;

                    while (j < state.tokens.length && state.tokens[j].type === 'ins_close') {
                        j++;
                    }

                    j--;

                    if (i !== j) {
                        token = state.tokens[j];
                        state.tokens[j] = state.tokens[i];
                        state.tokens[i] = token;
                    }
                }
            }

            md.inline.ruler.before('emphasis', 'ins', tokenize);
            md.inline.ruler2.before('emphasis', 'ins', postProcess);
        };

    }, {}],
    7: [function(require, module, exports) {
        'use strict';


        module.exports = function ins_plugin(md) {
            // Insert each marker as a separate text token, and add it to delimiter list
            //
            function tokenize(state, silent) {
                var i, scanned, token, len, ch,
                    start = state.pos,
                    marker = state.src.charCodeAt(start);

                if (silent) {
                    return false;
                }

                if (marker !== 0x3D /* = */ ) {
                    return false;
                }

                scanned = state.scanDelims(state.pos, true);
                len = scanned.length;
                ch = String.fromCharCode(marker);

                if (len < 2) {
                    return false;
                }

                if (len % 2) {
                    token = state.push('text', '', 0);
                    token.content = ch;
                    len--;
                }

                for (i = 0; i < len; i += 2) {
                    token = state.push('text', '', 0);
                    token.content = ch + ch;

                    state.delimiters.push({
                        marker: marker,
                        jump: i,
                        token: state.tokens.length - 1,
                        level: state.level,
                        end: -1,
                        open: scanned.can_open,
                        close: scanned.can_close
                    });
                }

                state.pos += scanned.length;

                return true;
            }


            // Walk through delimiter list and replace text tokens with tags
            //
            function postProcess(state) {
                var i, j,
                    startDelim,
                    endDelim,
                    token,
                    loneMarkers = [],
                    delimiters = state.delimiters,
                    max = state.delimiters.length;

                for (i = 0; i < max; i++) {
                    startDelim = delimiters[i];

                    if (startDelim.marker !== 0x3D /* = */ ) {
                        continue;
                    }

                    if (startDelim.end === -1) {
                        continue;
                    }

                    endDelim = delimiters[startDelim.end];

                    token = state.tokens[startDelim.token];
                    token.type = 'mark_open';
                    token.tag = 'mark';
                    token.nesting = 1;
                    token.markup = '==';
                    token.content = '';

                    token = state.tokens[endDelim.token];
                    token.type = 'mark_close';
                    token.tag = 'mark';
                    token.nesting = -1;
                    token.markup = '==';
                    token.content = '';

                    if (state.tokens[endDelim.token - 1].type === 'text' &&
                        state.tokens[endDelim.token - 1].content === '=') {

                        loneMarkers.push(endDelim.token - 1);
                    }
                }

                // If a marker sequence has an odd number of characters, it's splitted
                // like this: `~~~~~` -> `~` + `~~` + `~~`, leaving one marker at the
                // start of the sequence.
                //
                // So, we have to move all those markers after subsequent s_close tags.
                //
                while (loneMarkers.length) {
                    i = loneMarkers.pop();
                    j = i + 1;

                    while (j < state.tokens.length && state.tokens[j].type === 'mark_close') {
                        j++;
                    }

                    j--;

                    if (i !== j) {
                        token = state.tokens[j];
                        state.tokens[j] = state.tokens[i];
                        state.tokens[i] = token;
                    }
                }
            }

            md.inline.ruler.before('emphasis', 'mark', tokenize);
            md.inline.ruler2.before('emphasis', 'mark', postProcess);
        };

    }, {}],
    8: [function(require, module, exports) {
        // Process ~subscript~

        'use strict';

        // same as UNESCAPE_MD_RE plus a space
        var UNESCAPE_RE = /\\([ \\!"#$%&'()*+,.\/:;<=>?@[\]^_`{|}~-])/g;


        function subscript(state, silent) {
            var found,
                content,
                token,
                max = state.posMax,
                start = state.pos;

            if (state.src.charCodeAt(start) !== 0x7E /* ~ */ ) {
                return false;
            }
            if (silent) {
                return false;
            } // don't run any pairs in validation mode
            if (start + 2 >= max) {
                return false;
            }

            state.pos = start + 1;

            while (state.pos < max) {
                if (state.src.charCodeAt(state.pos) === 0x7E /* ~ */ ) {
                    found = true;
                    break;
                }

                state.md.inline.skipToken(state);
            }

            if (!found || start + 1 === state.pos) {
                state.pos = start;
                return false;
            }

            content = state.src.slice(start + 1, state.pos);

            // don't allow unescaped spaces/newlines inside
            if (content.match(/(^|[^\\])(\\\\)*\s/)) {
                state.pos = start;
                return false;
            }

            // found!
            state.posMax = state.pos;
            state.pos = start + 1;

            // Earlier we checked !silent, but this implementation does not need it
            token = state.push('sub_open', 'sub', 1);
            token.markup = '~';

            token = state.push('text', '', 0);
            token.content = content.replace(UNESCAPE_RE, '$1');

            token = state.push('sub_close', 'sub', -1);
            token.markup = '~';

            state.pos = state.posMax + 1;
            state.posMax = max;
            return true;
        }


        module.exports = function sub_plugin(md) {
            md.inline.ruler.after('emphasis', 'sub', subscript);
        };

    }, {}],
    9: [function(require, module, exports) {
        // Process ^superscript^

        'use strict';

        // same as UNESCAPE_MD_RE plus a space
        var UNESCAPE_RE = /\\([ \\!"#$%&'()*+,.\/:;<=>?@[\]^_`{|}~-])/g;

        function superscript(state, silent) {
            var found,
                content,
                token,
                max = state.posMax,
                start = state.pos;

            if (state.src.charCodeAt(start) !== 0x5E /* ^ */ ) {
                return false;
            }
            if (silent) {
                return false;
            } // don't run any pairs in validation mode
            if (start + 2 >= max) {
                return false;
            }

            state.pos = start + 1;

            while (state.pos < max) {
                if (state.src.charCodeAt(state.pos) === 0x5E /* ^ */ ) {
                    found = true;
                    break;
                }

                state.md.inline.skipToken(state);
            }

            if (!found || start + 1 === state.pos) {
                state.pos = start;
                return false;
            }

            content = state.src.slice(start + 1, state.pos);

            // don't allow unescaped spaces/newlines inside
            if (content.match(/(^|[^\\])(\\\\)*\s/)) {
                state.pos = start;
                return false;
            }

            // found!
            state.posMax = state.pos;
            state.pos = start + 1;

            // Earlier we checked !silent, but this implementation does not need it
            token = state.push('sup_open', 'sup', 1);
            token.markup = '^';

            token = state.push('text', '', 0);
            token.content = content.replace(UNESCAPE_RE, '$1');

            token = state.push('sup_close', 'sup', -1);
            token.markup = '^';

            state.pos = state.posMax + 1;
            state.posMax = max;
            return true;
        }


        module.exports = function sup_plugin(md) {
            md.inline.ruler.after('emphasis', 'sup', superscript);
        };

    }, {}],
    10: [function(require, module, exports) {
        module.exports = {
            "100": "💯",
            "1234": "🔢",
            "grinning": "😀",
            "grimacing": "😬",
            "grin": "😁",
            "joy": "😂",
            "smiley": "😃",
            "smile": "😄",
            "sweat_smile": "😅",
            "laughing": "😆",
            "satisfied": "😆",
            "innocent": "😇",
            "wink": "😉",
            "blush": "😊",
            "slightly_smiling_face": "🙂",
            "upside_down_face": "🙃",
            "relaxed": "☺️",
            "yum": "😋",
            "relieved": "😌",
            "heart_eyes": "😍",
            "kissing_heart": "😘",
            "kissing": "😗",
            "kissing_smiling_eyes": "😙",
            "kissing_closed_eyes": "😚",
            "stuck_out_tongue_winking_eye": "😜",
            "stuck_out_tongue_closed_eyes": "😝",
            "stuck_out_tongue": "😛",
            "money_mouth_face": "🤑",
            "nerd_face": "🤓",
            "sunglasses": "😎",
            "hugs": "🤗",
            "smirk": "😏",
            "no_mouth": "😶",
            "neutral_face": "😐",
            "expressionless": "😑",
            "unamused": "😒",
            "roll_eyes": "🙄",
            "thinking": "🤔",
            "flushed": "😳",
            "disappointed": "😞",
            "worried": "😟",
            "angry": "😠",
            "rage": "😡",
            "pout": "😡",
            "pensive": "😔",
            "confused": "😕",
            "slightly_frowning_face": "🙁",
            "frowning_face": "☹️",
            "persevere": "😣",
            "confounded": "😖",
            "tired_face": "😫",
            "weary": "😩",
            "triumph": "😤",
            "open_mouth": "😮",
            "scream": "😱",
            "fearful": "😨",
            "cold_sweat": "😰",
            "hushed": "😯",
            "frowning": "😦",
            "anguished": "😧",
            "cry": "😢",
            "disappointed_relieved": "😥",
            "sleepy": "😪",
            "sweat": "😓",
            "sob": "😭",
            "dizzy_face": "😵",
            "astonished": "😲",
            "zipper_mouth_face": "🤐",
            "mask": "😷",
            "face_with_thermometer": "🤒",
            "face_with_head_bandage": "🤕",
            "sleeping": "😴",
            "zzz": "💤",
            "hankey": "💩",
            "poop": "💩",
            "shit": "💩",
            "smiling_imp": "😈",
            "imp": "👿",
            "japanese_ogre": "👹",
            "japanese_goblin": "👺",
            "ghost": "👻",
            "skull": "💀",
            "skull_and_crossbones": "☠️",
            "alien": "👽",
            "space_invader": "👾",
            "robot": "🤖",
            "smiley_cat": "😺",
            "smile_cat": "😸",
            "joy_cat": "😹",
            "heart_eyes_cat": "😻",
            "smirk_cat": "😼",
            "kissing_cat": "😽",
            "scream_cat": "🙀",
            "crying_cat_face": "😿",
            "pouting_cat": "😾",
            "raised_hands": "🙌",
            "clap": "👏",
            "+1": "👍",
            "thumbsup": "👍",
            "-1": "👎",
            "thumbsdown": "👎",
            "facepunch": "👊",
            "punch": "👊",
            "fist": "✊",
            "wave": "👋",
            "point_left": "👈",
            "point_right": "👉",
            "point_up_2": "👆",
            "point_down": "👇",
            "ok_hand": "👌",
            "point_up": "☝️",
            "v": "✌️",
            "hand": "✋",
            "raised_hand": "✋",
            "raised_hand_with_fingers_splayed": "🖐",
            "open_hands": "👐",
            "muscle": "💪",
            "pray": "🙏",
            "vulcan_salute": "🖖",
            "metal": "🤘",
            "middle_finger": "🖕",
            "fu": "🖕",
            "writing_hand": "✍️",
            "nail_care": "💅",
            "lips": "👄",
            "tongue": "👅",
            "ear": "👂",
            "nose": "👃",
            "eye": "👁",
            "eyes": "👀",
            "speaking_head": "🗣",
            "bust_in_silhouette": "👤",
            "busts_in_silhouette": "👥",
            "baby": "👶",
            "boy": "👦",
            "girl": "👧",
            "man": "👨",
            "woman": "👩",
            "blonde_woman": "👱‍♀️",
            "blonde_man": "👱",
            "person_with_blond_hair": "👱",
            "older_man": "👴",
            "older_woman": "👵",
            "man_with_gua_pi_mao": "👲",
            "woman_with_turban": "👳‍♀️",
            "man_with_turban": "👳",
            "policewoman": "👮‍♀️",
            "policeman": "👮",
            "cop": "👮",
            "construction_worker_woman": "👷‍♀️",
            "construction_worker_man": "👷",
            "construction_worker": "👷",
            "guardswoman": "💂‍♀️",
            "guardsman": "💂",
            "female_detective": "🕵️‍♀️",
            "male_detective": "🕵️",
            "detective": "🕵️",
            "santa": "🎅",
            "princess": "👸",
            "bride_with_veil": "👰",
            "angel": "👼",
            "bowing_woman": "🙇‍♀️",
            "bowing_man": "🙇",
            "bow": "🙇",
            "tipping_hand_woman": "💁",
            "information_desk_person": "💁",
            "tipping_hand_man": "💁‍♂️",
            "no_good_woman": "🙅",
            "no_good": "🙅",
            "ng_woman": "🙅",
            "no_good_man": "🙅‍♂️",
            "ng_man": "🙅‍♂️",
            "ok_woman": "🙆",
            "ok_man": "🙆‍♂️",
            "raising_hand_woman": "🙋",
            "raising_hand": "🙋",
            "raising_hand_man": "🙋‍♂️",
            "pouting_woman": "🙎",
            "person_with_pouting_face": "🙎",
            "pouting_man": "🙎‍♂️",
            "frowning_woman": "🙍",
            "person_frowning": "🙍",
            "frowning_man": "🙍‍♂️",
            "haircut_woman": "💇",
            "haircut": "💇",
            "haircut_man": "💇‍♂️",
            "massage_woman": "💆",
            "massage": "💆",
            "massage_man": "💆‍♂️",
            "dancer": "💃",
            "dancing_women": "👯",
            "dancers": "👯",
            "dancing_men": "👯‍♂️",
            "walking_woman": "🚶‍♀️",
            "walking_man": "🚶",
            "walking": "🚶",
            "running_woman": "🏃‍♀️",
            "running_man": "🏃",
            "runner": "🏃",
            "running": "🏃",
            "couple": "👫",
            "two_women_holding_hands": "👭",
            "two_men_holding_hands": "👬",
            "couple_with_heart_woman_man": "💑",
            "couple_with_heart": "💑",
            "couple_with_heart_woman_woman": "👩‍❤️‍👩",
            "couple_with_heart_man_man": "👨‍❤️‍👨",
            "couplekiss_man_woman": "💏",
            "couplekiss_woman_woman": "👩‍❤️‍💋‍👩",
            "couplekiss_man_man": "👨‍❤️‍💋‍👨",
            "family_man_woman_boy": "👪",
            "family": "👪",
            "family_man_woman_girl": "👨‍👩‍👧",
            "family_man_woman_girl_boy": "👨‍👩‍👧‍👦",
            "family_man_woman_boy_boy": "👨‍👩‍👦‍👦",
            "family_man_woman_girl_girl": "👨‍👩‍👧‍👧",
            "family_woman_woman_boy": "👩‍👩‍👦",
            "family_woman_woman_girl": "👩‍👩‍👧",
            "family_woman_woman_girl_boy": "👩‍👩‍👧‍👦",
            "family_woman_woman_boy_boy": "👩‍👩‍👦‍👦",
            "family_woman_woman_girl_girl": "👩‍👩‍👧‍👧",
            "family_man_man_boy": "👨‍👨‍👦",
            "family_man_man_girl": "👨‍👨‍👧",
            "family_man_man_girl_boy": "👨‍👨‍👧‍👦",
            "family_man_man_boy_boy": "👨‍👨‍👦‍👦",
            "family_man_man_girl_girl": "👨‍👨‍👧‍👧",
            "family_woman_boy": "👩‍👦",
            "family_woman_girl": "👩‍👧",
            "family_woman_girl_boy": "👩‍👧‍👦",
            "family_woman_boy_boy": "👩‍👦‍👦",
            "family_woman_girl_girl": "👩‍👧‍👧",
            "family_man_boy": "👨‍👦",
            "family_man_girl": "👨‍👧",
            "family_man_girl_boy": "👨‍👧‍👦",
            "family_man_boy_boy": "👨‍👦‍👦",
            "family_man_girl_girl": "👨‍👧‍👧",
            "womans_clothes": "👚",
            "shirt": "👕",
            "tshirt": "👕",
            "jeans": "👖",
            "necktie": "👔",
            "dress": "👗",
            "bikini": "👙",
            "kimono": "👘",
            "lipstick": "💄",
            "kiss": "💋",
            "footprints": "👣",
            "high_heel": "👠",
            "sandal": "👡",
            "boot": "👢",
            "mans_shoe": "👞",
            "shoe": "👞",
            "athletic_shoe": "👟",
            "womans_hat": "👒",
            "tophat": "🎩",
            "mortar_board": "🎓",
            "crown": "👑",
            "rescue_worker_helmet": "⛑",
            "school_satchel": "🎒",
            "pouch": "👝",
            "purse": "👛",
            "handbag": "👜",
            "briefcase": "💼",
            "eyeglasses": "👓",
            "dark_sunglasses": "🕶",
            "ring": "💍",
            "closed_umbrella": "🌂",
            "dog": "🐶",
            "cat": "🐱",
            "mouse": "🐭",
            "hamster": "🐹",
            "rabbit": "🐰",
            "bear": "🐻",
            "panda_face": "🐼",
            "koala": "🐨",
            "tiger": "🐯",
            "lion": "🦁",
            "cow": "🐮",
            "pig": "🐷",
            "pig_nose": "🐽",
            "frog": "🐸",
            "octopus": "🐙",
            "monkey_face": "🐵",
            "see_no_evil": "🙈",
            "hear_no_evil": "🙉",
            "speak_no_evil": "🙊",
            "monkey": "🐒",
            "chicken": "🐔",
            "penguin": "🐧",
            "bird": "🐦",
            "baby_chick": "🐤",
            "hatching_chick": "🐣",
            "hatched_chick": "🐥",
            "wolf": "🐺",
            "boar": "🐗",
            "horse": "🐴",
            "unicorn": "🦄",
            "bee": "🐝",
            "honeybee": "🐝",
            "bug": "🐛",
            "snail": "🐌",
            "beetle": "🐞",
            "ant": "🐜",
            "spider": "🕷",
            "scorpion": "🦂",
            "crab": "🦀",
            "snake": "🐍",
            "turtle": "🐢",
            "tropical_fish": "🐠",
            "fish": "🐟",
            "blowfish": "🐡",
            "dolphin": "🐬",
            "flipper": "🐬",
            "whale": "🐳",
            "whale2": "🐋",
            "crocodile": "🐊",
            "leopard": "🐆",
            "tiger2": "🐅",
            "water_buffalo": "🐃",
            "ox": "🐂",
            "cow2": "🐄",
            "dromedary_camel": "🐪",
            "camel": "🐫",
            "elephant": "🐘",
            "goat": "🐐",
            "ram": "🐏",
            "sheep": "🐑",
            "racehorse": "🐎",
            "pig2": "🐖",
            "rat": "🐀",
            "mouse2": "🐁",
            "rooster": "🐓",
            "turkey": "🦃",
            "dove": "🕊",
            "dog2": "🐕",
            "poodle": "🐩",
            "cat2": "🐈",
            "rabbit2": "🐇",
            "chipmunk": "🐿",
            "feet": "🐾",
            "paw_prints": "🐾",
            "dragon": "🐉",
            "dragon_face": "🐲",
            "cactus": "🌵",
            "christmas_tree": "🎄",
            "evergreen_tree": "🌲",
            "deciduous_tree": "🌳",
            "palm_tree": "🌴",
            "seedling": "🌱",
            "herb": "🌿",
            "shamrock": "☘",
            "four_leaf_clover": "🍀",
            "bamboo": "🎍",
            "tanabata_tree": "🎋",
            "leaves": "🍃",
            "fallen_leaf": "🍂",
            "maple_leaf": "🍁",
            "ear_of_rice": "🌾",
            "hibiscus": "🌺",
            "sunflower": "🌻",
            "rose": "🌹",
            "tulip": "🌷",
            "blossom": "🌼",
            "cherry_blossom": "🌸",
            "bouquet": "💐",
            "mushroom": "🍄",
            "chestnut": "🌰",
            "jack_o_lantern": "🎃",
            "shell": "🐚",
            "spider_web": "🕸",
            "earth_americas": "🌎",
            "earth_africa": "🌍",
            "earth_asia": "🌏",
            "full_moon": "🌕",
            "waning_gibbous_moon": "🌖",
            "last_quarter_moon": "🌗",
            "waning_crescent_moon": "🌘",
            "new_moon": "🌑",
            "waxing_crescent_moon": "🌒",
            "first_quarter_moon": "🌓",
            "moon": "🌔",
            "waxing_gibbous_moon": "🌔",
            "new_moon_with_face": "🌚",
            "full_moon_with_face": "🌝",
            "first_quarter_moon_with_face": "🌛",
            "last_quarter_moon_with_face": "🌜",
            "sun_with_face": "🌞",
            "crescent_moon": "🌙",
            "star": "⭐️",
            "star2": "🌟",
            "dizzy": "💫",
            "sparkles": "✨",
            "comet": "☄️",
            "sunny": "☀️",
            "sun_behind_small_cloud": "🌤",
            "partly_sunny": "⛅️",
            "sun_behind_large_cloud": "🌥",
            "sun_behind_rain_cloud": "🌦",
            "cloud": "☁️",
            "cloud_with_rain": "🌧",
            "cloud_with_lightning_and_rain": "⛈",
            "cloud_with_lightning": "🌩",
            "zap": "⚡️",
            "fire": "🔥",
            "boom": "💥",
            "collision": "💥",
            "snowflake": "❄️",
            "cloud_with_snow": "🌨",
            "snowman_with_snow": "☃️",
            "snowman": "⛄️",
            "wind_face": "🌬",
            "dash": "💨",
            "tornado": "🌪",
            "fog": "🌫",
            "open_umbrella": "☂️",
            "umbrella": "☔️",
            "droplet": "💧",
            "sweat_drops": "💦",
            "ocean": "🌊",
            "green_apple": "🍏",
            "apple": "🍎",
            "pear": "🍐",
            "tangerine": "🍊",
            "orange": "🍊",
            "mandarin": "🍊",
            "lemon": "🍋",
            "banana": "🍌",
            "watermelon": "🍉",
            "grapes": "🍇",
            "strawberry": "🍓",
            "melon": "🍈",
            "cherries": "🍒",
            "peach": "🍑",
            "pineapple": "🍍",
            "tomato": "🍅",
            "eggplant": "🍆",
            "hot_pepper": "🌶",
            "corn": "🌽",
            "sweet_potato": "🍠",
            "honey_pot": "🍯",
            "bread": "🍞",
            "cheese": "🧀",
            "poultry_leg": "🍗",
            "meat_on_bone": "🍖",
            "fried_shrimp": "🍤",
            "egg": "🍳",
            "hamburger": "🍔",
            "fries": "🍟",
            "hotdog": "🌭",
            "pizza": "🍕",
            "spaghetti": "🍝",
            "taco": "🌮",
            "burrito": "🌯",
            "ramen": "🍜",
            "stew": "🍲",
            "fish_cake": "🍥",
            "sushi": "🍣",
            "bento": "🍱",
            "curry": "🍛",
            "rice_ball": "🍙",
            "rice": "🍚",
            "rice_cracker": "🍘",
            "oden": "🍢",
            "dango": "🍡",
            "shaved_ice": "🍧",
            "ice_cream": "🍨",
            "icecream": "🍦",
            "cake": "🍰",
            "birthday": "🎂",
            "custard": "🍮",
            "candy": "🍬",
            "lollipop": "🍭",
            "chocolate_bar": "🍫",
            "popcorn": "🍿",
            "doughnut": "🍩",
            "cookie": "🍪",
            "beer": "🍺",
            "beers": "🍻",
            "wine_glass": "🍷",
            "cocktail": "🍸",
            "tropical_drink": "🍹",
            "champagne": "🍾",
            "sake": "🍶",
            "tea": "🍵",
            "coffee": "☕️",
            "baby_bottle": "🍼",
            "fork_and_knife": "🍴",
            "plate_with_cutlery": "🍽",
            "soccer": "⚽️",
            "basketball": "🏀",
            "football": "🏈",
            "baseball": "⚾️",
            "tennis": "🎾",
            "volleyball": "🏐",
            "rugby_football": "🏉",
            "8ball": "🎱",
            "ping_pong": "🏓",
            "badminton": "🏸",
            "ice_hockey": "🏒",
            "field_hockey": "🏑",
            "cricket": "🏏",
            "bow_and_arrow": "🏹",
            "golf": "⛳️",
            "fishing_pole_and_fish": "🎣",
            "ice_skate": "⛸",
            "ski": "🎿",
            "skier": "⛷",
            "snowboarder": "🏂",
            "weight_lifting_woman": "🏋️‍♀️",
            "weight_lifting_man": "🏋️",
            "basketball_woman": "⛹️‍♀️",
            "basketball_man": "⛹️",
            "golfing_woman": "🏌️‍♀️",
            "golfing_man": "🏌️",
            "surfing_woman": "🏄‍♀️",
            "surfing_man": "🏄",
            "surfer": "🏄",
            "swimming_woman": "🏊‍♀️",
            "swimming_man": "🏊",
            "swimmer": "🏊",
            "rowing_woman": "🚣‍♀️",
            "rowing_man": "🚣",
            "rowboat": "🚣",
            "horse_racing": "🏇",
            "biking_woman": "🚴‍♀️",
            "biking_man": "🚴",
            "bicyclist": "🚴",
            "mountain_biking_woman": "🚵‍♀️",
            "mountain_biking_man": "🚵",
            "mountain_bicyclist": "🚵",
            "bath": "🛀",
            "business_suit_levitating": "🕴",
            "reminder_ribbon": "🎗",
            "running_shirt_with_sash": "🎽",
            "medal_sports": "🏅",
            "medal_military": "🎖",
            "trophy": "🏆",
            "rosette": "🏵",
            "dart": "🎯",
            "ticket": "🎫",
            "tickets": "🎟",
            "performing_arts": "🎭",
            "art": "🎨",
            "circus_tent": "🎪",
            "clapper": "🎬",
            "microphone": "🎤",
            "headphones": "🎧",
            "musical_score": "🎼",
            "musical_keyboard": "🎹",
            "saxophone": "🎷",
            "trumpet": "🎺",
            "guitar": "🎸",
            "violin": "🎻",
            "video_game": "🎮",
            "slot_machine": "🎰",
            "game_die": "🎲",
            "bowling": "🎳",
            "car": "🚗",
            "red_car": "🚗",
            "taxi": "🚕",
            "blue_car": "🚙",
            "bus": "🚌",
            "trolleybus": "🚎",
            "racing_car": "🏎",
            "police_car": "🚓",
            "ambulance": "🚑",
            "fire_engine": "🚒",
            "minibus": "🚐",
            "truck": "🚚",
            "articulated_lorry": "🚛",
            "tractor": "🚜",
            "motorcycle": "🏍",
            "bike": "🚲",
            "rotating_light": "🚨",
            "oncoming_police_car": "🚔",
            "oncoming_bus": "🚍",
            "oncoming_automobile": "🚘",
            "oncoming_taxi": "🚖",
            "aerial_tramway": "🚡",
            "mountain_cableway": "🚠",
            "suspension_railway": "🚟",
            "railway_car": "🚃",
            "train": "🚋",
            "monorail": "🚝",
            "bullettrain_side": "🚄",
            "bullettrain_front": "🚅",
            "light_rail": "🚈",
            "mountain_railway": "🚞",
            "steam_locomotive": "🚂",
            "train2": "🚆",
            "metro": "🚇",
            "tram": "🚊",
            "station": "🚉",
            "helicopter": "🚁",
            "small_airplane": "🛩",
            "airplane": "✈️",
            "flight_departure": "🛫",
            "flight_arrival": "🛬",
            "boat": "⛵️",
            "sailboat": "⛵️",
            "motor_boat": "🛥",
            "speedboat": "🚤",
            "ferry": "⛴",
            "passenger_ship": "🛳",
            "rocket": "🚀",
            "artificial_satellite": "🛰",
            "seat": "💺",
            "anchor": "⚓️",
            "construction": "🚧",
            "fuelpump": "⛽️",
            "busstop": "🚏",
            "vertical_traffic_light": "🚦",
            "traffic_light": "🚥",
            "world_map": "🗺",
            "ship": "🚢",
            "ferris_wheel": "🎡",
            "roller_coaster": "🎢",
            "carousel_horse": "🎠",
            "building_construction": "🏗",
            "foggy": "🌁",
            "tokyo_tower": "🗼",
            "factory": "🏭",
            "fountain": "⛲️",
            "rice_scene": "🎑",
            "mountain": "⛰",
            "mountain_snow": "🏔",
            "mount_fuji": "🗻",
            "volcano": "🌋",
            "japan": "🗾",
            "camping": "🏕",
            "tent": "⛺️",
            "national_park": "🏞",
            "motorway": "🛣",
            "railway_track": "🛤",
            "sunrise": "🌅",
            "sunrise_over_mountains": "🌄",
            "desert": "🏜",
            "beach_umbrella": "🏖",
            "desert_island": "🏝",
            "city_sunrise": "🌇",
            "city_sunset": "🌆",
            "cityscape": "🏙",
            "night_with_stars": "🌃",
            "bridge_at_night": "🌉",
            "milky_way": "🌌",
            "stars": "🌠",
            "sparkler": "🎇",
            "fireworks": "🎆",
            "rainbow": "🌈",
            "houses": "🏘",
            "european_castle": "🏰",
            "japanese_castle": "🏯",
            "stadium": "🏟",
            "statue_of_liberty": "🗽",
            "house": "🏠",
            "house_with_garden": "🏡",
            "derelict_house": "🏚",
            "office": "🏢",
            "department_store": "🏬",
            "post_office": "🏣",
            "european_post_office": "🏤",
            "hospital": "🏥",
            "bank": "🏦",
            "hotel": "🏨",
            "convenience_store": "🏪",
            "school": "🏫",
            "love_hotel": "🏩",
            "wedding": "💒",
            "classical_building": "🏛",
            "church": "⛪️",
            "mosque": "🕌",
            "synagogue": "🕍",
            "kaaba": "🕋",
            "shinto_shrine": "⛩",
            "watch": "⌚️",
            "iphone": "📱",
            "calling": "📲",
            "computer": "💻",
            "keyboard": "⌨️",
            "desktop_computer": "🖥",
            "printer": "🖨",
            "computer_mouse": "🖱",
            "trackball": "🖲",
            "joystick": "🕹",
            "clamp": "🗜",
            "minidisc": "💽",
            "floppy_disk": "💾",
            "cd": "💿",
            "dvd": "📀",
            "vhs": "📼",
            "camera": "📷",
            "camera_flash": "📸",
            "video_camera": "📹",
            "movie_camera": "🎥",
            "film_projector": "📽",
            "film_strip": "🎞",
            "telephone_receiver": "📞",
            "phone": "☎️",
            "telephone": "☎️",
            "pager": "📟",
            "fax": "📠",
            "tv": "📺",
            "radio": "📻",
            "studio_microphone": "🎙",
            "level_slider": "🎚",
            "control_knobs": "🎛",
            "stopwatch": "⏱",
            "timer_clock": "⏲",
            "alarm_clock": "⏰",
            "mantelpiece_clock": "🕰",
            "hourglass_flowing_sand": "⏳",
            "hourglass": "⌛️",
            "satellite": "📡",
            "battery": "🔋",
            "electric_plug": "🔌",
            "bulb": "💡",
            "flashlight": "🔦",
            "candle": "🕯",
            "wastebasket": "🗑",
            "oil_drum": "🛢",
            "money_with_wings": "💸",
            "dollar": "💵",
            "yen": "💴",
            "euro": "💶",
            "pound": "💷",
            "moneybag": "💰",
            "credit_card": "💳",
            "gem": "💎",
            "balance_scale": "⚖",
            "wrench": "🔧",
            "hammer": "🔨",
            "hammer_and_pick": "⚒",
            "hammer_and_wrench": "🛠",
            "pick": "⛏",
            "nut_and_bolt": "🔩",
            "gear": "⚙",
            "chains": "⛓",
            "gun": "🔫",
            "bomb": "💣",
            "hocho": "🔪",
            "knife": "🔪",
            "dagger": "🗡",
            "crossed_swords": "⚔",
            "shield": "🛡",
            "smoking": "🚬",
            "coffin": "⚰",
            "funeral_urn": "⚱",
            "amphora": "🏺",
            "crystal_ball": "🔮",
            "prayer_beads": "📿",
            "barber": "💈",
            "alembic": "⚗",
            "telescope": "🔭",
            "microscope": "🔬",
            "hole": "🕳",
            "pill": "💊",
            "syringe": "💉",
            "thermometer": "🌡",
            "toilet": "🚽",
            "shower": "🚿",
            "bathtub": "🛁",
            "bellhop_bell": "🛎",
            "key": "🔑",
            "old_key": "🗝",
            "door": "🚪",
            "couch_and_lamp": "🛋",
            "sleeping_bed": "🛌",
            "bed": "🛏",
            "framed_picture": "🖼",
            "parasol_on_ground": "⛱",
            "moyai": "🗿",
            "shopping": "🛍",
            "gift": "🎁",
            "balloon": "🎈",
            "flags": "🎏",
            "ribbon": "🎀",
            "confetti_ball": "🎊",
            "tada": "🎉",
            "wind_chime": "🎐",
            "izakaya_lantern": "🏮",
            "lantern": "🏮",
            "dolls": "🎎",
            "email": "✉️",
            "envelope": "✉️",
            "envelope_with_arrow": "📩",
            "incoming_envelope": "📨",
            "e-mail": "📧",
            "love_letter": "💌",
            "inbox_tray": "📥",
            "outbox_tray": "📤",
            "package": "📦",
            "label": "🏷",
            "bookmark": "🔖",
            "mailbox_closed": "📪",
            "mailbox": "📫",
            "mailbox_with_mail": "📬",
            "mailbox_with_no_mail": "📭",
            "postbox": "📮",
            "postal_horn": "📯",
            "scroll": "📜",
            "page_with_curl": "📃",
            "page_facing_up": "📄",
            "bookmark_tabs": "📑",
            "bar_chart": "📊",
            "chart_with_upwards_trend": "📈",
            "chart_with_downwards_trend": "📉",
            "spiral_notepad": "🗒",
            "spiral_calendar": "🗓",
            "calendar": "📆",
            "date": "📅",
            "card_index": "📇",
            "card_file_box": "🗃",
            "ballot_box": "🗳",
            "file_cabinet": "🗄",
            "clipboard": "📋",
            "file_folder": "📁",
            "open_file_folder": "📂",
            "card_index_dividers": "🗂",
            "newspaper_roll": "🗞",
            "newspaper": "📰",
            "notebook": "📓",
            "notebook_with_decorative_cover": "📔",
            "ledger": "📒",
            "closed_book": "📕",
            "green_book": "📗",
            "blue_book": "📘",
            "orange_book": "📙",
            "books": "📚",
            "book": "📖",
            "open_book": "📖",
            "link": "🔗",
            "paperclip": "📎",
            "paperclips": "🖇",
            "triangular_ruler": "📐",
            "straight_ruler": "📏",
            "scissors": "✂️",
            "pushpin": "📌",
            "round_pushpin": "📍",
            "triangular_flag_on_post": "🚩",
            "crossed_flags": "🎌",
            "white_flag": "🏳️",
            "black_flag": "🏴",
            "checkered_flag": "🏁",
            "rainbow_flag": "🏳️‍🌈",
            "paintbrush": "🖌",
            "crayon": "🖍",
            "pen": "🖊",
            "fountain_pen": "🖋",
            "black_nib": "✒️",
            "memo": "📝",
            "pencil": "📝",
            "pencil2": "✏️",
            "lock_with_ink_pen": "🔏",
            "closed_lock_with_key": "🔐",
            "lock": "🔒",
            "unlock": "🔓",
            "mag": "🔍",
            "mag_right": "🔎",
            "heart": "❤️",
            "yellow_heart": "💛",
            "green_heart": "💚",
            "blue_heart": "💙",
            "purple_heart": "💜",
            "broken_heart": "💔",
            "heavy_heart_exclamation": "❣️",
            "two_hearts": "💕",
            "revolving_hearts": "💞",
            "heartbeat": "💓",
            "heartpulse": "💗",
            "sparkling_heart": "💖",
            "cupid": "💘",
            "gift_heart": "💝",
            "heart_decoration": "💟",
            "peace_symbol": "☮️",
            "latin_cross": "✝️",
            "star_and_crescent": "☪️",
            "om": "🕉",
            "wheel_of_dharma": "☸️",
            "star_of_david": "✡️",
            "six_pointed_star": "🔯",
            "menorah": "🕎",
            "yin_yang": "☯️",
            "orthodox_cross": "☦️",
            "place_of_worship": "🛐",
            "ophiuchus": "⛎",
            "aries": "♈️",
            "taurus": "♉️",
            "gemini": "♊️",
            "cancer": "♋️",
            "leo": "♌️",
            "virgo": "♍️",
            "libra": "♎️",
            "scorpius": "♏️",
            "sagittarius": "♐️",
            "capricorn": "♑️",
            "aquarius": "♒️",
            "pisces": "♓️",
            "id": "🆔",
            "atom_symbol": "⚛",
            "radioactive": "☢️",
            "biohazard": "☣️",
            "mobile_phone_off": "📴",
            "vibration_mode": "📳",
            "eight_pointed_black_star": "✴️",
            "vs": "🆚",
            "accept": "🉑",
            "white_flower": "💮",
            "ideograph_advantage": "🉐",
            "secret": "㊙️",
            "congratulations": "㊗️",
            "u6e80": "🈵",
            "a": "🅰️",
            "b": "🅱️",
            "ab": "🆎",
            "cl": "🆑",
            "o2": "🅾️",
            "sos": "🆘",
            "no_entry": "⛔️",
            "name_badge": "📛",
            "no_entry_sign": "🚫",
            "x": "❌",
            "o": "⭕️",
            "anger": "💢",
            "hotsprings": "♨️",
            "no_pedestrians": "🚷",
            "do_not_litter": "🚯",
            "no_bicycles": "🚳",
            "non-potable_water": "🚱",
            "underage": "🔞",
            "no_mobile_phones": "📵",
            "exclamation": "❗️",
            "heavy_exclamation_mark": "❗️",
            "grey_exclamation": "❕",
            "question": "❓",
            "grey_question": "❔",
            "bangbang": "‼️",
            "interrobang": "⁉️",
            "low_brightness": "🔅",
            "high_brightness": "🔆",
            "trident": "🔱",
            "fleur_de_lis": "⚜",
            "part_alternation_mark": "〽️",
            "warning": "⚠️",
            "children_crossing": "🚸",
            "beginner": "🔰",
            "recycle": "♻️",
            "chart": "💹",
            "sparkle": "❇️",
            "eight_spoked_asterisk": "✳️",
            "negative_squared_cross_mark": "❎",
            "white_check_mark": "✅",
            "globe_with_meridians": "🌐",
            "m": "Ⓜ️",
            "diamond_shape_with_a_dot_inside": "💠",
            "cyclone": "🌀",
            "loop": "➿",
            "atm": "🏧",
            "sa": "🈂️",
            "passport_control": "🛂",
            "customs": "🛃",
            "baggage_claim": "🛄",
            "left_luggage": "🛅",
            "wheelchair": "♿️",
            "no_smoking": "🚭",
            "wc": "🚾",
            "parking": "🅿️",
            "potable_water": "🚰",
            "mens": "🚹",
            "womens": "🚺",
            "baby_symbol": "🚼",
            "restroom": "🚻",
            "put_litter_in_its_place": "🚮",
            "cinema": "🎦",
            "signal_strength": "📶",
            "koko": "🈁",
            "abc": "🔤",
            "abcd": "🔡",
            "capital_abcd": "🔠",
            "symbols": "🔣",
            "information_source": "ℹ️",
            "ng": "🆖",
            "ok": "🆗",
            "up": "🆙",
            "cool": "🆒",
            "new": "🆕",
            "free": "🆓",
            "zero": "0️⃣",
            "one": "1️⃣",
            "two": "2️⃣",
            "three": "3️⃣",
            "four": "4️⃣",
            "five": "5️⃣",
            "six": "6️⃣",
            "seven": "7️⃣",
            "eight": "8️⃣",
            "nine": "9️⃣",
            "keycap_ten": "🔟",
            "hash": "#️⃣",
            "asterisk": "*️⃣",
            "arrow_forward": "▶️",
            "pause_button": "⏸",
            "play_or_pause_button": "⏯",
            "stop_button": "⏹",
            "record_button": "⏺",
            "next_track_button": "⏭",
            "previous_track_button": "⏮",
            "fast_forward": "⏩",
            "rewind": "⏪",
            "arrow_double_up": "⏫",
            "arrow_double_down": "⏬",
            "arrow_backward": "◀️",
            "arrow_up_small": "🔼",
            "arrow_down_small": "🔽",
            "arrow_right": "➡️",
            "arrow_left": "⬅️",
            "arrow_up": "⬆️",
            "arrow_down": "⬇️",
            "arrow_upper_right": "↗️",
            "arrow_lower_right": "↘️",
            "arrow_lower_left": "↙️",
            "arrow_upper_left": "↖️",
            "arrow_up_down": "↕️",
            "left_right_arrow": "↔️",
            "arrow_right_hook": "↪️",
            "leftwards_arrow_with_hook": "↩️",
            "arrow_heading_up": "⤴️",
            "arrow_heading_down": "⤵️",
            "twisted_rightwards_arrows": "🔀",
            "repeat": "🔁",
            "repeat_one": "🔂",
            "arrows_counterclockwise": "🔄",
            "arrows_clockwise": "🔃",
            "musical_note": "🎵",
            "notes": "🎶",
            "wavy_dash": "〰️",
            "curly_loop": "➰",
            "heavy_check_mark": "✔️",
            "heavy_plus_sign": "➕",
            "heavy_minus_sign": "➖",
            "heavy_division_sign": "➗",
            "heavy_multiplication_x": "✖️",
            "heavy_dollar_sign": "💲",
            "currency_exchange": "💱",
            "tm": "™️",
            "copyright": "©️",
            "registered": "®️",
            "end": "🔚",
            "back": "🔙",
            "on": "🔛",
            "top": "🔝",
            "soon": "🔜",
            "ballot_box_with_check": "☑️",
            "radio_button": "🔘",
            "white_circle": "⚪️",
            "black_circle": "⚫️",
            "red_circle": "🔴",
            "large_blue_circle": "🔵",
            "small_red_triangle": "🔺",
            "small_red_triangle_down": "🔻",
            "small_orange_diamond": "🔸",
            "small_blue_diamond": "🔹",
            "large_orange_diamond": "🔶",
            "large_blue_diamond": "🔷",
            "white_square_button": "🔳",
            "black_square_button": "🔲",
            "black_small_square": "▪️",
            "white_small_square": "▫️",
            "black_medium_small_square": "◾️",
            "white_medium_small_square": "◽️",
            "black_medium_square": "◼️",
            "white_medium_square": "◻️",
            "black_large_square": "⬛️",
            "white_large_square": "⬜️",
            "mute": "🔇",
            "speaker": "🔈",
            "sound": "🔉",
            "loud_sound": "🔊",
            "no_bell": "🔕",
            "bell": "🔔",
            "mega": "📣",
            "loudspeaker": "📢",
            "eye_speech_bubble": "👁‍🗨",
            "speech_balloon": "💬",
            "thought_balloon": "💭",
            "right_anger_bubble": "🗯",
            "black_joker": "🃏",
            "mahjong": "🀄️",
            "flower_playing_cards": "🎴",
            "spades": "♠️",
            "clubs": "♣️",
            "hearts": "♥️",
            "diamonds": "♦️",
            "clock1": "🕐",
            "clock2": "🕑",
            "clock3": "🕒",
            "clock4": "🕓",
            "clock5": "🕔",
            "clock6": "🕕",
            "clock7": "🕖",
            "clock8": "🕗",
            "clock9": "🕘",
            "clock10": "🕙",
            "clock11": "🕚",
            "clock12": "🕛",
            "clock130": "🕜",
            "clock230": "🕝",
            "clock330": "🕞",
            "clock430": "🕟",
            "clock530": "🕠",
            "clock630": "🕡",
            "clock730": "🕢",
            "clock830": "🕣",
            "clock930": "🕤",
            "clock1030": "🕥",
            "clock1130": "🕦",
            "clock1230": "🕧",
            "afghanistan": "🇦🇫",
            "aland_islands": "🇦🇽",
            "albania": "🇦🇱",
            "algeria": "🇩🇿",
            "american_samoa": "🇦🇸",
            "andorra": "🇦🇩",
            "angola": "🇦🇴",
            "anguilla": "🇦🇮",
            "antarctica": "🇦🇶",
            "antigua_barbuda": "🇦🇬",
            "argentina": "🇦🇷",
            "armenia": "🇦🇲",
            "aruba": "🇦🇼",
            "australia": "🇦🇺",
            "austria": "🇦🇹",
            "azerbaijan": "🇦🇿",
            "bahamas": "🇧🇸",
            "bahrain": "🇧🇭",
            "bangladesh": "🇧🇩",
            "barbados": "🇧🇧",
            "belarus": "🇧🇾",
            "belgium": "🇧🇪",
            "belize": "🇧🇿",
            "benin": "🇧🇯",
            "bermuda": "🇧🇲",
            "bhutan": "🇧🇹",
            "bolivia": "🇧🇴",
            "caribbean_netherlands": "🇧🇶",
            "bosnia_herzegovina": "🇧🇦",
            "botswana": "🇧🇼",
            "brazil": "🇧🇷",
            "british_indian_ocean_territory": "🇮🇴",
            "british_virgin_islands": "🇻🇬",
            "brunei": "🇧🇳",
            "bulgaria": "🇧🇬",
            "burkina_faso": "🇧🇫",
            "burundi": "🇧🇮",
            "cape_verde": "🇨🇻",
            "cambodia": "🇰🇭",
            "cameroon": "🇨🇲",
            "canada": "🇨🇦",
            "canary_islands": "🇮🇨",
            "cayman_islands": "🇰🇾",
            "central_african_republic": "🇨🇫",
            "chad": "🇹🇩",
            "chile": "🇨🇱",
            "cn": "🇨🇳",
            "christmas_island": "🇨🇽",
            "cocos_islands": "🇨🇨",
            "colombia": "🇨🇴",
            "comoros": "🇰🇲",
            "congo_brazzaville": "🇨🇬",
            "congo_kinshasa": "🇨🇩",
            "cook_islands": "🇨🇰",
            "costa_rica": "🇨🇷",
            "croatia": "🇭🇷",
            "cuba": "🇨🇺",
            "curacao": "🇨🇼",
            "cyprus": "🇨🇾",
            "czech_republic": "🇨🇿",
            "denmark": "🇩🇰",
            "djibouti": "🇩🇯",
            "dominica": "🇩🇲",
            "dominican_republic": "🇩🇴",
            "ecuador": "🇪🇨",
            "egypt": "🇪🇬",
            "el_salvador": "🇸🇻",
            "equatorial_guinea": "🇬🇶",
            "eritrea": "🇪🇷",
            "estonia": "🇪🇪",
            "ethiopia": "🇪🇹",
            "eu": "🇪🇺",
            "european_union": "🇪🇺",
            "falkland_islands": "🇫🇰",
            "faroe_islands": "🇫🇴",
            "fiji": "🇫🇯",
            "finland": "🇫🇮",
            "fr": "🇫🇷",
            "french_guiana": "🇬🇫",
            "french_polynesia": "🇵🇫",
            "french_southern_territories": "🇹🇫",
            "gabon": "🇬🇦",
            "gambia": "🇬🇲",
            "georgia": "🇬🇪",
            "de": "🇩🇪",
            "ghana": "🇬🇭",
            "gibraltar": "🇬🇮",
            "greece": "🇬🇷",
            "greenland": "🇬🇱",
            "grenada": "🇬🇩",
            "guadeloupe": "🇬🇵",
            "guam": "🇬🇺",
            "guatemala": "🇬🇹",
            "guernsey": "🇬🇬",
            "guinea": "🇬🇳",
            "guinea_bissau": "🇬🇼",
            "guyana": "🇬🇾",
            "haiti": "🇭🇹",
            "honduras": "🇭🇳",
            "hong_kong": "🇭🇰",
            "hungary": "🇭🇺",
            "iceland": "🇮🇸",
            "india": "🇮🇳",
            "indonesia": "🇮🇩",
            "iran": "🇮🇷",
            "iraq": "🇮🇶",
            "ireland": "🇮🇪",
            "isle_of_man": "🇮🇲",
            "israel": "🇮🇱",
            "it": "🇮🇹",
            "cote_divoire": "🇨🇮",
            "jamaica": "🇯🇲",
            "jp": "🇯🇵",
            "jersey": "🇯🇪",
            "jordan": "🇯🇴",
            "kazakhstan": "🇰🇿",
            "kenya": "🇰🇪",
            "kiribati": "🇰🇮",
            "kosovo": "🇽🇰",
            "kuwait": "🇰🇼",
            "kyrgyzstan": "🇰🇬",
            "laos": "🇱🇦",
            "latvia": "🇱🇻",
            "lebanon": "🇱🇧",
            "lesotho": "🇱🇸",
            "liberia": "🇱🇷",
            "libya": "🇱🇾",
            "liechtenstein": "🇱🇮",
            "lithuania": "🇱🇹",
            "luxembourg": "🇱🇺",
            "macau": "🇲🇴",
            "macedonia": "🇲🇰",
            "madagascar": "🇲🇬",
            "malawi": "🇲🇼",
            "malaysia": "🇲🇾",
            "maldives": "🇲🇻",
            "mali": "🇲🇱",
            "malta": "🇲🇹",
            "marshall_islands": "🇲🇭",
            "martinique": "🇲🇶",
            "mauritania": "🇲🇷",
            "mauritius": "🇲🇺",
            "mayotte": "🇾🇹",
            "mexico": "🇲🇽",
            "micronesia": "🇫🇲",
            "moldova": "🇲🇩",
            "monaco": "🇲🇨",
            "mongolia": "🇲🇳",
            "montenegro": "🇲🇪",
            "montserrat": "🇲🇸",
            "morocco": "🇲🇦",
            "mozambique": "🇲🇿",
            "myanmar": "🇲🇲",
            "namibia": "🇳🇦",
            "nauru": "🇳🇷",
            "nepal": "🇳🇵",
            "netherlands": "🇳🇱",
            "new_caledonia": "🇳🇨",
            "new_zealand": "🇳🇿",
            "nicaragua": "🇳🇮",
            "niger": "🇳🇪",
            "nigeria": "🇳🇬",
            "niue": "🇳🇺",
            "norfolk_island": "🇳🇫",
            "northern_mariana_islands": "🇲🇵",
            "north_korea": "🇰🇵",
            "norway": "🇳🇴",
            "oman": "🇴🇲",
            "pakistan": "🇵🇰",
            "palau": "🇵🇼",
            "palestinian_territories": "🇵🇸",
            "panama": "🇵🇦",
            "papua_new_guinea": "🇵🇬",
            "paraguay": "🇵🇾",
            "peru": "🇵🇪",
            "philippines": "🇵🇭",
            "pitcairn_islands": "🇵🇳",
            "poland": "🇵🇱",
            "portugal": "🇵🇹",
            "puerto_rico": "🇵🇷",
            "qatar": "🇶🇦",
            "reunion": "🇷🇪",
            "romania": "🇷🇴",
            "ru": "🇷🇺",
            "rwanda": "🇷🇼",
            "st_barthelemy": "🇧🇱",
            "st_helena": "🇸🇭",
            "st_kitts_nevis": "🇰🇳",
            "st_lucia": "🇱🇨",
            "st_pierre_miquelon": "🇵🇲",
            "st_vincent_grenadines": "🇻🇨",
            "samoa": "🇼🇸",
            "san_marino": "🇸🇲",
            "sao_tome_principe": "🇸🇹",
            "saudi_arabia": "🇸🇦",
            "senegal": "🇸🇳",
            "serbia": "🇷🇸",
            "seychelles": "🇸🇨",
            "sierra_leone": "🇸🇱",
            "singapore": "🇸🇬",
            "sint_maarten": "🇸🇽",
            "slovakia": "🇸🇰",
            "slovenia": "🇸🇮",
            "solomon_islands": "🇸🇧",
            "somalia": "🇸🇴",
            "south_africa": "🇿🇦",
            "south_georgia_south_sandwich_islands": "🇬🇸",
            "kr": "🇰🇷",
            "south_sudan": "🇸🇸",
            "es": "🇪🇸",
            "sri_lanka": "🇱🇰",
            "sudan": "🇸🇩",
            "suriname": "🇸🇷",
            "swaziland": "🇸🇿",
            "sweden": "🇸🇪",
            "switzerland": "🇨🇭",
            "syria": "🇸🇾",
            "taiwan": "🇹🇼",
            "tajikistan": "🇹🇯",
            "tanzania": "🇹🇿",
            "thailand": "🇹🇭",
            "timor_leste": "🇹🇱",
            "togo": "🇹🇬",
            "tokelau": "🇹🇰",
            "tonga": "🇹🇴",
            "trinidad_tobago": "🇹🇹",
            "tunisia": "🇹🇳",
            "tr": "🇹🇷",
            "turkmenistan": "🇹🇲",
            "turks_caicos_islands": "🇹🇨",
            "tuvalu": "🇹🇻",
            "uganda": "🇺🇬",
            "ukraine": "🇺🇦",
            "united_arab_emirates": "🇦🇪",
            "gb": "🇬🇧",
            "uk": "🇬🇧",
            "us": "🇺🇸",
            "us_virgin_islands": "🇻🇮",
            "uruguay": "🇺🇾",
            "uzbekistan": "🇺🇿",
            "vanuatu": "🇻🇺",
            "vatican_city": "🇻🇦",
            "venezuela": "🇻🇪",
            "vietnam": "🇻🇳",
            "wallis_futuna": "🇼🇫",
            "western_sahara": "🇪🇭",
            "yemen": "🇾🇪",
            "zambia": "🇿🇲",
            "zimbabwe": "🇿🇼"
        }
    }, {}],
    11: [function(require, module, exports) {
        // Emoticons -> Emoji mapping.
        //
        // (!) Some patterns skipped, to avoid collisions
        // without increase matcher complicity. Than can change in future.
        //
        // Places to look for more emoticons info:
        //
        // - http://en.wikipedia.org/wiki/List_of_emoticons#Western
        // - https://github.com/wooorm/emoticon/blob/master/Support.md
        // - http://factoryjoe.com/projects/emoticons/
        //
        'use strict';

        module.exports = {
            angry: ['>:(', '>:-('],
            blush: [':")', ':-")'],
            broken_heart: ['</3', '<\\3'],
            // :\ and :-\ not used because of conflict with markdown escaping
            confused: [':/', ':-/'], // twemoji shows question
            cry: [":'(", ":'-(", ':,(', ':,-('],
            frowning: [':(', ':-('],
            heart: ['<3'],
            imp: [']:(', ']:-('],
            innocent: ['o:)', 'O:)', 'o:-)', 'O:-)', '0:)', '0:-)'],
            joy: [":')", ":'-)", ':,)', ':,-)', ":'D", ":'-D", ':,D', ':,-D'],
            kissing: [':*', ':-*'],
            laughing: ['x-)', 'X-)'],
            neutral_face: [':|', ':-|'],
            open_mouth: [':o', ':-o', ':O', ':-O'],
            rage: [':@', ':-@'],
            smile: [':D', ':-D'],
            smiley: [':)', ':-)'],
            smiling_imp: [']:)', ']:-)'],
            sob: [":,'(", ":,'-(", ';(', ';-('],
            stuck_out_tongue: [':P', ':-P'],
            sunglasses: ['8-)', 'B-)'],
            sweat: [',:(', ',:-('],
            sweat_smile: [',:)', ',:-)'],
            unamused: [':s', ':-S', ':z', ':-Z', ':$', ':-$'],
            wink: [';)', ';-)']
        };

    }, {}],
    12: [function(require, module, exports) {
        // Convert input options to more useable format
        // and compile search regexp

        'use strict';


        function quoteRE(str) {
            return str.replace(/[.?*+^$[\]\\(){}|-]/g, '\\$&');
        }


        module.exports = function normalize_opts(options) {
            var emojies = options.defs,
                shortcuts;

            // Filter emojies by whitelist, if needed
            if (options.enabled.length) {
                emojies = Object.keys(emojies).reduce(function(acc, key) {
                    if (options.enabled.indexOf(key) >= 0) {
                        acc[key] = emojies[key];
                    }
                    return acc;
                }, {});
            }

            // Flatten shortcuts to simple object: { alias: emoji_name }
            shortcuts = Object.keys(options.shortcuts).reduce(function(acc, key) {
                // Skip aliases for filtered emojies, to reduce regexp
                if (!emojies[key]) {
                    return acc;
                }

                if (Array.isArray(options.shortcuts[key])) {
                    options.shortcuts[key].forEach(function(alias) {
                        acc[alias] = key;
                    });
                    return acc;
                }

                acc[options.shortcuts[key]] = key;
                return acc;
            }, {});

            // Compile regexp
            var names = Object.keys(emojies)
                .map(function(name) {
                    return ':' + name + ':';
                })
                .concat(Object.keys(shortcuts))
                .sort()
                .reverse()
                .map(function(name) {
                    return quoteRE(name);
                })
                .join('|');
            var scanRE = RegExp(names);
            var replaceRE = RegExp(names, 'g');

            return {
                defs: emojies,
                shortcuts: shortcuts,
                scanRE: scanRE,
                replaceRE: replaceRE
            };
        };

    }, {}],
    13: [function(require, module, exports) {
        'use strict';

        module.exports = function emoji_html(tokens, idx /*, options, env */ ) {
            return tokens[idx].content;
        };

    }, {}],
    14: [function(require, module, exports) {
        // Emojies & shortcuts replacement logic.
        //
        // Note: In theory, it could be faster to parse :smile: in inline chain and
        // leave only shortcuts here. But, who care...
        //

        'use strict';


        module.exports = function create_rule(md, emojies, shortcuts, scanRE, replaceRE) {
            var arrayReplaceAt = md.utils.arrayReplaceAt,
                ucm = md.utils.lib.ucmicro,
                ZPCc = new RegExp([ucm.Z.source, ucm.P.source, ucm.Cc.source].join('|'));

            function splitTextToken(text, level, Token) {
                var token, last_pos = 0,
                    nodes = [];

                text.replace(replaceRE, function(match, offset, src) {
                    var emoji_name;
                    // Validate emoji name
                    if (shortcuts.hasOwnProperty(match)) {
                        // replace shortcut with full name
                        emoji_name = shortcuts[match];

                        // Don't allow letters before any shortcut (as in no ":/" in http://)
                        if (offset > 0 && !ZPCc.test(src[offset - 1])) {
                            return;
                        }

                        // Don't allow letters after any shortcut
                        if (offset + match.length < src.length && !ZPCc.test(src[offset + match.length])) {
                            return;
                        }
                    } else {
                        emoji_name = match.slice(1, -1);
                    }

                    // Add new tokens to pending list
                    if (offset > last_pos) {
                        token = new Token('text', '', 0);
                        token.content = text.slice(last_pos, offset);
                        nodes.push(token);
                    }

                    token = new Token('emoji', '', 0);
                    token.markup = emoji_name;
                    token.content = emojies[emoji_name];
                    nodes.push(token);

                    last_pos = offset + match.length;
                });

                if (last_pos < text.length) {
                    token = new Token('text', '', 0);
                    token.content = text.slice(last_pos);
                    nodes.push(token);
                }

                return nodes;
            }

            return function emoji_replace(state) {
                var i, j, l, tokens, token,
                    blockTokens = state.tokens,
                    autolinkLevel = 0;

                for (j = 0, l = blockTokens.length; j < l; j++) {
                    if (blockTokens[j].type !== 'inline') {
                        continue;
                    }
                    tokens = blockTokens[j].children;

                    // We scan from the end, to keep position when new tags added.
                    // Use reversed logic in links start/end match
                    for (i = tokens.length - 1; i >= 0; i--) {
                        token = tokens[i];

                        if (token.type === 'link_open' || token.type === 'link_close') {
                            if (token.info === 'auto') {
                                autolinkLevel -= token.nesting;
                            }
                        }

                        if (token.type === 'text' && scanRE.test(token.content) && autolinkLevel === 0) {
                            // replace current node
                            blockTokens[j].children = tokens = arrayReplaceAt(
                                tokens, i, splitTextToken(token.content, token.level, state.Token)
                            );
                        }
                    }
                }
            };
        };

    }, {}],
    15: [function(require, module, exports) {
        'use strict';

        var emojies_defs = require('./lib/data/full.json');
        var emojies_shortcuts = require('./lib/data/shortcuts');
        var emoji_html = require('./lib/render');
        var emoji_replace = require('./lib/replace');
        var normalize_opts = require('./lib/normalize_opts');

        module.exports = function emoji_plugin(md, options) {
            var defaults = {
                defs: emojies_defs,
                shortcuts: emojies_shortcuts,
                enabled: []
            };

            var opts = normalize_opts(md.utils.assign({}, defaults, options || {}));

            md.renderer.rules.emoji = emoji_html;

            md.core.ruler.push('emoji', emoji_replace(md, opts.defs, opts.shortcuts, opts.scanRE, opts.replaceRE));
        };

    }, {
        "./lib/data/full.json": 10,
        "./lib/data/shortcuts": 11,
        "./lib/normalize_opts": 12,
        "./lib/render": 13,
        "./lib/replace": 14
    }],
    16: [function(require, module, exports) {
        'use strict';

        let mdInit = function() {
            let options = {
                html: false, // Enable HTML tags in source
                xhtmlOut: false, // Use '/' to close single tags (<br />)
                breaks: true, // Convert '\n' in paragraphs into <br>
                langPrefix: 'language-', // CSS language prefix for fenced blocks
                linkify: true, // autoconvert URL-like texts to links
                typographer: true, // Enable smartypants and other sweet transforms
                highlight: function(str, lang) {
                    if (lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(lang, str).value
                        } catch (__) {}
                    }
                    try {
                        return hljs.highlightAuto(str).value
                    } catch (__) {}
                    return ''
                }
            }
            let mdHtml = window.markdownit(options)
                .use(require('markdown-it-abbr'))
                .use(require('markdown-it-container'), 'warning')
                .use(require('markdown-it-deflist'))
                .use(require('markdown-it-emoji'))
                .use(require('markdown-it-footnote'))
                .use(require('markdown-it-ins'))
                .use(require('markdown-it-mark'))
                .use(require('markdown-it-sub'))
                .use(require('markdown-it-sup'));

            // // Beautify output of parser for html content
            // mdHtml.renderer.rules.table_open = function() {
            //     return '<table class="table table-striped">\n';
            // };
            // // Replace emoji codes with images
            // mdHtml.renderer.rules.emoji = function(token, idx) {
            //     return window.twemoji.parse(token[idx].content);
            // };
            //
            // mdHtml.renderer.rules.paragraph_open = mdHtml.renderer.rules.heading_open = injectLineNumbers;
            return mdHtml
        }

        window.md = mdInit()

    }, {
        "markdown-it-abbr": 1,
        "markdown-it-container": 2,
        "markdown-it-deflist": 3,
        "markdown-it-emoji": 15,
        "markdown-it-footnote": 5,
        "markdown-it-ins": 6,
        "markdown-it-mark": 7,
        "markdown-it-sub": 8,
        "markdown-it-sup": 9
    }]
}, {}, [16]);
