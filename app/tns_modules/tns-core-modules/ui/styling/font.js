function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var font_common_1 = require("./font-common");
var trace_1 = require("../../trace");
var fs = require("../../file-system");
var utils = require("../../utils/utils");
__export(require("./font-common"));
var Font = (function (_super) {
    __extends(Font, _super);
    function Font(family, size, style, weight) {
        return _super.call(this, family, size, style, weight) || this;
    }
    Font.prototype.withFontFamily = function (family) {
        return new Font(family, this.fontSize, this.fontStyle, this.fontWeight);
    };
    Font.prototype.withFontStyle = function (style) {
        return new Font(this.fontFamily, this.fontSize, style, this.fontWeight);
    };
    Font.prototype.withFontWeight = function (weight) {
        return new Font(this.fontFamily, this.fontSize, this.fontStyle, weight);
    };
    Font.prototype.withFontSize = function (size) {
        return new Font(this.fontFamily, size, this.fontStyle, this.fontWeight);
    };
    Font.prototype.getUIFont = function (defaultFont) {
        if (!this._uiFont) {
            this._uiFont = createUIFont(this, defaultFont);
        }
        return this._uiFont;
    };
    Font.prototype.getAndroidTypeface = function () {
        return undefined;
    };
    return Font;
}(font_common_1.FontBase));
Font.default = new Font(undefined, undefined, font_common_1.FontStyle.NORMAL, font_common_1.FontWeight.NORMAL);
exports.Font = Font;
exports.systemFontFamilies = new Set();
exports.systemFonts = new Set();
var areSystemFontSetsValid = false;
function ensureSystemFontSets() {
    if (areSystemFontSetsValid) {
        return;
    }
    var nsFontFamilies = utils.ios.getter(UIFont, UIFont.familyNames);
    for (var i = 0; i < nsFontFamilies.count; i++) {
        var family = nsFontFamilies.objectAtIndex(i);
        exports.systemFontFamilies.add(family);
        var nsFonts = UIFont.fontNamesForFamilyName(family);
        for (var j = 0; j < nsFonts.count; j++) {
            var font = nsFonts.objectAtIndex(j);
            exports.systemFonts.add(font);
        }
    }
    areSystemFontSetsValid = true;
}
exports.ensureSystemFontSets = ensureSystemFontSets;
var DEFAULT_SERIF = "Times New Roman";
var DEFAULT_MONOSPACE = "Courier New";
function getFontFamilyRespectingGenericFonts(fontFamily) {
    if (!fontFamily) {
        return fontFamily;
    }
    switch (fontFamily.toLowerCase()) {
        case font_common_1.genericFontFamilies.serif:
            return DEFAULT_SERIF;
        case font_common_1.genericFontFamilies.monospace:
            return DEFAULT_MONOSPACE;
        default:
            return fontFamily;
    }
}
function createUIFont(font, defaultFont) {
    var size = font.fontSize || defaultFont.pointSize;
    var descriptor;
    var symbolicTraits = 0;
    if (font.isBold) {
        symbolicTraits |= 2;
    }
    if (font.isItalic) {
        symbolicTraits |= 1;
    }
    descriptor = tryResolveWithSystemFont(font, size, symbolicTraits);
    if (!descriptor) {
        descriptor = tryResolveByFamily(font);
    }
    if (!descriptor) {
        descriptor = utils.ios.getter(defaultFont, defaultFont.fontDescriptor).fontDescriptorWithSymbolicTraits(symbolicTraits);
    }
    return UIFont.fontWithDescriptorSize(descriptor, size);
}
function tryResolveWithSystemFont(font, size, symbolicTraits) {
    var systemFont;
    var result;
    switch (font.fontFamily) {
        case font_common_1.genericFontFamilies.sansSerif:
        case font_common_1.genericFontFamilies.system:
            if (UIFont.systemFontOfSizeWeight) {
                systemFont = UIFont.systemFontOfSizeWeight(size, getiOSFontWeight(font.fontWeight));
            }
            else {
                systemFont = UIFont.systemFontOfSize(size);
            }
            result = utils.ios.getter(systemFont, systemFont.fontDescriptor).fontDescriptorWithSymbolicTraits(symbolicTraits);
            break;
        case font_common_1.genericFontFamilies.monospace:
            if (UIFont.monospacedDigitSystemFontOfSizeWeight) {
                systemFont = UIFont.monospacedDigitSystemFontOfSizeWeight(size, getiOSFontWeight(font.fontWeight));
                result = utils.ios.getter(systemFont, systemFont.fontDescriptor).fontDescriptorWithSymbolicTraits(symbolicTraits);
            }
            break;
    }
    if (systemFont) {
        result = utils.ios.getter(systemFont, systemFont.fontDescriptor).fontDescriptorWithSymbolicTraits(symbolicTraits);
        return result;
    }
    return null;
}
function tryResolveByFamily(font) {
    var fonts = font_common_1.parseFontFamily(font.fontFamily);
    var result = null;
    if (fonts.length === 0) {
        return null;
    }
    ensureSystemFontSets();
    for (var i = 0; i < fonts.length; i++) {
        var fontFamily = getFontFamilyRespectingGenericFonts(fonts[i]);
        var fontFace = getiOSFontFace(fontFamily, font.fontWeight, font.isItalic);
        if (exports.systemFonts.has(fontFamily) && !fontFace) {
            result = UIFontDescriptor.fontDescriptorWithNameSize(fontFamily, 0);
        }
        else if (exports.systemFontFamilies.has(fontFamily)) {
            result = createFontDescriptor(fontFamily, fontFace);
        }
        if (result) {
            return result;
        }
    }
    return null;
}
function createFontDescriptor(fontFamily, fontFace) {
    var fontAttributes = NSMutableDictionary.alloc().init();
    fontAttributes.setObjectForKey(fontFamily, "NSFontFamilyAttribute");
    if (fontFace) {
        fontAttributes.setObjectForKey(fontFace, "NSFontFaceAttribute");
    }
    return UIFontDescriptor.fontDescriptorWithFontAttributes(fontAttributes);
}
function getiOSFontWeight(fontWeight) {
    if (!UIFont.systemFontOfSizeWeight) {
        throw new Error("Font weight is available in iOS 8.2 and later.");
    }
    switch (fontWeight) {
        case font_common_1.FontWeight.THIN:
            return UIFontWeightThin;
        case font_common_1.FontWeight.EXTRA_LIGHT:
            return UIFontWeightUltraLight;
        case font_common_1.FontWeight.LIGHT:
            return UIFontWeightLight;
        case font_common_1.FontWeight.NORMAL:
        case "400":
        case undefined:
        case null:
            return UIFontWeightRegular;
        case font_common_1.FontWeight.MEDIUM:
            return UIFontWeightMedium;
        case font_common_1.FontWeight.SEMI_BOLD:
            return UIFontWeightSemibold;
        case font_common_1.FontWeight.BOLD:
        case "700":
            return UIFontWeightBold;
        case font_common_1.FontWeight.EXTRA_BOLD:
            return UIFontWeightHeavy;
        case font_common_1.FontWeight.BLACK:
            return UIFontWeightBlack;
        default:
            throw new Error("Invalid font weight: \"" + fontWeight + "\"");
    }
}
function combineWeightStringWithItalic(weight, isItalic) {
    if (!isItalic) {
        return weight;
    }
    if (!weight) {
        return "Italic";
    }
    return weight + " Italic";
}
function canLoadFont(fontFamily, fontFace) {
    var trialDescriptor = createFontDescriptor(fontFamily, fontFace);
    var trialFont = UIFont.fontWithDescriptorSize(trialDescriptor, 0);
    return trialFont.familyName === fontFamily;
}
function findCorrectWeightString(fontFamily, weightStringAlternatives, isItalic) {
    for (var i = 0, length_1 = weightStringAlternatives.length; i < length_1; i++) {
        var possibleFontFace = combineWeightStringWithItalic(weightStringAlternatives[i], isItalic);
        if (canLoadFont(fontFamily, possibleFontFace)) {
            return weightStringAlternatives[i];
        }
    }
    return weightStringAlternatives[0];
}
function getiOSFontFace(fontFamily, fontWeight, isItalic) {
    var weight;
    switch (fontWeight) {
        case font_common_1.FontWeight.THIN:
            weight = "Thin";
            break;
        case font_common_1.FontWeight.EXTRA_LIGHT:
            weight = findCorrectWeightString(fontFamily, ["Ultra Light", "UltraLight", "Extra Light", "ExtraLight", "Ultra light", "Ultralight", "Extra light", "Extralight"], isItalic);
            break;
        case font_common_1.FontWeight.LIGHT:
            weight = "Light";
            break;
        case font_common_1.FontWeight.NORMAL:
        case "400":
        case undefined:
        case null:
            weight = "";
            break;
        case font_common_1.FontWeight.MEDIUM:
            weight = "Medium";
            break;
        case font_common_1.FontWeight.SEMI_BOLD:
            weight = findCorrectWeightString(fontFamily, ["Demi Bold", "DemiBold", "Semi Bold", "SemiBold", "Demi bold", "Demibold", "Semi bold", "Semibold"], isItalic);
            break;
        case font_common_1.FontWeight.BOLD:
        case "700":
            weight = "Bold";
            break;
        case font_common_1.FontWeight.EXTRA_BOLD:
            weight = findCorrectWeightString(fontFamily, ["Heavy", "Extra Bold", "ExtraBold", "Extra bold", "Extrabold"], isItalic);
            break;
        case font_common_1.FontWeight.BLACK:
            weight = "Black";
            break;
        default:
            throw new Error("Invalid font weight: \"" + fontWeight + "\"");
    }
    return combineWeightStringWithItalic(weight, isItalic);
}
var ios;
(function (ios) {
    function registerFont(fontFile) {
        var filePath = fs.path.join(fs.knownFolders.currentApp().path, "fonts", fontFile);
        if (!fs.File.exists(filePath)) {
            filePath = fs.path.join(fs.knownFolders.currentApp().path, fontFile);
        }
        var fontData = utils.ios.getter(NSFileManager, NSFileManager.defaultManager).contentsAtPath(filePath);
        if (!fontData) {
            throw new Error("Could not load font from: " + fontFile);
        }
        var provider = CGDataProviderCreateWithCFData(fontData);
        var font = CGFontCreateWithDataProvider(provider);
        if (!font) {
            throw new Error("Could not load font from: " + fontFile);
        }
        var error = new interop.Reference();
        if (!CTFontManagerRegisterGraphicsFont(font, error)) {
            if (trace_1.isEnabled()) {
                trace_1.write("Error occur while registering font: " + CFErrorCopyDescription(error.value), trace_1.categories.Error, trace_1.messageType.error);
            }
        }
        areSystemFontSetsValid = false;
    }
    ios.registerFont = registerFont;
})(ios = exports.ios || (exports.ios = {}));
function registerFontsInFolder(fontsFolderPath) {
    var fontsFolder = fs.Folder.fromPath(fontsFolderPath);
    fontsFolder.eachEntity(function (fileEntity) {
        if (fs.Folder.exists(fs.path.join(fontsFolderPath, fileEntity.name))) {
            return true;
        }
        if (fileEntity instanceof fs.File &&
            (fileEntity.extension === ".ttf" || fileEntity.extension === ".otf")) {
            ios.registerFont(fileEntity.name);
        }
        return true;
    });
}
function registerCustomFonts() {
    var appDir = fs.knownFolders.currentApp().path;
    var fontsDir = fs.path.join(appDir, "fonts");
    if (fs.Folder.exists(fontsDir)) {
        registerFontsInFolder(fontsDir);
    }
}
registerCustomFonts();
//# sourceMappingURL=font.js.map