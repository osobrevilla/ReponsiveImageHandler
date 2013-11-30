/*!
 * Rih.js v0.1 ~ Copyright (c) 2013
 * Oscar Sobrevilla oscar.sobrevilla@gmail.com
 * Released under MIT license
 */
/** @expose */
var Rih = (function (window, document, $) {

    var hasOwnProp = Object.prototype.hasOwnProperty;

    if (!Object.keys) Object.keys = function (o) {
        if (o !== Object(o))
            throw 'Object.keys called on a non-object';
        var k = [],
            p;
        for (p in o)
            if (hasOwnProp.call(o, p)) k.push(p);
        return k;
    };

    if (!Object.create) {
        Object.create = (function () {
            function F() {}

            return function (o) {
                if (arguments.length != 1) {
                    throw new Error('Object.create implementation only accepts one parameter.');
                }
                F.prototype = o;
                return new F();
            };
        })();
    }

    var isRetina = window.devicePixelRatio ? window.devicePixelRatio >= 1.2 ? 1 : 0 : 0,
        hasAttr = function () {
            return ("hasAttribute" in document.documentElement) ?
                function (el, attr) {
                    return el.hasAttribute(attr);
            } : function (el, attr) {
                return el.getAttribute(attr) !== null;
            };
        }();

    /**
     * Rih Class
     * @param {NodeList} images
     * @constructor
     */

    function Rih(images) {
        var that = this,
            delay = null,
            i = null,
            resize = function () {
                clearTimeout(delay);
                delay = setTimeout(function () {
                    that.viewPortWidth = that._getViewPortWidth();
                    that._resize();
                }, 25);
            };
        this.viewPortWidth = this._getViewPortWidth();
        this.images = [].slice.call(images, 0);
        this.list = [];

        for (i in this.images) {
            if (hasOwnProp.call(this.images, i))
                this.addImage(this.images[i]);
        }
        if ("addEventListener" in window) {
            window.addEventListener('resize', resize, false);
        } else {
            window.attachEvent('onresize', resize);
        }
    }

    Rih.prototype = Object.create({

        constructor: Rih,

        /** @expose */
        init: function () {
            this._resize();
        },

        /** @expose */
        addImage: function (img) {
            var res = this._parse(img);
            if (res) this.list.push(res);
        },

        _cond: ['<', '>'],

        _sort: function (a, b) {
            if (a > b)
                return 1;
            else if (a < b)
                return -1;
            else
                return 0;
        },

        _resize: function () {
            var obj,
                newSrc = '',
                change = false,
                cond = this._cond,
                viewPortWidth = this.viewPortWidth,
                prevValue,
                nextValue,
                i = 0;

            for (i in this.list) {

                if (hasOwnProp.call(this.list, i)) {

                    obj = this.list[i];

                    _condLoop: for (var c in cond) {

                        if (hasOwnProp.call(cond, c)) {

                            var sizes = Object.keys(obj[cond[c]]).sort(this._sort);

                            for (var s = 0; s < sizes.length; s += 1) {

                                if (cond[c] == '<') {

                                    prevValue = sizes[s] * 1;
                                    nextValue = sizes[s - 1] ? sizes[s - 1] * 1 : undefined;

                                    change = nextValue === undefined ?
                                        viewPortWidth <= prevValue :
                                        viewPortWidth <= prevValue && viewPortWidth > nextValue;

                                } else {

                                    prevValue = sizes[s] * 1;
                                    nextValue = sizes[s + 1] ? sizes[s + 1] * 1 : undefined;

                                    change = nextValue === undefined ?
                                        viewPortWidth >= prevValue :
                                        viewPortWidth >= prevValue && viewPortWidth < nextValue;
                                }

                                if (change) {
                                    newSrc = obj.base + obj[cond[c]][prevValue];
                                    if (obj.img.src !== newSrc)
                                        obj.img.setAttribute('src', newSrc);
                                    break _condLoop;
                                }
                            }

                        }

                    }
                }
            }
        },

        _regExpRules: /([<|>][^,]+)/g,

        _parse: function (img) {

            var srcAttrName,
                baseAttrName,
                rules,
                chunks,
                obj = {
                    img: img,
                    base: '',
                    '<': {},
                    '>': {}
                };

            srcAttrName = isRetina && hasAttr(img, 'data-src2x') ?
                'data-src2x' : 'data-src';

            baseAttrName = isRetina && hasAttr(img, 'data-src-base2x') ?
                'data-src-base2x' : 'data-src-base';

            if (!hasAttr(img, srcAttrName))
                return null;

            obj.base = img.getAttribute(baseAttrName) || '';
            rules = img.getAttribute(srcAttrName).match(this._regExpRules);

            for (var r = 0; r < rules.length; r += 1) {
                chunks = rules[r].substring(1).split(':');
                if (rules[r].indexOf('<') !== -1) {
                    obj['<'][chunks[0]] = chunks[1];
                } else if (rules[r].indexOf('>') !== -1) {
                    obj['>'][chunks[0]] = chunks[1];
                } else {
                    return null;
                }
            }
            return obj;
        },

        _getViewPortWidth: function () {
            return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        }

    });

    // to jQUery Plugin
    if ($) {
        $.fn.extend({
            /** @expose */
            Rih: function () {
                return new Rih(this.toArray());
            }
        });
    }

    return Rih;
}(window, document, window.jQuery));