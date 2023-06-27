"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envs = exports.debugging0 = exports.symbolsAndPunctuation0 = exports.style0 = exports.size0 = exports.font1 = exports.font0 = exports.color2 = exports.classAssignment1 = exports.braketNotation1 = exports.extensibleArrows1 = exports.arrows0 = exports.negatedRelations0 = exports.relations0 = exports.sqrt1 = exports.mathOperators1 = exports.mathOperators0 = exports.binomialCoefficients2 = exports.binomialCoefficients0 = exports.fractions2 = exports.fractions0 = exports.binaryOperators0 = exports.bigOperators0 = exports.macros0 = exports.logicAndSetTheory1 = exports.logicAndSetTheory0 = exports.spacing1 = exports.spacing0 = exports.overlap1 = exports.verticalLayout2 = exports.verticalLayout1 = exports.verticalLayout0 = exports.annotation1 = exports.otherLetters0 = exports.greekLetters0 = exports.delimeterSizing0 = exports.delimiters0 = exports.accents1 = void 0;
//
// Suffixes explained:
// \cmd         -> 0
// \cmd{$1}     -> 1
// \cmd{$1}{$2} -> 2
//
// Use linebreak to mimic the structure of the KaTeX [Support Table](https://katex.org/docs/supported.html)
// source https://github.com/KaTeX/KaTeX/blob/main/docs/supported.md
//
exports.accents1 = [
    'tilde', 'mathring',
    'widetilde', 'overgroup',
    'utilde', 'undergroup',
    'acute', 'vec', 'Overrightarrow',
    'bar', 'overleftarrow', 'overrightarrow',
    'breve', 'underleftarrow', 'underrightarrow',
    'check', 'overleftharpoon', 'overrightharpoon',
    'dot', 'overleftrightarrow', 'overbrace',
    'ddot', 'underleftrightarrow', 'underbrace',
    'grave', 'overline', 'overlinesegment',
    'hat', 'underline', 'underlinesegment',
    'widehat', 'widecheck', 'underbar'
];
exports.delimiters0 = [
    'lparen', 'rparen', 'lceil', 'rceil', 'uparrow',
    'lbrack', 'rbrack', 'lfloor', 'rfloor', 'downarrow',
    'lbrace', 'rbrace', 'lmoustache', 'rmoustache', 'updownarrow',
    'langle', 'rangle', 'lgroup', 'rgroup', 'Uparrow',
    'vert', 'ulcorner', 'urcorner', 'Downarrow',
    'Vert', 'llcorner', 'lrcorner', 'Updownarrow',
    'lvert', 'rvert', 'lVert', 'rVert', 'backslash',
    'lang', 'rang', 'lt', 'gt', 'llbracket', 'rrbracket', 'lBrace', 'rBrace'
];
exports.delimeterSizing0 = [
    'left', 'big', 'bigl', 'bigm', 'bigr',
    'middle', 'Big', 'Bigl', 'Bigm', 'Bigr',
    'right', 'bigg', 'biggl', 'biggm', 'biggr',
    'Bigg', 'Biggl', 'Biggm', 'Biggr'
];
exports.greekLetters0 = [
    'Alpha', 'Beta', 'Gamma', 'Delta',
    'Epsilon', 'Zeta', 'Eta', 'Theta',
    'Iota', 'Kappa', 'Lambda', 'Mu',
    'Nu', 'Xi', 'Omicron', 'Pi',
    'Rho', 'Sigma', 'Tau', 'Upsilon',
    'Phi', 'Chi', 'Psi', 'Omega',
    'varGamma', 'varDelta', 'varTheta', 'varLambda',
    'varXi', 'varPi', 'varSigma', 'varUpsilon',
    'varPhi', 'varPsi', 'varOmega',
    'alpha', 'beta', 'gamma', 'delta',
    'epsilon', 'zeta', 'eta', 'theta',
    'iota', 'kappa', 'lambda', 'mu',
    'nu', 'xi', 'omicron', 'pi',
    'rho', 'sigma', 'tau', 'upsilon',
    'phi', 'chi', 'psi', 'omega',
    'varepsilon', 'varkappa', 'vartheta', 'thetasym',
    'varpi', 'varrho', 'varsigma', 'varphi',
    'digamma'
];
exports.otherLetters0 = [
    'imath', 'nabla', 'Im', 'Reals',
    'jmath', 'partial', 'image', 'wp',
    'aleph', 'Game', 'Bbbk', 'weierp',
    'alef', 'Finv', 'N', 'Z',
    'alefsym', 'cnums', 'natnums',
    'beth', 'Complex', 'R',
    'gimel', 'ell', 'Re',
    'daleth', 'hbar', 'real',
    'eth', 'hslash', 'reals'
];
exports.annotation1 = [
    'cancel', 'overbrace',
    'bcancel', 'underbrace',
    'xcancel', 'not =',
    'sout', 'boxed',
    'phase',
    'tag', 'tag*'
];
exports.verticalLayout0 = ['atop'];
exports.verticalLayout1 = ['substack'];
exports.verticalLayout2 = ['stackrel', 'overset', 'underset', 'raisebox'];
exports.overlap1 = ['mathllap', 'mathrlap', 'mathclap', 'llap', 'rlap', 'clap', 'smash'];
exports.spacing0 = [
    'thinspace', 'medspace', 'thickspace', 'enspace',
    'quad', 'qquad', 'negthinspace', 'negmedspace',
    'nobreakspace', 'negthickspace', 'space', 'mathstrut'
];
exports.spacing1 = [
    'kern', 'mkern', 'mskip', 'hskip',
    'hspace', 'hspace*', 'phantom', 'hphantom', 'vphantom'
];
exports.logicAndSetTheory0 = [
    'forall', 'complement', 'therefore', 'emptyset',
    'exists', 'subset', 'because', 'empty',
    'exist', 'supset', 'mapsto', 'varnothing',
    'nexists', 'mid', 'to', 'implies',
    'in', 'land', 'gets', 'impliedby',
    'isin', 'lor', 'leftrightarrow', 'iff',
    'notin', 'ni', 'notni', 'neg', 'lnot'
];
exports.logicAndSetTheory1 = [
    'Set', 'set'
];
exports.macros0 = [
    'def', 'gdef', 'edef', 'xdef', 'let', 'futurelet', 'global',
    'newcommand', 'renewcommand', 'providecommand',
    'long', 'char', 'mathchoice', 'TextOrMath',
    '@ifstar', '@ifnextchar', '@firstoftwo', '@secondoftwo',
    'relax', 'expandafter', 'noexpand'
];
exports.bigOperators0 = [
    'sum', 'prod', 'bigotimes', 'bigvee',
    'int', 'coprod', 'bigoplus', 'bigwedge',
    'iint', 'intop', 'bigodot', 'bigcap',
    'iiint', 'smallint', 'biguplus', 'bigcup',
    'oint', 'oiint', 'oiiint', 'bigsqcup'
];
exports.binaryOperators0 = [
    'cdot', 'gtrdot', 'pmod',
    'cdotp', 'intercal', 'pod',
    'centerdot', 'land', 'rhd',
    'circ', 'leftthreetimes', 'rightthreetimes',
    'amalg', 'circledast', 'ldotp', 'rtimes',
    'And', 'circledcirc', 'lor', 'setminus',
    'ast', 'circleddash', 'lessdot', 'smallsetminus',
    'barwedge', 'Cup', 'lhd', 'sqcap',
    'bigcirc', 'cup', 'ltimes', 'sqcup',
    'bmod', 'curlyvee', 'times',
    'boxdot', 'curlywedge', 'mp', 'unlhd',
    'boxminus', 'div', 'odot', 'unrhd',
    'boxplus', 'divideontimes', 'ominus', 'uplus',
    'boxtimes', 'dotplus', 'oplus', 'vee',
    'bullet', 'doublebarwedge', 'otimes', 'veebar',
    'Cap', 'doublecap', 'oslash', 'wedge',
    'cap', 'doublecup', 'pm', 'plusmn', 'wr'
];
exports.fractions0 = ['over', 'above'];
exports.fractions2 = ['frac', 'dfrac', 'tfrac', 'cfrac', 'genfrac'];
exports.binomialCoefficients0 = ['choose'];
exports.binomialCoefficients2 = ['binom', 'dbinom', 'tbinom', 'brace', 'brack'];
exports.mathOperators0 = [
    'arcsin', 'cosec', 'deg', 'sec',
    'arccos', 'cosh', 'dim', 'sin',
    'arctan', 'cot', 'exp', 'sinh',
    'arctg', 'cotg', 'hom', 'sh',
    'arcctg', 'coth', 'ker', 'tan',
    'arg', 'csc', 'lg', 'tanh',
    'ch', 'ctg', 'ln', 'tg',
    'cos', 'cth', 'log', 'th',
    'argmax', 'injlim', 'min', 'varinjlim',
    'argmin', 'lim', 'plim', 'varliminf',
    'det', 'liminf', 'Pr', 'varlimsup',
    'gcd', 'limsup', 'projlim', 'varprojlim',
    'inf', 'max', 'sup'
];
exports.mathOperators1 = ['operatorname', 'operatorname*', 'operatornamewithlimits'];
exports.sqrt1 = ['sqrt'];
exports.relations0 = [
    'doteqdot', 'lessapprox', 'smile',
    'eqcirc', 'lesseqgtr', 'sqsubset',
    'eqcolon', 'minuscolon', 'lesseqqgtr', 'sqsubseteq',
    'Eqcolon', 'minuscoloncolon', 'lessgtr', 'sqsupset',
    'approx', 'eqqcolon', 'equalscolon', 'lesssim', 'sqsupseteq',
    'approxcolon', 'Eqqcolon', 'equalscoloncolon', 'll', 'Subset',
    'approxcoloncolon', 'eqsim', 'lll', 'subset', 'sub',
    'approxeq', 'eqslantgtr', 'llless', 'subseteq', 'sube',
    'asymp', 'eqslantless', 'lt', 'subseteqq',
    'backepsilon', 'equiv', 'mid', 'succ',
    'backsim', 'fallingdotseq', 'models', 'succapprox',
    'backsimeq', 'frown', 'multimap', 'succcurlyeq',
    'between', 'ge', 'origof', 'succeq',
    'bowtie', 'geq', 'owns', 'succsim',
    'bumpeq', 'geqq', 'parallel', 'Supset',
    'Bumpeq', 'geqslant', 'perp', 'supset',
    'circeq', 'gg', 'pitchfork', 'supseteq', 'supe',
    'colonapprox', 'ggg', 'prec', 'supseteqq',
    'Colonapprox', 'coloncolonapprox', 'gggtr', 'precapprox', 'thickapprox',
    'coloneq', 'colonminus', 'gt', 'preccurlyeq', 'thicksim',
    'Coloneq', 'coloncolonminus', 'gtrapprox', 'preceq', 'trianglelefteq',
    'coloneqq', 'colonequals', 'gtreqless', 'precsim', 'triangleq',
    'Coloneqq', 'coloncolonequals', 'gtreqqless', 'propto', 'trianglerighteq',
    'colonsim', 'gtrless', 'risingdotseq', 'varpropto',
    'Colonsim', 'coloncolonsim', 'gtrsim', 'shortmid', 'vartriangle',
    'cong', 'imageof', 'shortparallel', 'vartriangleleft',
    'curlyeqprec', 'in', 'isin', 'sim', 'vartriangleright',
    'curlyeqsucc', 'Join', 'simcolon', 'vcentcolon', 'ratio',
    'dashv', 'le', 'simcoloncolon', 'vdash',
    'dblcolon', 'coloncolon', 'leq', 'simeq', 'vDash',
    'doteq', 'leqq', 'smallfrown', 'Vdash',
    'Doteq', 'leqslant', 'smallsmile', 'Vvdash',
];
exports.negatedRelations0 = [
    'gnapprox', 'ngeqslant', 'nsubseteq', 'precneqq',
    'gneq', 'ngtr', 'nsubseteqq', 'precnsim',
    'gneqq', 'nleq', 'nsucc', 'subsetneq',
    'gnsim', 'nleqq', 'nsucceq', 'subsetneqq',
    'gvertneqq', 'nleqslant', 'nsupseteq', 'succnapprox',
    'lnapprox', 'nless', 'nsupseteqq', 'succneqq',
    'lneq', 'nmid', 'ntriangleleft', 'succnsim',
    'lneqq', 'notin', 'ntrianglelefteq', 'supsetneq',
    'lnsim', 'notni', 'ntriangleright', 'supsetneqq',
    'lvertneqq', 'nparallel', 'ntrianglerighteq', 'varsubsetneq',
    'ncong', 'nprec', 'nvdash', 'varsubsetneqq',
    'ne', 'npreceq', 'nvDash', 'varsupsetneq',
    'neq', 'nshortmid', 'nVDash', 'varsupsetneqq',
    'ngeq', 'nshortparallel', 'nVdash',
    'ngeqq', 'nsim', 'precnapprox'
];
exports.arrows0 = [
    'circlearrowleft', 'leftharpoonup', 'rArr',
    'circlearrowright', 'leftleftarrows', 'rarr',
    'curvearrowleft', 'leftrightarrow', 'restriction',
    'curvearrowright', 'Leftrightarrow', 'rightarrow',
    'Darr', 'leftrightarrows', 'Rightarrow',
    'dArr', 'leftrightharpoons', 'rightarrowtail',
    'darr', 'leftrightsquigarrow', 'rightharpoondown',
    'dashleftarrow', 'Lleftarrow', 'rightharpoonup',
    'dashrightarrow', 'longleftarrow', 'rightleftarrows',
    'downarrow', 'Longleftarrow', 'rightleftharpoons',
    'Downarrow', 'longleftrightarrow', 'rightrightarrows',
    'downdownarrows', 'Longleftrightarrow', 'rightsquigarrow',
    'downharpoonleft', 'longmapsto', 'Rrightarrow',
    'downharpoonright', 'longrightarrow', 'Rsh',
    'gets', 'Longrightarrow', 'searrow',
    'Harr', 'looparrowleft', 'swarrow',
    'hArr', 'looparrowright', 'to',
    'harr', 'Lrarr', 'twoheadleftarrow',
    'hookleftarrow', 'lrArr', 'twoheadrightarrow',
    'hookrightarrow', 'lrarr', 'Uarr',
    'iff', 'Lsh', 'uArr',
    'impliedby', 'mapsto', 'uarr',
    'implies', 'nearrow', 'uparrow',
    'Larr', 'nleftarrow', 'Uparrow',
    'lArr', 'nLeftarrow', 'updownarrow',
    'larr', 'nleftrightarrow', 'Updownarrow',
    'leadsto', 'nLeftrightarrow', 'upharpoonleft',
    'leftarrow', 'nrightarrow', 'upharpoonright',
    'Leftarrow', 'nRightarrow', 'upuparrows',
    'leftarrowtail', 'nwarrow', 'leftharpoondown', 'Rarr'
];
exports.extensibleArrows1 = [
    'xleftarrow', 'xrightarrow',
    'xLeftarrow', 'xRightarrow',
    'xleftrightarrow', 'xLeftrightarrow',
    'xhookleftarrow', 'xhookrightarrow',
    'xtwoheadleftarrow', 'xtwoheadrightarrow',
    'xleftharpoonup', 'xrightharpoonup',
    'xleftharpoondown', 'xrightharpoondown',
    'xleftrightharpoons', 'xrightleftharpoons',
    'xtofrom', 'xmapsto',
    'xlongequal'
];
exports.braketNotation1 = ['bra', 'Bra', 'ket', 'Ket', 'braket', 'Braket'];
exports.classAssignment1 = [
    'mathbin', 'mathclose', 'mathinner', 'mathop',
    'mathopen', 'mathord', 'mathpunct', 'mathrel'
];
exports.color2 = ['color', 'textcolor', 'colorbox'];
exports.font0 = ['rm', 'bf', 'it', 'sf', 'tt'];
exports.font1 = [
    'mathrm', 'mathbf', 'mathit',
    'mathnormal', 'textbf', 'textit',
    'textrm', 'bold', 'Bbb',
    'textnormal', 'boldsymbol', 'mathbb',
    'text', 'bm', 'frak',
    'mathsf', 'mathtt', 'mathfrak',
    'textsf', 'texttt', 'mathcal', 'mathscr',
    'pmb'
];
exports.size0 = [
    'Huge', 'huge', 'LARGE', 'Large', 'large',
    'normalsize', 'small', 'footnotesize', 'scriptsize', 'tiny'
];
exports.style0 = [
    'displaystyle', 'textstyle', 'scriptstyle', 'scriptscriptstyle',
    'limits', 'nolimits', 'verb'
];
exports.symbolsAndPunctuation0 = [
    'cdots', 'LaTeX',
    'ddots', 'TeX',
    'ldots', 'nabla',
    'vdots', 'infty',
    'dotsb', 'infin',
    'dotsc', 'checkmark',
    'dotsi', 'dag',
    'dotsm', 'dagger',
    'dotso',
    'sdot', 'ddag',
    'mathellipsis', 'ddagger',
    'Box', 'Dagger',
    'lq', 'square', 'angle',
    'blacksquare', 'measuredangle',
    'rq', 'triangle', 'sphericalangle',
    'triangledown', 'top',
    'triangleleft', 'bot',
    'triangleright',
    'colon', 'bigtriangledown',
    'backprime', 'bigtriangleup', 'pounds',
    'prime', 'blacktriangle', 'mathsterling',
    'blacktriangledown',
    'blacktriangleleft', 'yen',
    'blacktriangleright', 'surd',
    'diamond', 'degree',
    'Diamond',
    'lozenge', 'mho',
    'blacklozenge', 'diagdown',
    'star', 'diagup',
    'bigstar', 'flat',
    'clubsuit', 'natural',
    'copyright', 'clubs', 'sharp',
    'circledR', 'diamondsuit', 'heartsuit',
    'diamonds', 'hearts',
    'circledS', 'spadesuit', 'spades',
    'maltese', 'minuso'
];
exports.debugging0 = ['message', 'errmessage', 'show'];
exports.envs = [
    'matrix', 'array',
    'pmatrix', 'bmatrix',
    'vmatrix', 'Vmatrix',
    'Bmatrix',
    'cases', 'rcases',
    'smallmatrix', 'subarray',
    'equation', 'split', 'align',
    'gather', 'alignat',
    'CD',
    'darray', 'dcases', 'drcases',
    'matrix*', 'pmatrix*', 'bmatrix*',
    'Bmatrix*', 'vmatrix*', 'Vmatrix*',
    'equation*', 'gather*', 'align*', 'alignat*',
    'gathered', 'aligned', 'alignedat'
];
//# sourceMappingURL=katex-funcs.js.map